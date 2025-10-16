#!/usr/bin/env python3
"""
Quick Windows Hello Fingerprint Test
"""

import ctypes
from ctypes import wintypes
import sys

print("=== Windows Hello Fingerprint Test ===\n")

# Load WinBio
try:
    winbio = ctypes.WinDLL('winbio.dll')
    print("✓ WinBio loaded\n")
except:
    print("✗ Cannot load WinBio")
    sys.exit(1)

# Define functions
WinBioEnumDatabases = winbio.WinBioEnumDatabases
WinBioEnumDatabases.argtypes = [
    wintypes.ULONG,
    ctypes.POINTER(ctypes.c_void_p),
    ctypes.POINTER(wintypes.ULONG)
]
WinBioEnumDatabases.restype = wintypes.ULONG

WinBioFree = winbio.WinBioFree
WinBioFree.argtypes = [ctypes.c_void_p]

# Check databases
print("Checking biometric databases...")
databases_ptr = ctypes.c_void_p()
count = wintypes.ULONG()

result = WinBioEnumDatabases(8, ctypes.byref(databases_ptr), ctypes.byref(count))

if result == 0:
    print(f"✓ Found {count.value} database(s)\n")
    WinBioFree(databases_ptr)
    
    if count.value == 0:
        print("⚠ No fingerprints enrolled!")
        print("\nTo fix:")
        print("1. Press Win + I (Settings)")
        print("2. Go to: Accounts > Sign-in options")
        print("3. Click 'Fingerprint recognition (Windows Hello)'")
        print("4. Click 'Set up' and add your fingerprint")
        print("5. Run this test again")
    else:
        print("✓ Fingerprints are enrolled!")
        print("Windows Hello should work.")
        print("\nNow run the main bridge:")
        print("python digitalpersona-bridge.py")
else:
    print(f"✗ Error checking databases: 0x{result:X}")
    print("\nRun as Administrator and try again")