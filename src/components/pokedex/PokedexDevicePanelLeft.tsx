
"use client";

import React from 'react';
import { PokedexScreen } from './PokedexScreen';
import { PokedexLeftHeader } from './PokedexLeftHeader';
import { PokedexLeftHinge } from './PokedexLeftHinge';
import { PokedexLeftControls } from './PokedexLeftControls'; 
import type { PokemonDisplayData } from './PokedexShell';

interface PokedexDevicePanelLeftProps {
  children: React.ReactNode; 
  pokemonData: PokemonDisplayData | null;
  isSpeaking: boolean; 
}

export function PokedexDevicePanelLeft({ children, pokemonData, isSpeaking }: PokedexDevicePanelLeftProps) {
  return (
    <div className="h-full w-full bg-red-600 rounded-lg shadow-xl grid grid-rows-[auto_1fr] border-y-4 border-l-4 border-red-700 overflow-hidden">
      {/* === Pokedex Left Header === */}
      <PokedexLeftHeader isSpeaking={isSpeaking} />

      {/* Fila inferior dividida en dos columnas */}
      <div className="grid grid-cols-[1fr_1.5rem] overflow-hidden h-full">
        {/* === Pokedex Left Body === */}
        <div className="w-full flex-grow flex flex-col overflow-hidden p-6">
          {/* Screen Area using the PokedexScreen component */}
          <div className="flex-grow relative">
            <PokedexScreen>{children}</PokedexScreen>
          </div>
          {/* Bottom Controls Area */}
          <PokedexLeftControls pokemonData={pokemonData} />
        </div>

        {/* === Pokedex Left Hinge === */}
        <PokedexLeftHinge />
      </div>
    </div>
  );
}
