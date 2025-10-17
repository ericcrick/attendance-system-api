# python-services/digitalpersona/digitalpersona_service.py
"""
DigitalPersona U.are.U 4500 Fingerprint Reader Service
Real-time fingerprint capture and template extraction
"""
import os
import sys
import time
import base64
import json
from datetime import datetime
from typing import Optional, Dict, Any
import logging

# Flask for REST API
from flask import Flask, jsonify, request
from flask_cors import CORS

# Image processing
import numpy as np
from PIL import Image

# DigitalPersona SDK
try:
    import dpfpdd
    DPFPDD_AVAILABLE = True
except ImportError:
    DPFPDD_AVAILABLE = False
    print("WARNING: dpfpdd not available. Using mock mode.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global state
reader = None
latest_scan = None
is_monitoring = False
scan_callback = None


class DigitalPersonaReader:
    """Wrapper for DigitalPersona U.are.U 4500 Reader"""
    
    def __init__(self):
        self.reader = None
        self.template = None
        self.image = None
        self.is_connected = False
        
    def connect(self):
        """Connect to the fingerprint reader"""
        try:
            if not DPFPDD_AVAILABLE:
                logger.warning("dpfpdd not available - using mock mode")
                self.is_connected = True
                return True
                
            # Initialize the reader
            self.reader = dpfpdd.Reader()
            
            # Get list of readers
            readers = dpfpdd.get_readers()
            
            if not readers:
                logger.error("No DigitalPersona readers found")
                return False
            
            # Connect to first available reader
            self.reader.open(readers[0])
            self.is_connected = True
            logger.info(f"Connected to reader: {readers[0]}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to reader: {e}")
            self.is_connected = False
            return False
    
    def disconnect(self):
        """Disconnect from the reader"""
        try:
            if self.reader and DPFPDD_AVAILABLE:
                self.reader.close()
            self.is_connected = False
            logger.info("Disconnected from reader")
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
    
    def capture_fingerprint(self, timeout=10):
        """
        Capture a fingerprint image
        Returns: (success, image_data, template_data)
        """
        try:
            if not DPFPDD_AVAILABLE:
                # Mock mode for testing
                return self._mock_capture()
            
            if not self.is_connected:
                self.connect()
            
            # Capture fingerprint image
            logger.info("Waiting for finger placement...")
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                try:
                    # Capture image from reader
                    fid = self.reader.capture(dpfpdd.QUALITY_GOOD)
                    
                    if fid:
                        # Convert to image
                        self.image = self._fid_to_image(fid)
                        
                        # Extract template
                        self.template = self._extract_template(fid)
                        
                        logger.info("Fingerprint captured successfully")
                        
                        return True, self.image, self.template
                        
                except dpfpdd.ReaderException as e:
                    # Reader is waiting for finger
                    time.sleep(0.1)
                    continue
            
            logger.warning("Capture timeout - no finger detected")
            return False, None, None
            
        except Exception as e:
            logger.error(f"Capture error: {e}")
            return False, None, None
    
    def _extract_template(self, fid):
        """Extract fingerprint template from FID"""
        try:
            if not DPFPDD_AVAILABLE:
                return base64.b64encode(b"MOCK_TEMPLATE_DATA").decode()
            
            # Create feature set
            feature_set = dpfpdd.create_fmd(fid, dpfpdd.FMD_FORMAT_ANSI_378_2004)
            
            # Convert to base64
            template_bytes = bytes(feature_set)
            template_b64 = base64.b64encode(template_bytes).decode()
            
            return template_b64
            
        except Exception as e:
            logger.error(f"Template extraction error: {e}")
            return None
    
    def _fid_to_image(self, fid):
        """Convert FID to PIL Image"""
        try:
            if not DPFPDD_AVAILABLE:
                # Create mock image
                img_array = np.random.randint(0, 255, (500, 400), dtype=np.uint8)
                return Image.fromarray(img_array, mode='L')
            
            # Get image data from FID
            width = fid.width
            height = fid.height
            data = fid.data
            
            # Create numpy array
            img_array = np.frombuffer(data, dtype=np.uint8)
            img_array = img_array.reshape((height, width))
            
            # Convert to PIL Image
            return Image.fromarray(img_array, mode='L')
            
        except Exception as e:
            logger.error(f"Image conversion error: {e}")
            return None
    
    def _mock_capture(self):
        """Mock capture for testing without hardware"""
        logger.info("MOCK MODE: Simulating fingerprint capture")
        time.sleep(1)  # Simulate capture delay
        
        # Create mock grayscale fingerprint image
        img_array = np.random.randint(100, 200, (500, 400), dtype=np.uint8)
        mock_image = Image.fromarray(img_array, mode='L')
        
        # Create mock template
        mock_template = base64.b64encode(
            f"MOCK_TEMPLATE_{datetime.now().timestamp()}".encode()
        ).decode()
        
        return True, mock_image, mock_template
    
    def image_to_base64(self, image):
        """Convert PIL Image to base64 string"""
        try:
            from io import BytesIO
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return img_str
        except Exception as e:
            logger.error(f"Image encoding error: {e}")
            return None
    
    def compare_templates(self, template1, template2, threshold=0.6):
        """
        Compare two fingerprint templates
        Returns: (match, similarity_score)
        """
        try:
            if not DPFPDD_AVAILABLE:
                # Mock comparison
                return True, 0.85
            
            # Decode base64 templates
            t1_bytes = base64.b64decode(template1)
            t2_bytes = base64.b64decode(template2)
            
            # Compare using DigitalPersona SDK
            result = dpfpdd.compare(t1_bytes, t2_bytes)
            
            # result is dissimilarity score (0 = identical, higher = more different)
            similarity = 1.0 - (result / 100000.0)
            match = similarity >= threshold
            
            return match, similarity
            
        except Exception as e:
            logger.error(f"Comparison error: {e}")
            return False, 0.0


# Initialize global reader
reader = DigitalPersonaReader()


# ==================== REST API ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'DigitalPersona Fingerprint Service',
        'reader_connected': reader.is_connected,
        'monitoring': is_monitoring,
        'dpfpdd_available': DPFPDD_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/reader/connect', methods=['POST'])
def connect_reader():
    """Connect to the fingerprint reader"""
    success = reader.connect()
    
    return jsonify({
        'success': success,
        'connected': reader.is_connected,
        'message': 'Connected successfully' if success else 'Connection failed'
    })


@app.route('/reader/disconnect', methods=['POST'])
def disconnect_reader():
    """Disconnect from the fingerprint reader"""
    reader.disconnect()
    
    return jsonify({
        'success': True,
        'connected': reader.is_connected,
        'message': 'Disconnected successfully'
    })


@app.route('/reader/status', methods=['GET'])
def reader_status():
    """Get reader connection status"""
    return jsonify({
        'connected': reader.is_connected,
        'monitoring': is_monitoring,
        'dpfpdd_available': DPFPDD_AVAILABLE
    })


@app.route('/fingerprint/capture', methods=['POST'])
def capture_fingerprint():
    """
    Capture a single fingerprint
    Returns image and template
    """
    try:
        timeout = request.json.get('timeout', 10) if request.json else 10
        
        success, image, template = reader.capture_fingerprint(timeout)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Fingerprint capture failed or timeout'
            }), 400
        
        # Convert image to base64
        image_b64 = reader.image_to_base64(image) if image else None
        
        return jsonify({
            'success': True,
            'template': template,
            'image': image_b64,
            'timestamp': datetime.now().isoformat(),
            'message': 'Fingerprint captured successfully'
        })
        
    except Exception as e:
        logger.error(f"Capture endpoint error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/fingerprint/compare', methods=['POST'])
def compare_fingerprints():
    """
    Compare two fingerprint templates
    Body: { template1, template2, threshold }
    """
    try:
        data = request.json
        template1 = data.get('template1')
        template2 = data.get('template2')
        threshold = data.get('threshold', 0.6)
        
        if not template1 or not template2:
            return jsonify({
                'success': False,
                'message': 'Both templates required'
            }), 400
        
        match, similarity = reader.compare_templates(template1, template2, threshold)
        
        return jsonify({
            'success': True,
            'match': match,
            'similarity': similarity,
            'threshold': threshold
        })
        
    except Exception as e:
        logger.error(f"Compare endpoint error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/monitoring/start', methods=['POST'])
def start_monitoring():
    """Start continuous monitoring mode"""
    global is_monitoring
    
    try:
        if not reader.is_connected:
            reader.connect()
        
        is_monitoring = True
        
        # Start monitoring in background thread
        import threading
        monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        monitoring_thread.start()
        
        return jsonify({
            'success': True,
            'monitoring': is_monitoring,
            'message': 'Monitoring started'
        })
        
    except Exception as e:
        logger.error(f"Start monitoring error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/monitoring/stop', methods=['POST'])
def stop_monitoring():
    """Stop continuous monitoring mode"""
    global is_monitoring, latest_scan
    
    is_monitoring = False
    latest_scan = None
    
    return jsonify({
        'success': True,
        'monitoring': is_monitoring,
        'message': 'Monitoring stopped'
    })


@app.route('/monitoring/poll', methods=['GET'])
def poll_latest_scan():
    """
    Poll for latest fingerprint scan
    Used by kiosk clients
    """
    global latest_scan
    
    if latest_scan:
        scan_data = latest_scan
        latest_scan = None  # Clear after retrieval
        
        return jsonify({
            'hasNewScan': True,
            'template': scan_data['template'],
            'image': scan_data.get('image'),
            'timestamp': scan_data['timestamp']
        })
    
    return jsonify({
        'hasNewScan': False,
        'template': None,
        'timestamp': None
    })


def monitoring_loop():
    """
    Background monitoring loop
    Continuously captures fingerprints when monitoring is active
    """
    global is_monitoring, latest_scan
    
    logger.info("Monitoring loop started")
    
    while is_monitoring:
        try:
            if not reader.is_connected:
                reader.connect()
            
            # Capture fingerprint (with short timeout for continuous monitoring)
            success, image, template = reader.capture_fingerprint(timeout=2)
            
            if success and template:
                # Store latest scan
                latest_scan = {
                    'template': template,
                    'image': reader.image_to_base64(image) if image else None,
                    'timestamp': datetime.now().isoformat()
                }
                
                logger.info(f"Fingerprint captured in monitoring mode")
                
                # Wait before next capture to avoid duplicates
                time.sleep(3)
            else:
                # No finger detected, wait briefly
                time.sleep(0.5)
                
        except Exception as e:
            logger.error(f"Monitoring loop error: {e}")
            time.sleep(1)
    
    logger.info("Monitoring loop stopped")


# ==================== MAIN ====================

if __name__ == '__main__':
    port = int(os.getenv('FINGERPRINT_SERVICE_PORT', 5000))
    
    logger.info("=" * 60)
    logger.info("DigitalPersona U.are.U 4500 Fingerprint Service")
    logger.info("=" * 60)
    logger.info(f"Starting on port {port}...")
    logger.info(f"DPFPDD SDK Available: {DPFPDD_AVAILABLE}")
    
    if not DPFPDD_AVAILABLE:
        logger.warning("Running in MOCK MODE - no actual hardware connection")
        logger.warning("For production, install: pip install dpfpdd")
    
    # Auto-connect to reader on startup
    if reader.connect():
        logger.info("✓ Reader connected on startup")
    else:
        logger.warning("⚠ Reader not connected - will retry on first use")
    
    logger.info("=" * 60)
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )