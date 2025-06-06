
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, RotateCcw, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CameraFeedProps {
  onCapture: (dataUri: string) => void;
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  isProcessing: boolean;
}

export function CameraFeed({ onCapture, capturedImageUri, clearCapturedImage, isProcessing }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Refs to hold current values of state for stable callbacks
  const hasCameraPermissionRef = useRef(hasCameraPermission);
  const currentStreamRef = useRef(currentStream);

  useEffect(() => {
    hasCameraPermissionRef.current = hasCameraPermission;
  }, [hasCameraPermission]);

  useEffect(() => {
    currentStreamRef.current = currentStream;
  }, [currentStream]);

  const stableStopCamera = useCallback(() => {
    setCurrentStream(prevStream => {
      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [setCurrentStream]); 

  const stableStartCamera = useCallback(async (isForcedRetry: boolean = false) => {
    const currentPermission = hasCameraPermissionRef.current;
    const currentActiveStream = currentStreamRef.current;

    if (!isForcedRetry && currentPermission === true && currentActiveStream) {
        if (videoRef.current && !videoRef.current.srcObject) { 
            videoRef.current.srcObject = currentActiveStream;
        }
        return;
    }
    
    stableStopCamera(); 

    setHasCameraPermission(null); 
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCurrentStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access camera. Please check permissions.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message = "Camera permission denied. Please enable it in your browser settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "No camera found. Please ensure a camera is connected.";
        } else {
          message = `Camera error: ${err.name}. Try refreshing the page or checking browser permissions.`;
        }
      }
      setCameraError(message);
      setHasCameraPermission(false);
      if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "AbortError" || err.name === "SecurityError")) {
         toast({ title: "Camera Error", description: message, variant: "destructive" });
      } else if (!(err instanceof Error && (err.name === "NotFoundError" || err.name === "DevicesNotFoundError"))) {
         toast({ title: "Camera Error", description: message, variant: "destructive" });
      }
    }
  }, [toast, stableStopCamera, setCurrentStream, setHasCameraPermission, setCameraError]);

  useEffect(() => {
    if (!capturedImageUri) {
      stableStartCamera();
    } else {
      stableStopCamera();
    }
    // Cleanup on unmount
    return () => {
      stableStopCamera();
    };
  }, [capturedImageUri, stableStartCamera, stableStopCamera]);

  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current && currentStreamRef.current && hasCameraPermissionRef.current === true) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL("image/jpeg");
        onCapture(dataUri);
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (currentStreamRef.current) { 
            stableStopCamera();
          }
          onCapture(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    clearCapturedImage(); 
  };

  const handleTryAgain = () => {
    stableStartCamera(true); 
  };

  if (capturedImageUri) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative rounded-lg overflow-hidden shadow-inner bg-black p-2">
        <Image src={capturedImageUri} alt="Captured Pokemon" layout="fill" objectFit="contain" className="rounded-md" />
        <Button onClick={handleRetake} variant="outline" size="lg" className="absolute bottom-4 left-4 z-10" disabled={isProcessing}>
          <RotateCcw className="mr-2 h-5 w-5" /> Retake
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative rounded-lg overflow-hidden shadow-inner bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      
      {hasCameraPermission === null && !cameraError && ( 
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          Accessing camera...
        </div>
      )}

      {hasCameraPermission === false && cameraError && ( 
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center z-20">
          <Alert variant="destructive" className="w-full max-w-md mb-4 text-left">
            <AlertTitle>Camera Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
          <Button onClick={handleTryAgain} className="mb-2" variant="secondary">Try Again</Button>
          {/*
          <p className="text-sm text-muted-foreground mb-1 text-white">Or, upload an image:</p>
          <Button onClick={handleUploadClick} variant="outline" size="sm" disabled={isProcessing}>
            Upload Image
          </Button>
          */}
        </div>
      )}
      
      {hasCameraPermission === true && (
         <>
          <Button 
            onClick={handleCaptureClick} 
            variant="default" 
            size="lg" 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-accent hover:bg-accent/90 text-accent-foreground" 
            disabled={isProcessing || !currentStream}
          >
            <Camera className="mr-2 h-6 w-6" /> Capture
          </Button>
          {/*
          <Button 
            onClick={handleUploadClick} 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4 z-10" 
            disabled={isProcessing} 
          >
            Upload
          </Button>
          */}
         </>
       )}
      
      {hasCameraPermission !== true && !(hasCameraPermission === false && cameraError) && !(hasCameraPermission === null && !cameraError) && (
        /*
         <Button 
            onClick={handleUploadClick} 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4 z-10" 
            disabled={isProcessing} 
          >
            Upload
          </Button>
        */
        null // Placeholder for when no upload button is shown here
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
