// //src/components/auth/FacialAuth.tsx

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Camera, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import * as faceapi from 'face-api.js';
// import { attendanceApi } from '@/lib/api-client';
// import { AuthMethod } from '@/types';

// interface FacialAuthProps {
//   onSuccess: (data: any) => void;
// }

// interface AlertMessage {
//   type: 'success' | 'error';
//   message: string;
// }

// export default function FacialAuth({ onSuccess }: FacialAuthProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const detectionCountRef = useRef(0);
//   const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
//   const [loading, setLoading] = useState(false);
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [alert, setAlert] = useState<AlertMessage | null>(null);
//   const [capturing, setCapturing] = useState(false);
//   const [faceDetected, setFaceDetected] = useState(false);
//   const [countdown, setCountdown] = useState<number | null>(null);
//   const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
//   const [storedFaceEncoding, setStoredFaceEncoding] = useState<number[] | null>(null);

//   useEffect(() => {
//     loadModels();
//     return () => {
//       stopCamera();
//       if (captureTimeoutRef.current) {
//         clearTimeout(captureTimeoutRef.current);
//       }
//     };
//   }, []);

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => {
//         track.stop();
//         console.log('Camera track stopped');
//       });
//       setStream(null);
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//       }
//     }
//   };

//   const showAlert = (type: 'success' | 'error', message: string) => {
//     setAlert({ type, message });
//     setTimeout(() => setAlert(null), 4000);
//   };

//   const loadModels = async () => {
//     try {
//       console.log('Loading face detection models...');
//       await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
//       await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
//       await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
//       console.log('✓ Face detection models loaded successfully');
//       setModelsLoaded(true);
//       startCamera();
//     } catch (err) {
//       console.error('Failed to load models:', err);
//       setError('Failed to load face detection models');
//       showAlert('error', 'Failed to initialize face detection system');
//     }
//   };

//   const startCamera = async () => {
//     try {
//       console.log('Starting camera...');
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//       });
//       setStream(mediaStream);
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//       console.log('Camera started successfully');
//     } catch (err) {
//       console.error('Camera access error:', err);
//       setError('Failed to access camera');
//       showAlert('error', 'Camera access denied');
//     }
//   };

//   const detectFace = async () => {
//     if (!videoRef.current || !canvasRef.current || capturing) return;

//     const detection = await faceapi
//       .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     const ctx = canvasRef.current.getContext('2d');
//     if (!ctx) return;

//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//     if (detection) {
//       setFaceDetected(true);
      
//       const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
//       const resizedDetection = faceapi.resizeResults(detection, dims);
      
//       faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
//       faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);

//       detectionCountRef.current += 1;

//       if (detectionCountRef.current >= 20 && !verifiedEmployee) {
//         if (detectionCountRef.current === 20) {
//           setCountdown(3);
//         } else if (detectionCountRef.current === 30) {
//           setCountdown(2);
//         } else if (detectionCountRef.current === 40) {
//           setCountdown(1);
//         } else if (detectionCountRef.current >= 50) {
//           handleAutoCapture();
//         }
//       }
//     } else {
//       setFaceDetected(false);
//       detectionCountRef.current = 0;
//       setCountdown(null);
      
//       if (captureTimeoutRef.current) {
//         clearTimeout(captureTimeoutRef.current);
//         captureTimeoutRef.current = null;
//       }
//     }
//   };

//   useEffect(() => {
//     if (modelsLoaded && videoRef.current && !verifiedEmployee && !capturing && stream) {
//       const interval = setInterval(detectFace, 100);
//       return () => clearInterval(interval);
//     }
//   }, [modelsLoaded, verifiedEmployee, capturing, stream]);

//   const handleAutoCapture = async () => {
//     if (!videoRef.current || capturing) return;

//     setCapturing(true);
//     setCountdown(null);
//     setError(null);
//     detectionCountRef.current = 0;

//     try {
//       const detection = await faceapi
//         .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         setError('No face detected. Please position your face in the frame.');
//         showAlert('error', 'No face detected');
//         setCapturing(false);
//         return;
//       }

//       const faceEncoding = Array.from(detection.descriptor);
//       setStoredFaceEncoding(faceEncoding);

//       setLoading(true);
//       const response: any = await attendanceApi.verify({
//         method: AuthMethod.FACIAL,
//         faceEncoding,
//       });

//       setVerifiedEmployee(response.employee);
//       showAlert('success', `Welcome, ${response.employee.fullName}!`);
      
//       stopCamera();
//     } catch (err: any) {
//       const errorMsg = err.message || 'Face not recognized';
//       setError(errorMsg);
//       showAlert('error', errorMsg);
//       setStoredFaceEncoding(null);
//       setTimeout(() => {
//         setError(null);
//       }, 3000);
//     } finally {
//       setLoading(false);
//       setCapturing(false);
//     }
//   };

//   const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
//     if (!storedFaceEncoding) {
//       setError('No face encoding available. Please scan again.');
//       showAlert('error', 'No face encoding available');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const data = {
//         employeeId: verifiedEmployee.id,
//         method: AuthMethod.FACIAL,
//         faceEncoding: storedFaceEncoding,
//         location: process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-001',
//       };

//       const response =
//         actionType === 'clock-in'
//           ? await attendanceApi.clockIn(data)
//           : await attendanceApi.clockOut(data);

//       const actionText = actionType === 'clock-in' ? 'in' : 'out';
//       showAlert('success', `Successfully clocked ${actionText}!`);

//       onSuccess({
//         action: actionType,
//         employee: verifiedEmployee,
//         attendance: response,
//       });

//       setTimeout(() => {
//         setVerifiedEmployee(null);
//         setStoredFaceEncoding(null);
//         setFaceDetected(false);
//         detectionCountRef.current = 0;
        
//         startCamera();
//       }, 2000);
//     } catch (err: any) {
//       const errorMsg = err.message || 'Failed to process attendance';
//       setError(errorMsg);
//       showAlert('error', errorMsg);
//       setTimeout(() => {
//         setError(null);
//       }, 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setVerifiedEmployee(null);
//     setStoredFaceEncoding(null);
//     setError(null);
//     setAlert(null);
//     detectionCountRef.current = 0;
//     setCountdown(null);
    
//     stopCamera();
//     showAlert('success', 'Ready for next employee');
//     setTimeout(() => {
//       startCamera();
//     }, 500);
//   };

//   if (verifiedEmployee && !loading) {
//     return (
//       <div className="text-center">
//         <div className="mb-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
//           <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
//           <span>Camera Off</span>
//         </div>

//         {alert && (
//           <div className={`mb-4 p-3 rounded flex items-center space-x-2 text-sm ${
//             alert.type === 'success'
//               ? 'bg-green-50 border border-green-200 text-green-800'
//               : 'bg-red-50 border border-red-200 text-red-800'
//           }`}>
//             {alert.type === 'success' ? (
//               <CheckCircle className="w-4 h-4 flex-shrink-0" />
//             ) : (
//               <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             )}
//             <p className="font-medium">{alert.message}</p>
//           </div>
//         )}

//         <div className="mb-4">
//           <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded mb-3">
//             <CheckCircle className="w-7 h-7 text-green-600" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-1">
//             Welcome, {verifiedEmployee.fullName}!
//           </h3>
//           <p className="text-sm text-gray-600">
//             {verifiedEmployee.department} • {verifiedEmployee.position}
//           </p>
//           <div className="mt-2 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-medium">
//             Shift: {verifiedEmployee.shift.name}
//           </div>
//         </div>

//         <div className="flex gap-3 justify-center">
//           <button
//             onClick={() => handleClockAction('clock-in')}
//             disabled={loading}
//             className="px-6 py-2.5 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <span className="flex items-center space-x-2">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span>Processing...</span>
//               </span>
//             ) : (
//               'Clock In'
//             )}
//           </button>
//           <button
//             onClick={() => handleClockAction('clock-out')}
//             disabled={loading}
//             className="px-6 py-2.5 bg-orange-600 text-white text-sm rounded font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <span className="flex items-center space-x-2">
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 <span>Processing...</span>
//               </span>
//             ) : (
//               'Clock Out'
//             )}
//           </button>
//         </div>

//         <button
//           onClick={handleReset}
//           disabled={loading}
//           className="mt-3 text-gray-600 hover:text-gray-900 text-xs disabled:text-gray-400"
//         >
//           Not you? Scan again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="text-center">
//       {alert && (
//         <div className={`mb-4 p-3 rounded flex items-center space-x-2 text-sm ${
//           alert.type === 'success'
//             ? 'bg-green-50 border border-green-200 text-green-800'
//             : 'bg-red-50 border border-red-200 text-red-800'
//         }`}>
//           {alert.type === 'success' ? (
//             <CheckCircle className="w-4 h-4 flex-shrink-0" />
//           ) : (
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//           )}
//           <p className="font-medium">{alert.message}</p>
//         </div>
//       )}

//       <div className="mb-6">
//         <div className={`inline-flex items-center justify-center w-16 h-16 rounded mb-4 transition-colors ${
//           capturing ? 'bg-blue-100 animate-pulse' : 
//           countdown ? 'bg-orange-100 animate-pulse' :
//           'bg-blue-50'
//         }`}>
//           {countdown ? (
//             <span className="text-2xl font-bold text-orange-700">{countdown}</span>
//           ) : (
//             <Camera className="w-8 h-8 text-blue-600" />
//           )}
//         </div>
//         <h3 className="text-xl font-semibold text-gray-900 mb-1">
//           {capturing ? 'Scanning Face...' : 
//            countdown ? `Capturing in ${countdown}...` :
//            'Position Your Face'}
//         </h3>
//         <p className="text-sm text-gray-600">
//           {capturing
//             ? 'Please hold still while we identify you'
//             : countdown
//             ? 'Hold still!'
//             : 'Look directly at the camera'}
//         </p>
//       </div>

//       <div className="max-w-md mx-auto mb-4">
//         <div className="relative bg-black rounded overflow-hidden shadow-lg">
//           <video
//             ref={videoRef}
//             autoPlay
//             muted
//             playsInline
//             className="w-full"
//           />
//           <canvas
//             ref={canvasRef}
//             className="absolute top-0 left-0 w-full h-full"
//           />

//           <div className="absolute top-2 right-2">
//             <div className={`px-2 py-1 rounded text-xs font-medium ${
//               faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//             }`}>
//               {faceDetected ? '✓ Face Detected' : '✗ No Face'}
//             </div>
//           </div>

//           {countdown && (
//             <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
//               <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
//                 {countdown}
//               </div>
//             </div>
//           )}

//           <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/50 px-2 py-1 rounded">
//             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
//             <span className="text-white text-xs font-medium">Live</span>
//           </div>

//           {capturing && (
//             <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
//               <Loader2 className="w-12 h-12 text-white animate-spin" />
//             </div>
//           )}
//         </div>
//       </div>

//       {!capturing && !countdown && modelsLoaded && (
//         <div className="max-w-md mx-auto mb-3">
//           <div className="flex items-center justify-center space-x-2">
//             <div className={`w-2 h-2 rounded-full ${
//               faceDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
//             }`} />
//             <span className="text-xs text-gray-600">
//               {faceDetected ? 'Ready - Hold your position' : 'Waiting for face...'}
//             </span>
//           </div>
//         </div>
//       )}

//       {!modelsLoaded && (
//         <div className="max-w-md mx-auto mb-3 p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-center space-x-2">
//           <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
//           <span className="text-xs text-blue-800">Loading face detection models...</span>
//         </div>
//       )}

//       {error && !alert && (
//         <div className="max-w-md mx-auto mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
//           <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
//           <div className="flex-1 text-left">
//             <p className="font-medium text-red-900 text-sm">Recognition Failed</p>
//             <p className="text-xs text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {!error && !alert && modelsLoaded && (
//         <div className="max-w-md mx-auto mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
//           <h4 className="font-medium text-blue-900 text-sm mb-1.5">Automatic Capture:</h4>
//           <ul className="text-xs text-blue-800 space-y-0.5">
//             <li>• Position your face in the center of the frame</li>
//             <li>• Ensure good lighting</li>
//             <li>• Look directly at the camera</li>
//             <li>• Hold still when you see the countdown</li>
//             <li>• Your face will be captured automatically</li>
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }





//src/components/auth/FacialAuth.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { attendanceApi } from '@/lib/api-client';
import { AuthMethod } from '@/types';

interface FacialAuthProps {
  onSuccess: (data: any) => void;
}

interface AlertMessage {
  type: 'success' | 'error';
  message: string;
}

export default function FacialAuth({ onSuccess }: FacialAuthProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCountRef = useRef(0);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
  const [storedFaceEncoding, setStoredFaceEncoding] = useState<number[] | null>(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log('Camera track stopped');
      });
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadModels = async () => {
    try {
      console.log('Loading face detection models...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      console.log('✓ Face detection models loaded successfully');
      setModelsLoaded(true);
      startCamera();
    } catch (err) {
      console.error('Failed to load models:', err);
      setError('Failed to load face detection models');
      showAlert('error', 'Failed to initialize face detection system');
    }
  };

  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Failed to access camera');
      showAlert('error', 'Camera access denied');
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (detection) {
      setFaceDetected(true);
      
      const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
      const resizedDetection = faceapi.resizeResults(detection, dims);
      
      faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);

      detectionCountRef.current += 1;

      if (detectionCountRef.current >= 20 && !verifiedEmployee) {
        if (detectionCountRef.current === 20) {
          setCountdown(3);
        } else if (detectionCountRef.current === 30) {
          setCountdown(2);
        } else if (detectionCountRef.current === 40) {
          setCountdown(1);
        } else if (detectionCountRef.current >= 50) {
          handleAutoCapture();
        }
      }
    } else {
      setFaceDetected(false);
      detectionCountRef.current = 0;
      setCountdown(null);
      
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
        captureTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (modelsLoaded && videoRef.current && !verifiedEmployee && !capturing && stream) {
      const interval = setInterval(detectFace, 100);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, verifiedEmployee, capturing, stream]);

  const handleAutoCapture = async () => {
    if (!videoRef.current || capturing) return;

    setCapturing(true);
    setCountdown(null);
    setError(null);
    detectionCountRef.current = 0;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please position your face in the frame.');
        showAlert('error', 'No face detected');
        setCapturing(false);
        return;
      }

      const faceEncoding = Array.from(detection.descriptor);
      setStoredFaceEncoding(faceEncoding);

      setLoading(true);
      const response: any = await attendanceApi.verify({
        method: AuthMethod.FACIAL,
        faceEncoding,
      });

      setVerifiedEmployee(response.employee);
      showAlert('success', `Welcome, ${response.employee.fullName}!`);
      
      stopCamera();
    } catch (err: any) {
      const errorMsg = err.message || 'Face not recognized';
      setError(errorMsg);
      showAlert('error', errorMsg);
      setStoredFaceEncoding(null);
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
      setCapturing(false);
    }
  };

  const handleClockAction = async (actionType: 'clock-in' | 'clock-out') => {
    if (!storedFaceEncoding) {
      setError('No face encoding available. Please scan again.');
      showAlert('error', 'No face encoding available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        employeeId: verifiedEmployee.id,
        method: AuthMethod.FACIAL,
        faceEncoding: storedFaceEncoding,
        location: process.env.NEXT_PUBLIC_KIOSK_ID || 'KIOSK-001',
      };

      const response =
        actionType === 'clock-in'
          ? await attendanceApi.clockIn(data)
          : await attendanceApi.clockOut(data);

      const actionText = actionType === 'clock-in' ? 'in' : 'out';
      showAlert('success', `Successfully clocked ${actionText}!`);

      onSuccess({
        action: actionType,
        employee: verifiedEmployee,
        attendance: response,
      });

      // REMOVED: startCamera() - Camera will only restart when user clicks "Scan again"
      // The verified employee state stays set, preventing auto-restart
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to process attendance';
      setError(errorMsg);
      showAlert('error', errorMsg);
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerifiedEmployee(null);
    setStoredFaceEncoding(null);
    setError(null);
    setAlert(null);
    detectionCountRef.current = 0;
    setCountdown(null);
    
    stopCamera();
    showAlert('success', 'Ready for next employee');
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  if (verifiedEmployee && !loading) {
    return (
      <div className="text-center">
        <div className="mb-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          <span>Camera Off</span>
        </div>

        {alert && (
          <div className={`mb-4 p-3 rounded flex items-center space-x-2 text-sm ${
            alert.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {alert.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <p className="font-medium">{alert.message}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome, {verifiedEmployee.fullName}!
          </h3>
          <p className="text-sm text-gray-600">
            {verifiedEmployee.department} • {verifiedEmployee.position}
          </p>
          <div className="mt-2 inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-medium">
            Shift: {verifiedEmployee.shift.name}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleClockAction('clock-in')}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              'Clock In'
            )}
          </button>
          <button
            onClick={() => handleClockAction('clock-out')}
            disabled={loading}
            className="px-6 py-2.5 bg-orange-600 text-white text-sm rounded font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              'Clock Out'
            )}
          </button>
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="mt-3 text-gray-600 hover:text-gray-900 text-xs disabled:text-gray-400"
        >
          Not you? Scan again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      {alert && (
        <div className={`mb-4 p-3 rounded flex items-center space-x-2 text-sm ${
          alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {alert.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <p className="font-medium">{alert.message}</p>
        </div>
      )}

      <div className="mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded mb-4 transition-colors ${
          capturing ? 'bg-blue-100 animate-pulse' : 
          countdown ? 'bg-orange-100 animate-pulse' :
          'bg-blue-50'
        }`}>
          {countdown ? (
            <span className="text-2xl font-bold text-orange-700">{countdown}</span>
          ) : (
            <Camera className="w-8 h-8 text-blue-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {capturing ? 'Scanning Face...' : 
           countdown ? `Capturing in ${countdown}...` :
           'Position Your Face'}
        </h3>
        <p className="text-sm text-gray-600">
          {capturing
            ? 'Please hold still while we identify you'
            : countdown
            ? 'Hold still!'
            : 'Look directly at the camera'}
        </p>
      </div>

      <div className="max-w-md mx-auto mb-4">
        <div className="relative bg-black rounded overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />

          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {faceDetected ? '✓ Face Detected' : '✗ No Face'}
            </div>
          </div>

          {countdown && (
            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
              <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/50 px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">Live</span>
          </div>

          {capturing && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {!capturing && !countdown && modelsLoaded && (
        <div className="max-w-md mx-auto mb-3">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              faceDetected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className="text-xs text-gray-600">
              {faceDetected ? 'Ready - Hold your position' : 'Waiting for face...'}
            </span>
          </div>
        </div>
      )}

      {!modelsLoaded && (
        <div className="max-w-md mx-auto mb-3 p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-xs text-blue-800">Loading face detection models...</span>
        </div>
      )}

      {error && !alert && (
        <div className="max-w-md mx-auto mt-3 p-3 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-left">
            <p className="font-medium text-red-900 text-sm">Recognition Failed</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}

      {!error && !alert && modelsLoaded && (
        <div className="max-w-md mx-auto mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-900 text-sm mb-1.5">Automatic Capture:</h4>
          <ul className="text-xs text-blue-800 space-y-0.5">
            <li>• Position your face in the center of the frame</li>
            <li>• Ensure good lighting</li>
            <li>• Look directly at the camera</li>
            <li>• Hold still when you see the countdown</li>
            <li>• Your face will be captured automatically</li>
          </ul>
        </div>
      )}
    </div>
  );
}