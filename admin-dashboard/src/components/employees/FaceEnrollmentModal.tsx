
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, CheckCircle } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { employeesApi } from '@/lib/api-client';
import { Employee } from '@/types';

interface FaceEnrollmentModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FaceEnrollmentModal({
  employee,
  onClose,
  onSuccess,
}: FaceEnrollmentModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
      startCamera();
    } catch (err) {
      setError('Failed to load face detection models');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.');
    }
  };

  const detectFace = async () => {
    // Check if refs are available before starting
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Check refs again after async operation
      if (!videoRef.current || !canvasRef.current) return;

      if (detection) {
        setFaceDetected(true);
        
        // Additional null check before using refs
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedDetection = faceapi.resizeResults(detection, dims);
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetection);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
        }
      } else {
        setFaceDetected(false);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
    } catch (err) {
      // Silently handle detection errors (they're common during detection)
      console.error('Face detection error:', err);
    }
  };

  useEffect(() => {
    if (modelsLoaded && videoRef.current && !success) {
      const interval = setInterval(detectFace, 100);
      return () => clearInterval(interval);
    }
  }, [modelsLoaded, success]);

  const captureFace = async () => {
    if (!videoRef.current) return;

    setCapturing(true);
    setError('');

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected. Please position your face in the frame.');
        setCapturing(false);
        return;
      }

      const faceEncoding = Array.from(detection.descriptor);

      setLoading(true);
      await employeesApi.assignFaceEncoding(employee.id, { faceEncoding });

      setSuccess(true);
      stopCamera();

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to enroll face');
    } finally {
      setLoading(false);
      setCapturing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Enrollment Successful!
            </h3>
            <p className="text-sm text-slate-600">
              Face has been successfully enrolled for {employee.fullName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Enroll Face</h2>
            <p className="text-xs text-slate-500 mt-0.5">{employee.fullName}</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded overflow-hidden mb-3">
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

            <div className="absolute top-3 right-3">
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                faceDetected
                  ? 'bg-green-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}>
                {faceDetected ? '✓ Face Detected' : '✗ No Face'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="text-xs font-medium text-blue-900 mb-1.5">Instructions:</h4>
              <ul className="text-xs text-blue-800 space-y-0.5">
                <li>• Position your face in the center of the frame</li>
                <li>• Make sure the lighting is good</li>
                <li>• Look directly at the camera</li>
                <li>• Wait for "Face Detected" indicator</li>
                <li>• Click "Capture Face" button</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={captureFace}
                disabled={!faceDetected || loading || capturing}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                {loading || capturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Capture Face</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}