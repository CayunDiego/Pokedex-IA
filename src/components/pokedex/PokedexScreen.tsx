
"use client";

import React from 'react';

interface PokedexScreenProps {
  children: React.ReactNode;
}

export function PokedexScreen({ children }: PokedexScreenProps) {
  // The clip-path classes .clip-pokedex and .clip-pokedex-inner will be defined in globals.css
  return (
    <div
      className="bg-white w-full h-full relative shadow-inner clip-pokedex"
    >
      {/* Pantalla negra con mismo recorte */}
      <div
        className="absolute inset-10 bg-black clip-pokedex-inner flex" // Changed from inset-8 to inset-10
      >
        {children} {/* CapturePanel (which contains CameraFeed) goes here */}
      </div>

      {/* Botones superiores centrados */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        <div className="w-5 h-5 bg-red-700 rounded-full border-2 border-black"></div>
        <div className="w-5 h-5 bg-red-700 rounded-full border-2 border-black"></div>
      </div>

      {/* Botón inferior izquierdo */}
      <div className="absolute bottom-5 left-5 w-6 h-6 bg-red-700 rounded-full border-2 border-black z-10"></div>

      {/* Rejillas negras */}
      <div className="absolute bottom-4 right-10 space-y-1 z-10">
        <div className="w-8 h-0.5 bg-black"></div>
        <div className="w-8 h-0.5 bg-black"></div>
        <div className="w-8 h-0.5 bg-black"></div>
      </div>
    </div>
  );
}
