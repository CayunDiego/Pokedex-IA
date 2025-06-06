
"use client";

import React from 'react';
import { PokedexLeftHinge } from './PokedexLeftHinge';
import { PokedexLeftHeader } from './PokedexLeftHeader';

export function PokedexClosedView() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-neutral-800 p-2">
      <div className="aspect-[5/8] h-[95%] max-h-[640px] bg-red-600 rounded-xl shadow-2xl flex flex-col relative border-y-4 border-l-4 border-red-700">
        
        <PokedexLeftHeader />
        {/* Fila inferior dividida en dos columnas */}
        <div className="grid grid-cols-[1fr_1.5rem] overflow-hidden h-full"> {/* Added h-full here */}
          {/* Main body */}
          <div className="flex-1 bg-red-600 p-4 relative">
            {/* Yellow triangle button */}
            <div 
              className="absolute top-1/2 left-2 transform -translate-y-1/2"
              style={{
                width: '0',
                height: '0',
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderLeft: '20px solid hsl(50, 85%, 60%)', // Yellow color
                filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))'
              }}
            >
              <div 
                className="absolute -left-[21px] top-[-12px]" // Adjusted to -21px for borderLeft: 20px
                style={{
                  width: '0',
                  height: '0',
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '20px solid hsl(50, 95%, 50%)', // Lighter Yellow for highlight
                }}
              />
            </div>
            {/* Bottom slit */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-red-900 rounded-full shadow-inner"></div>
          </div>
          <PokedexLeftHinge />
        </div>

      </div>
    </div>


  );
}
