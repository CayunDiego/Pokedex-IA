
"use client";

import { CameraFeed } from "./CameraFeed";
import type { PokemonDisplayData } from "./PokedexShell";

interface CapturePanelProps {
  onImageCapture: (dataUri: string) => void;
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  isApiLoading: boolean;
  showPokeballAnimation: boolean;
  pokemonData: PokemonDisplayData | null;
}

export function CapturePanel({ 
  onImageCapture, 
  capturedImageUri, 
  clearCapturedImage, 
  isApiLoading, 
  showPokeballAnimation, 
  pokemonData
}: CapturePanelProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      <div className="w-full flex-grow overflow-hidden">
        <CameraFeed
          onCapture={onImageCapture}
          capturedImageUri={capturedImageUri}
          clearCapturedImage={clearCapturedImage}
          isApiLoading={isApiLoading}
          showPokeballAnimation={showPokeballAnimation}
          pokemonData={pokemonData}
        />
      </div>
    </div>
  );
}
