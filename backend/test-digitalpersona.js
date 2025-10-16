// backend/test-digitalpersona.js
const usb = require('usb');

console.log('=== Digital Persona Device Test ===\n');

// Check if device is connected
const VENDOR_ID = 0x05ba;
const PRODUCT_IDS = [0x000a, 0x0007, 0x0010, 0x0011];

console.log('1. Scanning for USB devices...');
const devices = usb.getDeviceList();
console.log(`   Found ${devices.length} total USB devices\n`);

console.log('2. Looking for Digital Persona devices...');
let found = false;

for (const device of devices) {
    const desc = device.deviceDescriptor;
    if (desc.idVendor === VENDOR_ID && PRODUCT_IDS.includes(desc.idProduct)) {
        found = true;
        console.log('   ✓ Digital Persona device found!');
        console.log(`   - Vendor ID: 0x${desc.idVendor.toString(16)}`);
        console.log(`   - Product ID: 0x${desc.idProduct.toString(16)}`);
        console.log(`   - Bus: ${device.busNumber}`);
        console.log(`   - Address: ${device.deviceAddress}`);

        // Try to get product name
        const productNames = {
            0x000a: 'U.are.U 4000',
            0x0007: 'U.are.U 4500',
            0x0010: 'U.are.U 5100',
            0x0011: 'U.are.U 5160',
        };
        console.log(`   - Model: ${productNames[desc.idProduct] || 'Unknown'}\n`);

        // Try to open device
        console.log('3. Attempting to open device...');
        try {
            device.open();
            console.log('   ✓ Device opened successfully');

            // Try to get string descriptors
            try {
                device.getStringDescriptor(desc.iProduct, (error, data) => {
                    if (!error && data) {
                        console.log(`   - Product Name: ${data}`);
                    }
                });
            } catch (e) {
                console.log('   - Could not read string descriptor');
            }

            device.close();
            console.log('   ✓ Device closed successfully\n');
        } catch (error) {
            console.log(`   ✗ Error opening device: ${error.message}`);
            console.log('   Note: This is normal on Windows if drivers are installed\n');
        }
    }
}

if (!found) {
    console.log('   ✗ No Digital Persona devices found');
    console.log('\n   Troubleshooting:');
    console.log('   1. Check if device is plugged in');
    console.log('   2. Check if drivers are installed');
    console.log('   3. Try a different USB port');
    console.log('   4. Check Device Manager (Windows) or lsusb (Linux)\n');
}

// Check for Digital Persona SDK
console.log('4. Checking for Digital Persona SDK...');
try {
    const Devices = require('@digitalpersona/devices');
    console.log('   ✓ SDK is installed');
    console.log('   - Package: @digitalpersona/devices\n');
} catch (error) {
    console.log('   ✗ SDK not installed');
    console.log('   Install with: npm install @digitalpersona/devices\n');
}

console.log('=== Test Complete ===');