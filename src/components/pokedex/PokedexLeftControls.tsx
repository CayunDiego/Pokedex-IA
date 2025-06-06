
"use client";

import React from 'react';
import DPad from './DPad';

export function PokedexLeftControls() {
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
        <div className="w-full aspect-[4/3] bg-green-500 rounded-md border-2 border-green-700/80 custom-green-screen-shadow"></div>
      </div>

      {/* Column 3: D-pad */}
      <div className="flex justify-center items-end h-full"> {/* Contenedor para centrar el DPad */}
        <DPad responsive /> {/* Usando el nuevo DPad con un tamaño de 96px */}
      </div>
    </div>
  );
}
