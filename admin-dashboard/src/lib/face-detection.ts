//admin-dashboard/src/lib/face-detection.ts

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models'; // We'll place models in public/models folder
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw new Error('Failed to load face detection models');
  }
}

export async function detectFaceAndGetDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    // Return the face descriptor (128-dimension vector)
    return detection.descriptor;
  } catch (error) {
    console.error('Error detecting face:', error);
    return null;
  }
}

export async function detectMultipleFaces(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>[]> {
  try {
    const detections = await faceapi
      .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
}

export function compareFaceDescriptors(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[]
): number {
  // Calculate Euclidean distance between two face descriptors
  const desc1 = Array.isArray(descriptor1) ? new Float32Array(descriptor1) : descriptor1;
  const desc2 = Array.isArray(descriptor2) ? new Float32Array(descriptor2) : descriptor2;

  return faceapi.euclideanDistance(desc1, desc2);
}

export function isSameFace(
  descriptor1: Float32Array | number[],
  descriptor2: Float32Array | number[],
  threshold: number = 0.6
): boolean {
  const distance = compareFaceDescriptors(descriptor1, descriptor2);
  return distance < threshold;
}

export async function captureVideoFrame(video: HTMLVideoElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
  }
  return canvas;
}