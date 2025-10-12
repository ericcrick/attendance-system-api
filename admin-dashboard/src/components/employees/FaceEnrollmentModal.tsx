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
    if (!videoRef.current || !canvasRef.current) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setFaceDetected(true);
      const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
      const resizedDetection = faceapi.resizeResults(detection, dims);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetection);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetection);
    } else {
      setFaceDetected(false);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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

      // Show success message
      setSuccess(true);
      stopCamera();

      // Close modal after 2 seconds
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

  // Success view
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enrollment Successful!
            </h3>
            <p className="text-gray-600">
              Face has been successfully enrolled for {employee.fullName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enroll Face</h2>
            <p className="text-sm text-gray-500 mt-1">{employee.fullName}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <div className="relative bg-black rounded-xl overflow-hidden mb-4">
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

            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${faceDetected
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                }`}>
                {faceDetected ? '✓ Face Detected' : '✗ No Face'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Position your face in the center of the frame</li>
                <li>• Make sure the lighting is good</li>
                <li>• Look directly at the camera</li>
                <li>• Wait for "Face Detected" indicator</li>
                <li>• Click "Capture Face" button</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={captureFace}
                disabled={!faceDetected || loading || capturing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading || capturing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
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