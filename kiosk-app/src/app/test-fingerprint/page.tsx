// kiosk/src/app/test-fingerprint/page.tsx
'use client';

import { useState } from 'react';

export default function TestFingerprint() {
  const [status, setStatus] = useState<string>('Not started');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const testConnection = async () => {
    setStatus('Testing connection...');
    addLog('Testing connection to backend...');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/fingerprint/devices');
      const data = await response.json();
      addLog('✓ Connection successful');
      addLog(JSON.stringify(data, null, 2));
      setResult(data);
      setStatus('Connected');
    } catch (error: any) {
      addLog(`✗ Connection failed: ${error.message}`);
      setStatus('Failed');
    }
  };

  const startMonitoring = async () => {
    setStatus('Starting monitoring...');
    addLog('Starting fingerprint monitoring...');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/fingerprint/start-monitoring', {
        method: 'POST',
      });
      const data = await response.json();
      addLog('✓ Monitoring started');
      addLog(JSON.stringify(data, null, 2));
      setStatus('Monitoring');
    } catch (error: any) {
      addLog(`✗ Failed to start monitoring: ${error.message}`);
      setStatus('Failed');
    }
  };

  const testCapture = async () => {
    setStatus('Testing capture...');
    addLog('Testing manual capture...');
    addLog('>>> PLACE YOUR FINGER ON THE DEVICE NOW <<<');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/fingerprint/test-capture', {
        method: 'POST',
      });
      const data = await response.json();
      addLog('Capture result received');
      addLog(JSON.stringify(data, null, 2));
      setResult(data);
      
      if (data.captureResult?.success) {
        setStatus('✓ Capture successful!');
      } else {
        setStatus('✗ Capture failed');
      }
    } catch (error: any) {
      addLog(`✗ Capture test failed: ${error.message}`);
      setStatus('Failed');
    }
  };

  const pollForScan = async () => {
    setStatus('Polling...');
    addLog('Polling for fingerprint scan...');
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/fingerprint/poll');
      const data = await response.json();
      addLog(JSON.stringify(data, null, 2));
      
      if (data.hasNewScan) {
        setStatus('✓ Scan detected!');
        addLog('✓ New scan detected!');
      } else {
        setStatus('No scan detected');
        addLog('No new scan');
      }
      
      setResult(data);
    } catch (error: any) {
      addLog(`✗ Poll failed: ${error.message}`);
      setStatus('Failed');
    }
  };

  const simulateScan = async () => {
    setStatus('Simulating...');
    addLog('Simulating a fingerprint scan...');
    
    const mockTemplate = btoa('MOCK_FINGERPRINT_' + Date.now());
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/fingerprint/simulate-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: mockTemplate }),
      });
      const data = await response.json();
      addLog('✓ Scan simulated');
      addLog(JSON.stringify(data, null, 2));
      setStatus('Simulated');
    } catch (error: any) {
      addLog(`✗ Simulation failed: ${error.message}`);
      setStatus('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fingerprint Device Test</h1>
        <p className="text-gray-600 mb-6">Debug tool for fingerprint devices</p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
            <div className="text-xl font-semibold">{status}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={testConnection}
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              1. Test Connection
            </button>
            
            <button
              onClick={startMonitoring}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              2. Start Monitoring
            </button>
            
            <button
              onClick={testCapture}
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              3. Test Capture
            </button>
            
            <button
              onClick={pollForScan}
              className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              4. Poll for Scan
            </button>
            
            <button
              onClick={simulateScan}
              className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              5. Simulate Scan
            </button>

            <button
              onClick={() => {
                setLogs([]);
                setResult(null);
                setStatus('Cleared');
              }}
              className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Console Logs</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Last Result</h2>
            <div className="bg-gray-100 p-4 rounded font-mono text-xs h-96 overflow-y-auto">
              {result ? (
                <pre>{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <div className="text-gray-500">No results yet...</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Test Connection" - Should show device info</li>
            <li>Click "Start Monitoring" - Backend starts listening</li>
            <li>Place finger on device, click "Test Capture" - Should capture</li>
            <li>Click "Poll for Scan" - Should show if scan is available</li>
            <li>Or click "Simulate Scan" to test without device</li>
          </ol>
        </div>
      </div>
    </div>
  );
}