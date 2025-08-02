
"use client";

import React from 'react';
import type { PokemonData } from "./PokedexOpenView";
import { Loader2, AlertTriangle, BarChart3, HelpCircle, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

interface PokedexDevicePanelRightProps {
  pokemonData: PokemonData | null;
  isLoading: boolean;
  error: string | null;
  selectedInfoButtonIndex: number | null;
  setSelectedInfoButtonIndex: (index: number | null) => void;
}

const statNameMapping: { [key: string]: string } = {
  "hp": "HP",
  "attack": "Ataque",
  "defense": "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  "speed": "Velocidad",
};
const MAX_STAT_VALUE = 255;

export function PokedexDevicePanelRight({ 
  pokemonData, 
  isLoading, 
  error,
  selectedInfoButtonIndex,
  setSelectedInfoButtonIndex
}: PokedexDevicePanelRightProps) {

  const getScreenContent = (): React.ReactNode => {
    // Initial loading before any identification attempt
    if (isLoading && (!pokemonData || !pokemonData.name)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Loader2 className="h-6 w-6 animate-spin text-green-400 mb-2" />
          <p className="text-xs whitespace-pre-wrap break-words">Identificando Pokémon...{'\n'}Por favor espera.</p>
        </div>
      );
    }

    // General error if not trying to show stats specifically
    if (error && (!pokemonData || !pokemonData.isPokemon) && selectedInfoButtonIndex !== 1) {
      const displayError = error.length > 120 ? error.substring(0, 117) + "..." : error;
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="h-6 w-6 text-green-400 mb-2" />
          <p className="text-xs whitespace-pre-wrap break-words">Error: {displayError}</p>
        </div>
      );
    }
    
    // Pokedex ready, waiting for image
    if (!pokemonData && !isLoading && !error) {
      return <p className="whitespace-pre-wrap break-words">Pokédex Lista. Esperando Pokémon para mostrar información.</p>;
    }

    // Content for Button 0 (Confidence & Description)
    if (pokemonData && (selectedInfoButtonIndex === 0 || selectedInfoButtonIndex === null)) {
      if (!pokemonData.isPokemon) { // Identified as not a Pokemon or very low confidence
         return (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <HelpCircle className="h-6 w-6 text-green-400 mb-2" />
              <p className="text-xs whitespace-pre-wrap break-words">
                {pokemonData.description || "No se pudo identificar un Pokémon."}
              </p>
              {pokemonData.confidence !== undefined && (
                <div className="w-full max-w-[120px] mt-2">
                  <p className="text-[9px] text-green-300 mb-0.5">Confianza (No Pokémon)</p>
                  <div className="flex items-center space-x-1">
                    <Progress value={Math.round((1 - pokemonData.confidence) * 100)} className="w-full h-1.5 bg-slate-700 [&>div]:bg-yellow-400" />
                    <span className="text-[9px] font-semibold text-yellow-300">{Math.round((1-pokemonData.confidence) * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
      }
      // It IS a Pokemon, show confidence and description/summary
      if (isLoading && (!pokemonData.description && !pokemonData.summary)) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-400 mb-2" />
            <p className="text-xs whitespace-pre-wrap break-words">Cargando detalles para {pokemonData.name || "Pokémon"}...</p>
          </div>
        );
      }
      
      const descriptionToShow = pokemonData.description || pokemonData.summary;

      return (
        <div className="space-y-2">
          <div>
            <p className="text-[9px] text-green-300 mb-0.5 flex items-center">
              <HelpCircle className="mr-1 h-2.5 w-2.5" />
              Confianza ID
            </p>
            <div className="flex items-center space-x-1">
              <Progress 
                value={Math.round(pokemonData.confidence * 100)} 
                className="w-full h-1.5 bg-slate-700 [&>div]:bg-green-400" 
              />
              <span className="text-[9px] font-semibold text-green-300">
                {Math.round(pokemonData.confidence * 100)}%
              </span>
            </div>
          </div>

          {descriptionToShow ? (
            <div>
              <p className="text-[9px] text-green-300 mb-0.5 flex items-center">
                <BookOpen className="mr-1 h-2.5 w-2.5" /> 
                Descripción
              </p>
              <p className="whitespace-pre-wrap break-words text-[10px]">
                {descriptionToShow}
              </p>
            </div>
          ) : (
             <p className="whitespace-pre-wrap break-words text-[10px]">Descripción no disponible.</p>
          )}
           {error && pokemonData.isPokemon && (selectedInfoButtonIndex === 0 || selectedInfoButtonIndex === null) && (
            <div className="mt-1">
                <p className="text-[9px] text-yellow-400 flex items-center"><AlertTriangle className="mr-1 h-2.5 w-2.5 text-yellow-400" />Error adicional</p>
                <p className="text-[10px] text-yellow-400 whitespace-pre-wrap break-words">{error.substring(0,100)}...</p>
            </div>
           )}
        </div>
      );
    }
    
    // Content for Button 1 (Stats)
    if (pokemonData && selectedInfoButtonIndex === 1) {
      if (isLoading && (!pokemonData.stats || pokemonData.stats.length === 0)) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-400 mb-2" />
            <p className="text-xs whitespace-pre-wrap break-words">Cargando estadísticas...</p>
          </div>
        );
      }
      if (pokemonData.stats && pokemonData.stats.length > 0) {
        return (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold mb-0.5 flex items-center sticky top-0 bg-slate-900 py-0.5 -mx-0.5 px-0.5 z-10"><BarChart3 className="mr-1 h-3 w-3" />Estadísticas Base:</p>
            {pokemonData.stats.map((stat, index) => (
              <div key={index} className="text-[9px] leading-tight">
                <div className="flex justify-between items-center mb-px">
                  <span className="text-green-300 capitalize">{statNameMapping[stat.name.toLowerCase()] || stat.name}</span>
                  <span className="text-green-200 font-medium">{stat.base_stat}</span>
                </div>
                <Progress value={(stat.base_stat / MAX_STAT_VALUE) * 100} className="h-1 bg-green-700/50 [&>div]:bg-yellow-400" />
              </div>
            ))}
             {error && (selectedInfoButtonIndex === 1) && (
                <div className="mt-1">
                    <p className="text-[9px] text-yellow-400 flex items-center"><AlertTriangle className="mr-1 h-2.5 w-2.5 text-yellow-400" />Error al cargar Stats</p>
                    <p className="text-[10px] text-yellow-400 whitespace-pre-wrap break-words">{error.substring(0,100)}...</p>
                </div>
           )}
          </div>
        );
      }
      return <p className="whitespace-pre-wrap break-words">Estadísticas no disponibles.</p>;
    }

    return <p className="whitespace-pre-wrap break-words">Esperando datos del Pokémon...</p>;
  };

  const shouldCenterContent = 
    (isLoading && (!pokemonData?.name)) || 
    (error && !pokemonData?.isPokemon && selectedInfoButtonIndex !==1 ) || 
    (!pokemonData && !isLoading && !error) || 
    (pokemonData && !pokemonData.isPokemon && (selectedInfoButtonIndex === 0 || selectedInfoButtonIndex === null));

  return (
    <div className='relative w-full h-full flex flex-col mt-[116px]'>
      <div
        className="absolute top-[2.5px] w-full h-[3rem] flex flex-row -mt-[2.9rem] bg-red-600 border-t-4 border-l-4 border-red-700"
        style={{
          clipPath: "polygon(35% 0, 65% 4.8rem, 100% 3.125rem, 100% 80px, 100% 100%, 0 100%, 0% 70%, 0 0)"
        }}
      />

      <div className="w-full bg-red-600 shadow-xl flex flex-col p-6 border-4 border-red-700 rounded-bl-lg rounded-br-lg" style={{ height: 'calc(100% - 116px)' }}>

        {/* Black Rectangle Screen for Summary/Description/Stats */}
        <div className={cn(
            "w-full flex-shrink-0 aspect-[21/9] bg-slate-900 mb-2 rounded-md border-2 border-slate-700 custom-green-screen-shadow p-2.5 font-display text-[10px] leading-snug text-green-400",
            shouldCenterContent 
            ? 'flex flex-col items-center justify-center text-center' 
            : 'overflow-y-auto scrollbar-thin scrollbar-thumb-green-700/60 scrollbar-track-slate-800/50'
            )}>
          {getScreenContent()}
        </div>

        {/* Blue button keypad */}
        <div className="flex-shrink-0 mb-2 rounded-md border border-blue-700/80 bg-blue-800 p-px shadow-[2px_2px_1px_#00000050]">
          <div className="grid h-full aspect-[5/2] mx-auto grid-cols-5 grid-rows-2 gap-px">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedInfoButtonIndex(i)}
                className={cn(
                  "h-full w-full rounded-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-red-700 focus-visible:ring-sky-300",
                  selectedInfoButtonIndex === i
                    ? "bg-sky-400 border-2 border-sky-500 shadow-inner brightness-110"
                    : "bg-blue-500 hover:bg-blue-400 active:bg-blue-600",
                )}
                aria-pressed={selectedInfoButtonIndex === i}
                aria-label={`Info button ${i + 1}`}
              >
              </button>
            ))}
          </div>
        </div>

        {/* Small horizontal buttons black */}
        <div className="flex justify-end space-x-6 mt-2">
          <button className="w-10 h-3.5 bg-neutral-800 rounded-sm border-[1px] border-slate-700 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
          <button className="w-10 h-3.5 bg-neutral-800 rounded-sm border-[1px] border-slate-700 shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] active:translate-y-[2px] transition duration-100"></button>
        </div>

        {/* Bottom buttons (simplified) */}
        <div className="h-10 flex-shrink-0 flex items-center justify-center gap-3 mt-6">
          <div className="w-16 h-6 bg-gray-300 rounded shadow-md border border-gray-400"></div>
          <div className="w-16 h-6 bg-gray-300 rounded shadow-md border border-gray-400"></div>
          <div className="w-6 h-6 bg-yellow-400 rounded-full ml-auto shadow-md border-2 border-yellow-500"></div>
        </div>
        
        <div className="flex-grow mb-2"></div>


        {/* Black Rectangle Screen bottom (Height/Weight & Type Icons) */}
        <div className='w-full flex gap-3'>
          <div className={`flex-1 flex-shrink-0 aspect-[21/9] bg-slate-900 mb-2 rounded-md border-2 border-slate-700 custom-green-screen-shadow p-2.5 font-display text-[10px] leading-snug text-green-400 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/80 scrollbar-track-slate-700/50`}>
          {pokemonData && pokemonData.isPokemon && pokemonData.height !== undefined && pokemonData.weight !== undefined ? (
              <>
                <p>Altura: {pokemonData.height * 10} cm</p>
                <p>Peso: {(pokemonData.weight / 10).toFixed(1)} kg</p>
              </>
            ) : (
              <p>Datos físicos no disponibles.</p>
            )}
          </div>
          <div className={`flex-1 flex-shrink-0 aspect-[21/9] bg-slate-900 mb-2 rounded-md border-2 border-slate-700 custom-green-screen-shadow p-2.5 font-display text-[10px] leading-snug text-green-400 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/80 scrollbar-track-slate-700/50 flex justify-center items-center gap-1`}>
            {pokemonData && pokemonData.typeDetails && pokemonData.typeDetails.length > 0 ? (
                pokemonData.typeDetails.map((typeDetail) => (
                  <Image
                    key={typeDetail.name}
                    src={typeDetail.iconUrl}
                    alt={`${typeDetail.name} type icon`}
                    width={64} 
                    height={28}
                    data-ai-hint={`${typeDetail.name} type`}
                    className="object-contain" 
                  />
                ))
              ) : (
                <p>Tipos no disponibles.</p>
              )}
          </div>
        </div>

      </div>
    </div>
  );
}
