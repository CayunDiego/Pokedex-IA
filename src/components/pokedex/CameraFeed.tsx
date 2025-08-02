
"use client";

import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PokemonDisplayData } from "./PokedexShell";

interface CameraFeedProps {
  onCapture: (dataUri: string) => void;
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  isApiLoading: boolean;
  showPokeballAnimation: boolean;
  pokemonData: PokemonDisplayData | null;
}

export function CameraFeed({ 
  onCapture, 
  capturedImageUri, 
  clearCapturedImage, 
  isApiLoading, 
  showPokeballAnimation, 
  pokemonData 
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
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
    }
  }, [stableStopCamera, setCurrentStream, setHasCameraPermission, setCameraError]);

  useEffect(() => {
    const shouldStartCamera = 
      pokemonData?.spriteUrl !== "/MissingNo.png" &&
      !showPokeballAnimation &&
      !capturedImageUri && 
      !isApiLoading;

    if (shouldStartCamera) {
      stableStartCamera();
    } else { 
      stableStopCamera();
    }
    
    return () => {
      stableStopCamera();
    };
  }, [pokemonData?.spriteUrl, capturedImageUri, showPokeballAnimation, isApiLoading, stableStartCamera, stableStopCamera]);


  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current && currentStreamRef.current && hasCameraPermissionRef.current === true && !isApiLoading) {
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
    if (isApiLoading) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onCapture(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    if (isApiLoading && !pokemonData?.summary && pokemonData?.isPokemon === true) { 
      return;
    }
    clearCapturedImage();
  };

  const handleTryAgain = () => {
    stableStartCamera(true);
  };


  // --- Render Logic ---

  // CASO 1: Mostrar MissingNo si está definido (máxima prioridad)
  if (pokemonData?.spriteUrl === "/MissingNo.png") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black text-white">
        <Image
          src="/MissingNo.png"
          alt="Pokémon No Identificado"
          layout="fill"
          objectFit="contain"
          data-ai-hint="glitch question mark"
          className="z-10 p-8"
        />
        <Button
          onClick={handleRetake}
          variant="outline"
          size="lg"
          className="absolute bottom-4 left-4 z-20 bg-background/80 hover:bg-background/90 text-foreground"
          disabled={isApiLoading} 
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Retake
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // CASO 2: Mostrar Pokeball animation si activa
  // (No es MissingNo porque el caso anterior lo habría capturado)
  if (showPokeballAnimation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black text-white">
        <Image
          src="/pokeball.gif"
          alt="Analizando datos..."
          width={150} 
          height={150}
          unoptimized={true}
          data-ai-hint="pokeball animation"
          className="w-full h-full object-cover" 
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
  
  // CASO 3: Animación terminada. Mostrar sprite del Pokémon si está disponible.
  // (No es MissingNo, showPokeballAnimation es false)
  if (pokemonData?.spriteUrl && pokemonData.isPokemon && !showPokeballAnimation) { 
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black">
        <Image
          src={pokemonData.spriteUrl}
          alt={pokemonData.name || "Pokemon Sprite"}
          width={200} 
          height={200}
          unoptimized={true} 
          data-ai-hint="pokemon sprite"
          className="max-w-full max-h-full object-contain"
        />
        <Button
          onClick={handleRetake}
          variant="outline"
          size="lg"
          className="absolute bottom-4 left-4 z-10"
          disabled={isApiLoading && pokemonData.isPokemon && !pokemonData.summary} 
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Retake
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // CASO 4: Animación terminada, sin sprite, PERO es un Pokémon (esperando sprite o sprite falló).
  // (No es MissingNo, showPokeballAnimation es false, pokemonData.spriteUrl es null/undefined, pokemonData.isPokemon es true)
  if (pokemonData?.isPokemon === true) { 
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black text-white">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-300" />
        <p className="mt-4 text-lg font-semibold">Cargando Pokémon...</p>
        {!isApiLoading && (
            <Button onClick={handleRetake} variant="outline" size="lg" className="absolute bottom-4 left-4 z-10">
                <RotateCcw className="mr-2 h-5 w-5" /> Retake
            </Button>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
  
  // CASO 5: Animación terminada, NO es un Pokémon identificable (o error inicial), y hay imagen capturada.
  // (No es MissingNo, showPokeballAnimation es false, pokemonData.isPokemon es false o pokemonData es null)
  if (capturedImageUri && (pokemonData?.isPokemon === false || !pokemonData)) { 
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black">
        <img
          src={capturedImageUri}
          alt="Captured"
          className="w-full h-full object-cover"
        />
        <Button
          onClick={handleRetake}
          variant="outline"
          size="lg"
          className="absolute bottom-4 left-4 z-10"
          disabled={isApiLoading} 
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Retake
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // CASO 6: Estado inicial / Cámara / Error de cámara.
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden shadow-inner bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      
      {hasCameraPermission === null && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          Accediendo a la cámara...
        </div>
      )}

      {hasCameraPermission === false && cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4 text-center z-20">
          <Alert variant="destructive" className="w-full max-w-md mb-4 text-left">
            <AlertTitle>Error de Cámara</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
          <Button onClick={handleTryAgain} className="mb-2" variant="secondary" disabled={isApiLoading}>Intentar de Nuevo</Button>
        </div>
      )}
      
      {hasCameraPermission === true && (
         <>
          <Button
            onClick={handleCaptureClick}
            variant="default"
            size="lg"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!currentStream || isApiLoading} 
          >
            <Camera className="mr-2 h-6 w-6" /> Capturar
          </Button>
         </>
       )}
      
      {hasCameraPermission !== true && !(hasCameraPermission === false && cameraError) && !(hasCameraPermission === null && !cameraError) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-20 p-4 text-center">
          <p>Esperando permiso de la cámara o cámara no disponible.</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isApiLoading}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
