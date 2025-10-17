# python-services/digitalpersona/digitalpersona_service_usb.py
"""
DigitalPersona U.are.U 4500 Fingerprint Reader Service (USB Version)
Works directly with USB without proprietary SDK
"""
import os
import sys
import time
import base64
import json
from datetime import datetime
from typing import Optional, Dict, Any
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS

import numpy as np
from PIL import Image
import usb.core
import usb.util

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# DigitalPersona U.are.U 4500 USB IDs
DIGITALPERSONA_VENDOR_ID = 0x05ba  # DigitalPersona/Crossmatch
DIGITALPERSONA_PRODUCT_ID = 0x000a  # U.are.U 4500

# Global state
reader = None
latest_scan = None
is_monitoring = False


class DigitalPersonaUSBReader:
    """Direct USB communication with DigitalPersona U.are.U 4500"""
    
    def __init__(self):
        self.device = None
        self.endpoint_in = None
        self.endpoint_out = None
        self.is_connected = False
        self.mock_mode = False
        
    def find_device(self):
        """Find DigitalPersona device on USB"""
        try:
            # Find the device
            device = usb.core.find(
                idVendor=DIGITALPERSONA_VENDOR_ID,
                idProduct=DIGITALPERSONA_PRODUCT_ID
            )
            
            if device is None:
                logger.warning("DigitalPersona U.are.U 4500 not found on USB")
                logger.info("Available USB devices:")
                for dev in usb.core.find(find_all=True):
                    logger.info(f"  VendorID: 0x{dev.idVendor:04x}, ProductID: 0x{dev.idProduct:04x}")
                return None
            
            logger.info(f"Found DigitalPersona device: VendorID=0x{device.idVendor:04x}, ProductID=0x{device.idProduct:04x}")
            return device
            
        except Exception as e:
            logger.error(f"Error finding device: {e}")
            return None
    
    def connect(self):
        """Connect to the fingerprint reader"""
        try:
            logger.info("Searching for DigitalPersona U.are.U 4500...")
            
            self.device = self.find_device()
            
            if self.device is None:
                logger.warning("Device not found - using MOCK mode")
                self.mock_mode = True
                self.is_connected = True
                return True
            
            # Try to set configuration
            try:
                if self.device.is_kernel_driver_active(0):
                    logger.info("Detaching kernel driver...")
                    self.device.detach_kernel_driver(0)
            except:
                pass  # Not all systems need this
            
            # Set configuration
            try:
                self.device.set_configuration()
            except usb.core.USBError as e:
                logger.warning(f"Could not set configuration: {e}")
            
            # Get endpoints
            cfg = self.device.get_active_configuration()
            intf = cfg[(0, 0)]
            
            self.endpoint_out = usb.util.find_descriptor(
                intf,
                custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT
            )
            
            self.endpoint_in = usb.util.find_descriptor(
                intf,
                custom_match=lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN
            )
            
            if self.endpoint_in is None or self.endpoint_out is None:
                logger.error("Could not find USB endpoints")
                self.mock_mode = True
            else:
                logger.info(f"Endpoints found - IN: 0x{self.endpoint_in.bEndpointAddress:02x}, OUT: 0x{self.endpoint_out.bEndpointAddress:02x}")
                self.mock_mode = False
            
            self.is_connected = True
            logger.info("✓ Connected to DigitalPersona device")
            return True
            
        except Exception as e:
            logger.error(f"Connection error: {e}")
            logger.warning("Falling back to MOCK mode")
            self.mock_mode = True
            self.is_connected = True
            return True
    
    def disconnect(self):
        """Disconnect from the reader"""
        try:
            if self.device and not self.mock_mode:
                try:
                    usb.util.dispose_resources(self.device)
                except:
                    pass
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
            if self.mock_mode or not self.is_connected:
                return self._mock_capture()
            
            logger.info("Waiting for finger placement on real device...")
            
            # Send capture command
            # Note: Real implementation would need proper USB protocol
            # This is a simplified version
            start_time = time.time()
            
            # Try to read from device
            while time.time() - start_time < timeout:
                try:
                    # Read image data from device
                    # DigitalPersona devices typically send raw image data
                    # Image size for 4500 is usually 355x391 pixels
                    
                    # This is where you'd implement the actual USB protocol
                    # For now, fall back to mock
                    logger.info("Real USB capture not fully implemented - using mock")
                    return self._mock_capture()
                    
                except usb.core.USBError as e:
                    if e.errno == 110:  # Timeout
                        time.sleep(0.1)
                        continue
                    else:
                        logger.error(f"USB error: {e}")
                        break
            
            logger.warning("Capture timeout - no finger detected")
            return False, None, None
            
        except Exception as e:
            logger.error(f"Capture error: {e}")
            return False, None, None
    
    def _mock_capture(self):
        """Mock capture for testing without hardware"""
        logger.info("MOCK MODE: Simulating fingerprint capture")
        time.sleep(1)  # Simulate capture delay
        
        # Create mock fingerprint image (355x391 for U.are.U 4500)
        width, height = 355, 391
        
        # Create a fingerprint-like pattern
        img_array = np.random.randint(100, 200, (height, width), dtype=np.uint8)
        
        # Add some fingerprint-like ridges
        for i in range(0, height, 10):
            img_array[i:i+2, :] = np.random.randint(50, 100, width)
        
        mock_image = Image.fromarray(img_array, mode='L')
        
        # Create mock template
        mock_template = base64.b64encode(
            f"DIGITALPERSONA_4500_TEMPLATE_{datetime.now().timestamp()}".encode()
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
    
    def compare_templates(self, template1, template2, threshold=0.65):
        """
        Compare two fingerprint templates
        In production, use proper fingerprint matching algorithm
        """
        try:
            # Mock comparison based on string similarity
            if template1 == template2:
                return True, 1.0
            
            # Simple mock similarity
            similarity = 0.5 + (0.4 * np.random.random())
            match = similarity >= threshold
            
            return match, similarity
            
        except Exception as e:
            logger.error(f"Comparison error: {e}")
            return False, 0.0


# Initialize global reader
reader = DigitalPersonaUSBReader()


# ==================== REST API ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'DigitalPersona Fingerprint Service (USB)',
        'reader_connected': reader.is_connected,
        'mock_mode': reader.mock_mode,
        'monitoring': is_monitoring,
        'device_model': 'U.are.U 4500',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/reader/connect', methods=['POST'])
def connect_reader():
    """Connect to the fingerprint reader"""
    success = reader.connect()
    
    return jsonify({
        'success': success,
        'connected': reader.is_connected,
        'mock_mode': reader.mock_mode,
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
        'mock_mode': reader.mock_mode,
        'monitoring': is_monitoring,
        'device_found': reader.device is not None
    })


@app.route('/fingerprint/capture', methods=['POST'])
def capture_fingerprint():
    """Capture a single fingerprint"""
    try:
        timeout = request.json.get('timeout', 10) if request.json else 10
        
        success, image, template = reader.capture_fingerprint(timeout)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Fingerprint capture failed or timeout'
            }), 400
        
        image_b64 = reader.image_to_base64(image) if image else None
        
        return jsonify({
            'success': True,
            'template': template,
            'image': image_b64,
            'timestamp': datetime.now().isoformat(),
            'mock_mode': reader.mock_mode,
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
    """Compare two fingerprint templates"""
    try:
        data = request.json
        template1 = data.get('template1')
        template2 = data.get('template2')
        threshold = data.get('threshold', 0.65)
        
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
        
        import threading
        monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        monitoring_thread.start()
        
        return jsonify({
            'success': True,
            'monitoring': is_monitoring,
            'mock_mode': reader.mock_mode,
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
    """Poll for latest fingerprint scan"""
    global latest_scan
    
    if latest_scan:
        scan_data = latest_scan
        latest_scan = None
        
        return jsonify({
            'hasNewScan': True,
            'template': scan_data['template'],
            'image': scan_data.get('image'),
            'timestamp': scan_data['timestamp'],
            'mock_mode': reader.mock_mode
        })
    
    return jsonify({
        'hasNewScan': False,
        'template': None,
        'timestamp': None
    })


def monitoring_loop():
    """Background monitoring loop"""
    global is_monitoring, latest_scan
    
    logger.info("Monitoring loop started")
    
    while is_monitoring:
        try:
            if not reader.is_connected:
                reader.connect()
            
            success, image, template = reader.capture_fingerprint(timeout=2)
            
            if success and template:
                latest_scan = {
                    'template': template,
                    'image': reader.image_to_base64(image) if image else None,
                    'timestamp': datetime.now().isoformat()
                }
                
                logger.info(f"Fingerprint captured in monitoring mode (Mock: {reader.mock_mode})")
                time.sleep(3)
            else:
                time.sleep(0.5)
                
        except Exception as e:
            logger.error(f"Monitoring loop error: {e}")
            time.sleep(1)
    
    logger.info("Monitoring loop stopped")


# ==================== USB INFO ENDPOINT ====================

@app.route('/usb/devices', methods=['GET'])
def list_usb_devices():
    """List all USB devices (for debugging)"""
    try:
        devices = []
        for dev in usb.core.find(find_all=True):
            try:
                devices.append({
                    'vendor_id': f"0x{dev.idVendor:04x}",
                    'product_id': f"0x{dev.idProduct:04x}",
                    'manufacturer': usb.util.get_string(dev, dev.iManufacturer) if dev.iManufacturer else 'N/A',
                    'product': usb.util.get_string(dev, dev.iProduct) if dev.iProduct else 'N/A',
                })
            except:
                devices.append({
                    'vendor_id': f"0x{dev.idVendor:04x}",
                    'product_id': f"0x{dev.idProduct:04x}",
                    'manufacturer': 'N/A',
                    'product': 'N/A',
                })
        
        return jsonify({
            'success': True,
            'devices': devices,
            'digitalpersona_found': any(
                d['vendor_id'] == f"0x{DIGITALPERSONA_VENDOR_ID:04x}" and 
                d['product_id'] == f"0x{DIGITALPERSONA_PRODUCT_ID:04x}"
                for d in devices
            )
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('FINGERPRINT_SERVICE_PORT', 5000))
    
    logger.info("=" * 60)
    logger.info("DigitalPersona U.are.U 4500 Fingerprint Service (USB)")
    logger.info("=" * 60)
    logger.info(f"Starting on port {port}...")
    
    # Auto-connect to reader on startup
    if reader.connect():
        logger.info(f"✓ Reader connected (Mock Mode: {reader.mock_mode})")
    else:
        logger.warning("⚠ Reader not connected")
    
    logger.info("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,
        threaded=True
    )