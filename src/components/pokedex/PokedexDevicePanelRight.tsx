
"use client";

import React from 'react';
import type { PokemonData } from "./PokedexOpenView"; 
import { Loader2, AlertTriangle } from 'lucide-react';

interface PokedexDevicePanelRightProps {
  children: React.ReactNode; 
  pokemonData: PokemonData | null;
  isLoading: boolean;
  error: string | null;
}

export function PokedexDevicePanelRight({ children, pokemonData, isLoading, error }: PokedexDevicePanelRightProps) {

  const getScreenContent = (): React.ReactNode => {
    if (isLoading && !pokemonData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-400 mb-2" />
          <p className="text-xs whitespace-pre-wrap break-words">Identificando Pokémon...{'\n'}Por favor espera.</p>
        </div>
      );
    }

    if (error && (!pokemonData || !pokemonData.isPokemon)) {
      const displayError = error.length > 120 ? error.substring(0, 117) + "..." : error;
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="h-6 w-6 text-green-400 mb-2" />
          <p className="text-xs whitespace-pre-wrap break-words">Error: {displayError}</p>
        </div>
      );
    }
    
    if (!pokemonData && !isLoading && !error) { 
      return <p className="whitespace-pre-wrap break-words">Pokédex Lista. Esperando Pokémon para mostrar resumen.</p>;
    }

    if (pokemonData && !pokemonData.isPokemon && pokemonData.confidence < 0.5 && !isLoading) {
      return <p className="whitespace-pre-wrap break-words">No se pudo identificar un Pokémon. Intenta con otra imagen.</p>;
    }

    if (pokemonData && pokemonData.isPokemon) {
      if (isLoading) { 
        return <p className="whitespace-pre-wrap break-words">Cargando resumen para {pokemonData.name || "Pokémon"}...</p>;
      }
      if (pokemonData.summary) {
        return <p className="whitespace-pre-wrap break-words">{pokemonData.summary}</p>;
      }
      if (error) {
        return <p className="whitespace-pre-wrap break-words">Error al cargar resumen para {pokemonData.name || "Pokémon"}. Detalle: {error.substring(0,50)}...</p>;
      }
      return <p className="whitespace-pre-wrap break-words">Resumen no disponible para {pokemonData.name || "este Pokémon"}.</p>;
    }
    
    return <p className="whitespace-pre-wrap break-words">Esperando datos del Pokémon...</p>; 
  };
  
  const isSpecialState = (isLoading && !pokemonData) || (error && (!pokemonData || !pokemonData.isPokemon));

  return (
    <div className='relative w-full h-full flex flex-col mt-[116px]'>
      <div
        className="absolute top-[2.5px] w-full h-[3rem] flex flex-row -mt-[2.9rem] bg-red-600 border-t-4 border-l-4 border-red-700"
        style={{
          clipPath: "polygon(35% 0, 65% 4.8rem, 100% 3.125rem, 100% 80px, 100% 100%, 0 100%, 0% 70%, 0 0)"
        }}
      />

      <div className="w-full bg-red-600 shadow-xl flex flex-col p-6 border-4 border-red-700 rounded-bl-lg rounded-br-lg" style={{ height: 'calc(100% - 116px)' }}>

        {/* Black Rectangle Screen for Summary */}
        <div className={`w-full flex-shrink-0 aspect-[21/9] bg-slate-900 mb-2 rounded-md border-2 border-slate-700 custom-green-screen-shadow p-2.5 font-display text-[10px] leading-snug text-green-400 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/80 scrollbar-track-slate-700/50 ${isSpecialState ? 'flex flex-col items-center justify-center text-center' : ''}`}>
          {getScreenContent()}
        </div>

        {/* Blue button grid (simplified) */}
        <div className="h-16 flex-shrink-0 grid grid-cols-5 gap-1.5 mb-2 px-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-blue-500 rounded h-6 w-full shadow-md border border-blue-600"></div>
          ))}
        </div>

        {/* Small horizontal buttons black */}
        <div className="flex justify-end space-x-6">
          <button className="w-10 h-3.5 bg-neutral-800 rounded-sm border-[1px] border-slate-700 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
          <button className="w-10 h-3.5 bg-neutral-800 rounded-sm border-[1px] border-slate-700 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
        </div>

        {/* Bottom buttons (simplified) */}
        <div className="h-10 flex-shrink-0 flex items-center justify-center gap-3 mt-6">
          <div className="w-16 h-6 bg-gray-300 rounded shadow-md border border-gray-400"></div>
          <div className="w-16 h-6 bg-gray-300 rounded shadow-md border border-gray-400"></div>
          <div className="w-6 h-6 bg-yellow-400 rounded-full ml-auto shadow-md border-2 border-yellow-500"></div>
        </div>

        {/* Main content area for InfoPanel */}
        <div className="flex-grow bg-red-500/30 rounded-md p-1 mb-2 shadow-inner">
          {/* Only render InfoPanel if not in initial loading or initial error state */}
          {!(isLoading && !pokemonData) && !(error && (!pokemonData || !pokemonData.isPokemon)) && children}
        </div>
        
      </div>
    </div>
  );
}
