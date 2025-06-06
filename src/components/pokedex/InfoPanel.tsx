
"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldQuestion, HelpCircle, Sparkles, BookOpen, Type as TypeIcon } from "lucide-react"; // Renamed Type to TypeIcon, removed ImageIcon
import { Badge } from "@/components/ui/badge"; 
import type { PokemonData as PokedexOpenViewPokemonData } from "./PokedexOpenView"; 

interface InfoPanelProps {
  pokemonData: PokedexOpenViewPokemonData | null;
  isLoading: boolean; // This now primarily reflects loading of summary or subsequent data if any
  error: string | null;
}

export function InfoPanel({ pokemonData, isLoading, error }: InfoPanelProps) {

  // Initial loading and error states are handled by PokedexDevicePanelRight's screen
  // This component now assumes it will only be fully rendered when those initial states are passed.

  if (!pokemonData && !isLoading && !error) { // Default state if no data, not loading, no error
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-500/0 rounded-md">
        {/* Image, Title, and Description removed as per request */}
      </div>
    );
  }
  
  // This handles the case where AI determined it's not a Pokemon or confidence is too low
  if (pokemonData && !pokemonData.isPokemon && pokemonData.confidence < 0.5) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-500/0 rounded-md">
        <ShieldQuestion className="w-20 h-20 text-yellow-300 mb-4" />
        <CardTitle className="text-xl font-semibold text-yellow-300 mb-2">No se Identificó Pokémon</CardTitle>
        <CardDescription className="text-sm text-gray-200 mb-3">
          La imagen no parece ser un Pokémon.
        </CardDescription>
        <div>
          <p className="text-xs text-gray-300 mb-1">Confianza (No Pokémon)</p>
          <div className="flex items-center space-x-2">
            <Progress value={Math.round((1 - pokemonData.confidence) * 100)} className="w-full h-2.5 bg-gray-700 [&>div]:bg-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">{Math.round((1-pokemonData.confidence) * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }

  // This handles the case where we have Pokémon data, but still need to show it, even if summary is loading/failed
  if (!pokemonData) { 
      // This case should ideally be covered by the "Pokedex Lista" or loading/error states in PokedexDevicePanelRight
      // If we reach here with no pokemonData, it's an unexpected state, show minimal fallback.
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-red-500/0 rounded-md">
          <HelpCircle className="w-20 h-20 text-gray-300 mb-4 opacity-70" />
          <p className="text-sm text-gray-200">
            Esperando datos del Pokémon...
          </p>
        </div>
      );
  }
  
  const { name, confidence, pokemonType, generation, description, summary } = pokemonData;
  const confidencePercentage = Math.round(confidence * 100);
  // Image and name section removed

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-2 space-y-2 bg-transparent text-white scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-red-500/50">
      {/* Image and Name div removed */}
      
      {/* Error specific to summary or other post-identification step, while basic Pokemon data is present */}
      {error && pokemonData.isPokemon && ( 
            <Alert variant="destructive" className="mb-2 bg-red-700/80 border-red-900 text-white">
                <Terminal className="h-4 w-4 text-yellow-300" />
                <AlertTitle className="text-yellow-300">Problema Adicional</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      <div>
        <p className="text-xs text-gray-300 mb-0.5 flex items-center"><HelpCircle className="mr-1 h-3 w-3" />Confianza ID</p>
        <div className="flex items-center space-x-1">
          <Progress value={confidencePercentage} className="w-full h-2.5 bg-gray-700 [&>div]:bg-green-400" />
          <span className="text-xs font-semibold text-green-300">{confidencePercentage}%</span>
        </div>
      </div>

      {pokemonType && pokemonType.length > 0 && (
        <div>
          <p className="text-xs text-gray-300 mb-0.5 flex items-center"><TypeIcon className="mr-1 h-3 w-3" />Tipo(s)</p>
          <div className="flex flex-wrap gap-1">
            {pokemonType.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-sky-600 text-white border-sky-700">{type}</Badge>
            ))}
          </div>
        </div>
      )}

      {generation && (
        <div>
          <p className="text-xs text-gray-300 mb-0.5 flex items-center"><Sparkles className="mr-1 h-3 w-3" />Generación</p>
          <p className="text-sm text-gray-100">
            {generation}
          </p>
        </div>
      )}
      
      {description && (
        <div>
          <p className="text-xs text-gray-300 mb-0.5 flex items-center"><BookOpen className="mr-1 h-3 w-3" />Descripción</p>
          <p className="text-sm text-gray-100 leading-snug p-1.5 bg-red-700/30 rounded-md">
            {description}
          </p>
        </div>
      )}

      {/* Summary is displayed on the black screen now, so this can be removed or repurposed if needed */}
      {/* 
      {summary && (
        <div>
          <p className="text-xs text-gray-300 mb-0.5 flex items-center"><BookOpenText className="mr-1 h-3 w-3" />Resumen IA</p>
          <p className="text-sm text-gray-100 leading-snug p-1.5 bg-red-700/50 rounded-md">
            {summary}
          </p>
        </div>
      )}
      */}
    </div>
  );
}
