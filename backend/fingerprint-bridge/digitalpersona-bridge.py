#!/usr/bin/env python3
"""
Digital Persona Fingerprint Bridge - Fixed Parameter Handling
"""

import sys
import time
import base64
import json
import requests
import ctypes
from ctypes import wintypes

# Backend configuration
BACKEND_URL = "http://localhost:3000/api/v1/fingerprint/simulate-scan"

def log(message, level="INFO"):
    """Enhanced logging"""
    timestamp = time.strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")

# Load WinBio DLL
try:
    winbio = ctypes.WinDLL('winbio.dll')
    log("Windows Biometric Framework loaded", "OK")
except Exception as e:
    log(f"Failed to load winbio.dll: {e}", "ERROR")
    sys.exit(1)

# WinBio Constants
WINBIO_TYPE_FINGERPRINT = 8
WINBIO_POOL_SYSTEM = 1
WINBIO_FLAG_DEFAULT = 0
WINBIO_FLAG_RAW = 0x00000001
WINBIO_FLAG_BASIC = 0x00000002

# Biometric purposes
WINBIO_PURPOSE_VERIFY = 1
WINBIO_PURPOSE_IDENTIFY = 2
WINBIO_PURPOSE_ENROLL = 3
WINBIO_PURPOSE_ENROLL_FOR_VERIFICATION = 4
WINBIO_PURPOSE_ENROLL_FOR_IDENTIFICATION = 5
WINBIO_PURPOSE_AUDIT = 6

# Sub-factors
WINBIO_SUBTYPE_NO_INFORMATION = 0
WINBIO_SUBTYPE_ANY = 1

# Error codes
ERROR_CODES = {
    0: "SUCCESS",
    0x80070057: "ERROR_INVALID_PARAMETER",
    0x80070005: "ACCESS_DENIED - Run as Administrator",
    0x80098001: "WINBIO_E_UNKNOWN_ID",
    0x80098002: "WINBIO_E_CANCELED",
    0x80098003: "WINBIO_E_NO_MATCH",
    0x80098004: "WINBIO_E_BAD_CAPTURE - Place finger properly",
    0x80098005: "WINBIO_E_ENROLLMENT_IN_PROGRESS",
    0x8009800E: "WINBIO_E_DATABASE_NO_RESULTS",
}

def get_error_message(error_code):
    """Get human-readable error message"""
    return ERROR_CODES.get(error_code, f"Unknown Error (0x{error_code:X})")

# Correct function signatures
WinBioOpenSession = winbio.WinBioOpenSession
WinBioOpenSession.argtypes = [
    wintypes.ULONG,                      # Factor
    wintypes.ULONG,                      # PoolType
    wintypes.ULONG,                      # Flags
    ctypes.POINTER(wintypes.ULONG),      # UnitArray
    wintypes.ULONG,                      # UnitCount
    wintypes.POINT(),     # DatabaseId (can be NULL)
    ctypes.POINTER(wintypes.HANDLE)      # SessionHandle
]
WinBioOpenSession.restype = wintypes.ULONG

WinBioCloseSession = winbio.WinBioCloseSession
WinBioCloseSession.argtypes = [wintypes.HANDLE]
WinBioCloseSession.restype = wintypes.ULONG

WinBioCaptureSample = winbio.WinBioCaptureSample
WinBioCaptureSample.argtypes = [
    wintypes.HANDLE,                     # SessionHandle
    wintypes.BYTE,                       # Purpose
    wintypes.BYTE,                       # Flags
    ctypes.POINTER(wintypes.ULONG),      # UnitId
    ctypes.POINTER(ctypes.c_void_p),     # Sample
    ctypes.POINTER(wintypes.ULONG),      # SampleSize
    ctypes.POINTER(wintypes.ULONG)       # RejectDetail
]
WinBioCaptureSample.restype = wintypes.ULONG

WinBioFree = winbio.WinBioFree
WinBioFree.argtypes = [ctypes.c_void_p]
WinBioFree.restype = wintypes.ULONG

def send_to_backend(template_base64):
    """Send fingerprint template to backend"""
    try:
        payload = {"template": template_base64}
        response = requests.post(
            BACKEND_URL,
            json=payload,
            timeout=5
        )
        
        if response.status_code == 200:
            log("Fingerprint sent to backend", "OK")
            return True
        else:
            log(f"Backend error: {response.status_code}", "ERROR")
            return False
    except Exception as e:
        log(f"Failed to send to backend: {e}", "ERROR")
        return False

