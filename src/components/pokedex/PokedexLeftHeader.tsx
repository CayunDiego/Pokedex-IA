
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface PokedexLeftHeaderProps {
  isSpeaking?: boolean; 
}

export function PokedexLeftHeader({ isSpeaking }: PokedexLeftHeaderProps) {
  return (
    <div className="relative flex-shrink-0">
      <div className="p-2.5 w-full h-[116px] flex relative z-[100]">
        
        {/* Big Blue Light (Lens) */}
        <div className={cn(
          "relative w-16 h-16 bg-sky-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg mr-2",
          isSpeaking && "animate-glow-blue-light"
        )}>
          {/* Crystal ball effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-radial from-sky-200/70 via-sky-400/50 to-sky-600/80 opacity-70"></div>
            <div className="absolute top-1 left-2 w-5 h-5 bg-white/50 rounded-full blur-sm"></div>
            <div className="absolute top-2 left-3 w-3 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>

        {/* Small Lights Container - Aligned with the top of the blue light via parent's items-start */}
        <div className="flex gap-2 mt-1">
          {/* Red Light */}
          <div className="relative w-5 h-5 bg-red-400 rounded-full border-2 border-red-500 shadow-sm overflow-hidden">
            <div className="absolute inset-0 rounded-full">
              <div className="w-full h-full bg-gradient-radial from-red-200/70 via-red-400/50 to-red-600/80 opacity-70 rounded-full"></div>
              <div className="absolute top-[1px] left-[2px] w-2 h-2 bg-white/50 rounded-full blur-sm"></div>
              <div className="absolute top-[2px] left-[4px] w-1 h-1 bg-white/70 rounded-full"></div>
            </div>
          </div>
          {/* Yellow Light */}
          <div className="relative w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-500 shadow-sm overflow-hidden">
            <div className="absolute inset-0 rounded-full">
              <div className="w-full h-full bg-gradient-radial from-yellow-200/70 via-yellow-400/50 to-yellow-600/80 opacity-70 rounded-full"></div>
              <div className="absolute top-[1px] left-[2px] w-2 h-2 bg-white/50 rounded-full blur-sm"></div>
              <div className="absolute top-[2px] left-[4px] w-1 h-1 bg-white/70 rounded-full"></div>
            </div>
          </div>
          {/* Green Light */}
          <div className="relative w-5 h-5 bg-green-400 rounded-full border-2 border-green-500 shadow-sm overflow-hidden">
            <div className="absolute inset-0 rounded-full">
              <div className="w-full h-full bg-gradient-radial from-green-200/70 via-green-400/50 to-green-600/80 opacity-70 rounded-full"></div>
              <div className="absolute top-[1px] left-[2px] w-2 h-2 bg-white/50 rounded-full blur-sm"></div>
              <div className="absolute top-[2px] left-[4px] w-1 h-1 bg-white/70 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Curvas superpuestas */}
      <div className="absolute top-0 w-full h-[122px] flex overflow-hidden">
        {/* Bizagra pequeña */}
        <div className="absolute bottom-[6px] right-[0px] bg-red-500 w-[1.5rem] bg-gradient-to-r from-[#8B0000] via-[#C00D0D] to-[#8B0000] shadow-[0px_5px_5px_3px_#600707] z-[100]">
          <div className="w-[1.5rem] h-[2.875rem] bg-gradient-to-r from-[#600707] via-[#C00D0D] to-[#600707] border-t-2 border-b-2 border-[#600707] z-[200]" />
        </div>
        
        {/* Capa con clip-path */}
        <div
          className="relative w-full bg-red-700 z-[90]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% 2.875rem, 100% 70px, 65% 70px, 45% 122px, 0 122px, 0% 30%)",
          }}
        >
          {/* Sombra interna */}
          <div className="absolute h-[120px] md:h-[114px] w-full shadow-[-10px_6px_#5e0000] max-[768px]:shadow-[-10px_2px_#5e0000]" />
        </div>

        {/* Sombra externa */}
        <div className="absolute w-full h-[70px] bg-red-700 shadow-[-10px_6px_#5e0000] max-[768px]:shadow-[-10px_2px_#5e0000]" />
      </div>
    </div>
  );
}
