
"use client";

import { CapturePanel } from "./CapturePanel";
import { InfoPanel } from "./InfoPanel";
import { PokedexDevicePanelLeft } from "./PokedexDevicePanelLeft";
import { PokedexDevicePanelRight } from "./PokedexDevicePanelRight";

export interface PokemonData {
  isPokemon: boolean;
  name?: string;
  confidence: number;
  pokemonType?: string[];
  generation?: string;
  description?: string;
  summary?: string;
}

interface PokedexOpenViewProps {
  onImageCapture: (dataUri: string) => void;
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  pokemonData: PokemonData | null; 
  isLoading: boolean;
  error: string | null;
}

export function PokedexOpenView({
  onImageCapture,
  capturedImageUri,
  clearCapturedImage,
  pokemonData,
  isLoading,
  error,
}: PokedexOpenViewProps) {
  return (
    <div className="h-full w-full flex flex-row bg-neutral-800 p-2 lg:px-[10%] gap-1">
      {/* Left Device Panel */}
      <div className="w-1/2 h-full">
        <PokedexDevicePanelLeft>
          <CapturePanel
            onImageCapture={onImageCapture}
            capturedImageUri={capturedImageUri}
            clearCapturedImage={clearCapturedImage}
            isLoading={isLoading}
          />
        </PokedexDevicePanelLeft>
      </div>

      {/* Right Device Panel */}
      <div className="w-1/2 h-full">
        <PokedexDevicePanelRight
          pokemonData={pokemonData}
          isLoading={isLoading}
          error={error}
        >
          <InfoPanel
            pokemonData={pokemonData}
            isLoading={isLoading} // Pass isLoading directly
            error={error}
          />
        </PokedexDevicePanelRight>
      </div>
    </div>
  );
}
