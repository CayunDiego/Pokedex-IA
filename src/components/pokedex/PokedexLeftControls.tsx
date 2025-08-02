
"use client";

import React from 'react';
import DPad from './DPad';
import type { PokemonDisplayData } from './PokedexShell';

interface PokedexLeftControlsProps {
  pokemonData: PokemonDisplayData | null;
}

export function PokedexLeftControls({ pokemonData }: PokedexLeftControlsProps) {
  return (
    <div className="flex-shrink-0 grid grid-cols-[auto_1fr_1fr] items-center gap-x-6 pb-2 pt-8">

      {/* Column 1: Large Black Circular Button */}
      <div className="h-full">
        <button
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-800 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"
          aria-label="Main control button"
        >
        </button>
      </div>

      {/* Column 2: [Color Buttons (top) + Green Screen (bottom)] */}
      <div className="flex flex-col space-y-4 h-full justify-between">
        {/* Small horizontal buttons (Red & Blue) */}
        <div className="flex space-x-6">
          <button className="w-10 h-3.5 bg-red-500 rounded-sm border-[1px] border-red-700/80 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
          <button className="w-10 h-3.5 bg-blue-500 rounded-sm border-[1px] border-blue-700/80 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
        </div>
        {/* Green Rectangle Screen */}
        <div className="w-full aspect-[4/3] bg-green-500 rounded-md border-2 border-green-700/80 custom-green-screen-shadow flex flex-col items-center justify-center p-1 overflow-hidden">
          {pokemonData && pokemonData.isPokemon && pokemonData.name && pokemonData.id !== undefined ? (
            <>
              <p className="font-display text-yellow-300 text-xs leading-none mb-0.5 text-center break-all">
                {pokemonData.name.toUpperCase()}
              </p>
              <p className="font-display text-yellow-300 text-lg leading-none text-center">
                #{String(pokemonData.id).padStart(3, '0')}
              </p>
            </>
          ) : (
            <p className="font-display text-yellow-400/70 text-sm">---</p> 
          )}
        </div>
      </div>

      {/* Column 3: D-pad */}
      <div className="flex justify-center items-end h-full"> 
        <DPad responsive /> 
      </div>
    </div>
  );
}