def capture_loop():
    """Main capture loop with corrected parameters"""
    log("\n=== Digital Persona Fingerprint Bridge ===", "INFO")
    log(f"Backend URL: {BACKEND_URL}", "INFO")
    
    # Check backend
    try:
        response = requests.get(BACKEND_URL.replace('/simulate-scan', '/status'), timeout=2)
        log("Backend is reachable\n", "OK")
    except:
        log("WARNING: Cannot reach backend!\n", "WARN")
    
    log("Opening biometric session...", "INFO")
    
    # Open session with correct NULL pointer
    session_handle = wintypes.HANDLE()
    result = WinBioOpenSession(
        WINBIO_TYPE_FINGERPRINT,           # Factor
        WINBIO_POOL_SYSTEM,                # PoolType
        WINBIO_FLAG_DEFAULT,               # Flags
        None,                              # UnitArray (NULL = all units)
        0,                                 # UnitCount
        None,                              # DatabaseId (NULL = default)
        ctypes.byref(session_handle)       # SessionHandle
    )
    
    if result != 0:
        log(f"Failed to open session: {get_error_message(result)}", "ERROR")
        log("\nTroubleshooting:", "INFO")
        log("1. Run PowerShell/CMD as Administrator", "INFO")
        log("2. Check Windows Hello is set up (Settings > Sign-in options)", "INFO")
        log("3. Verify fingerprint works with Windows Hello", "INFO")
        return
    
    log("Biometric session opened successfully!", "OK")
    log("\n" + "="*50, "INFO")
    log("READY - Place your finger on the scanner NOW", "INFO")
    log("="*50 + "\n", "INFO")
    
    capture_count = 0
    poll_count = 0
    
    try:
        while True:
            poll_count += 1
            
            # Prepare output parameters
            unit_id = wintypes.ULONG()
            sample = ctypes.c_void_p()
            sample_size = wintypes.ULONG()
            reject_detail = wintypes.ULONG()
            
            # Capture sample with correct parameters
            result = WinBioCaptureSample(
                session_handle,                      # SessionHandle
                WINBIO_PURPOSE_VERIFY,               # Purpose (changed from 0)
                WINBIO_SUBTYPE_NO_INFORMATION,       # Flags (changed from 0)
                ctypes.byref(unit_id),               # UnitId (must provide)
                ctypes.byref(sample),                # Sample
                ctypes.byref(sample_size),           # SampleSize
                ctypes.byref(reject_detail)          # RejectDetail
            )
            
            # Log every 20 polls
            if poll_count % 20 == 0:
                log(f"Still waiting... (Poll #{poll_count})", "DEBUG")
            
            # Success!
            if result == 0 and sample.value:
                capture_count += 1
                log("\n" + "="*50, "SUCCESS")
                log(f"✓✓✓ FINGERPRINT CAPTURED #{capture_count} ✓✓✓", "SUCCESS")
                log("="*50, "SUCCESS")
                log(f"Unit ID: {unit_id.value}", "INFO")
                log(f"Sample size: {sample_size.value} bytes", "INFO")
                log(f"Reject detail: {reject_detail.value}", "INFO")
                
                try:
                    # Convert to bytes
                    buffer = ctypes.string_at(sample.value, sample_size.value)
                    
                    # Convert to base64
                    template_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    log(f"Template length: {len(template_base64)} chars", "INFO")
                    
                    # Send to backend
                    log("Sending to backend...", "INFO")
                    send_to_backend(template_base64)
                    
                    log("\nWaiting for next scan...\n", "INFO")
                    poll_count = 0
                    time.sleep(2)
                    
                finally:
                    # Free memory
                    WinBioFree(sample)
            
            # Bad capture - finger not positioned well
            elif result == 0x80098004:
                if poll_count == 1:
                    log("Waiting for finger... (place finger firmly on sensor)", "DEBUG")
            
            # Other errors
            elif result != 0 and poll_count % 20 == 0:
                log(f"Status: {get_error_message(result)}", "DEBUG")
            
            time.sleep(0.3)
            
    except KeyboardInterrupt:
        log("\n\nStopping capture...", "INFO")
    finally:
        # Close session
        WinBioCloseSession(session_handle)
        log("Session closed", "OK")
        log(f"Total captures: {capture_count}", "INFO")

if __name__ == "__main__":
    try:
        capture_loop()
    except Exception as e:
        log(f"Fatal error: {e}", "ERROR")
        import traceback
        traceback.print_exc()