
"use client";

import React, { useState, useEffect } from 'react';
import { CapturePanel } from "./CapturePanel";
// import { InfoPanel } from "./InfoPanel"; // InfoPanel removed
import { PokedexDevicePanelLeft } from "./PokedexDevicePanelLeft";
import { PokedexDevicePanelRight } from "./PokedexDevicePanelRight";
import type { PokemonDisplayData } from "./PokedexShell";

export interface PokemonData extends PokemonDisplayData {}


interface PokedexOpenViewProps {
  onImageCapture: (dataUri: string) => void;
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  pokemonData: PokemonData | null; 
  isApiLoading: boolean;
  showPokeballAnimation: boolean;
  error: string | null;
  isSpeaking: boolean; 
}

export function PokedexOpenView({
  onImageCapture,
  capturedImageUri,
  clearCapturedImage,
  pokemonData, 
  isApiLoading,
  showPokeballAnimation,
  error,
  isSpeaking, 
}: PokedexOpenViewProps) {
  const [selectedInfoButtonIndex, setSelectedInfoButtonIndex] = useState<number | null>(null);

  useEffect(() => {
    if (pokemonData && pokemonData.isPokemon) {
      setSelectedInfoButtonIndex(0); // Default to first button if a Pokemon is identified
    } else {
      setSelectedInfoButtonIndex(null);
    }
  }, [pokemonData, setSelectedInfoButtonIndex]);

  return (
    <div className="h-full w-full flex flex-row bg-neutral-800 p-2 lg:px-[10%] gap-1">
      {/* Left Device Panel */}
      <div className="w-1/2 h-full">
        <PokedexDevicePanelLeft pokemonData={pokemonData} isSpeaking={isSpeaking}>
          <CapturePanel
            onImageCapture={onImageCapture}
            capturedImageUri={capturedImageUri}
            clearCapturedImage={clearCapturedImage}
            isApiLoading={isApiLoading}
            showPokeballAnimation={showPokeballAnimation}
            pokemonData={pokemonData} 
          />
        </PokedexDevicePanelLeft>
      </div>

      {/* Right Device Panel */}
      <div className="w-1/2 h-full">
        <PokedexDevicePanelRight
          pokemonData={pokemonData}
          isLoading={isApiLoading}
          error={error}
          selectedInfoButtonIndex={selectedInfoButtonIndex}
          setSelectedInfoButtonIndex={setSelectedInfoButtonIndex}
        >
          {/* InfoPanel component removed from here */}
        </PokedexDevicePanelRight>
      </div>
    </div>
  );
}

