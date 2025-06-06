'use client';

import { FC, useEffect, useRef, useState } from 'react';

type DPadProps = {
  size?: number;       // Tamaño fijo (píxeles)
  responsive?: boolean; // Si es true, ocupa 100% del contenedor
};

const DPad: FC<DPadProps> = ({ size = 160, responsive = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(size);

  useEffect(() => {
    if (!responsive || !containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setContainerSize(width); // usamos el ancho como base
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [responsive]);

  const usedSize = responsive ? containerSize : size;
  const buttonSize = usedSize / 3;
  const centerSize = usedSize * 0.53;
  const innerCircle = usedSize * 0.2;

  const buttonBaseClasses =
    'group bg-neutral-800 flex items-center justify-center p-0 border border-neutral-900 ' +
    'shadow-[2px_2px_1px_#00000050] active:shadow-[inset_1px_1px_4px_#00000090] ' +
    'active:translate-y-[1px] transition duration-100';

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-3 grid-rows-3 gap-px"
      style={{
        width: responsive ? '75%' : size,
        height: responsive ? 'auto' : size,
        aspectRatio: responsive ? '1 / 1' : undefined,
      }}
    >
      {/* Fila 1 */}
      <div style={{ width: buttonSize, height: buttonSize }}></div>
      <button
        className={`${buttonBaseClasses} rounded-t-md`}
        style={{ width: buttonSize, height: buttonSize }}
        aria-label="D-pad Up"
      >
        <svg className="w-1/2 h-1/2 fill-neutral-500 group-hover:fill-neutral-300 transition-colors duration-100" viewBox="0 0 24 24">
          <path d="M12 4l-6 8h12z" />
        </svg>
      </button>
      <div style={{ width: buttonSize, height: buttonSize }}></div>

      {/* Fila 2 */}
      <button
        className={`${buttonBaseClasses} rounded-l-md`}
        style={{ width: buttonSize, height: buttonSize }}
        aria-label="D-pad Left"
      >
        <svg className="w-1/2 h-1/2 fill-neutral-500 group-hover:fill-neutral-300 transition-colors duration-100" viewBox="0 0 24 24">
          <path d="M4 12l8 6V6z" />
        </svg>
      </button>

      <div className="relative flex items-center justify-center" style={{ width: buttonSize, height: buttonSize }}>
        <div
          className="absolute flex items-center justify-center bg-neutral-800 rounded-full"
          style={{ width: centerSize, height: centerSize }}
        >
          <div
            className="bg-neutral-500 rounded-full"
            style={{ width: innerCircle, height: innerCircle }}
          ></div>
        </div>
      </div>

      <button
        className={`${buttonBaseClasses} rounded-r-md`}
        style={{ width: buttonSize, height: buttonSize }}
        aria-label="D-pad Right"
      >
        <svg className="w-1/2 h-1/2 fill-neutral-500 group-hover:fill-neutral-300 transition-colors duration-100" viewBox="0 0 24 24">
          <path d="M20 12l-8-6v12z" />
        </svg>
      </button>

      {/* Fila 3 */}
      <div style={{ width: buttonSize, height: buttonSize }}></div>
      <button
        className={`${buttonBaseClasses} rounded-b-md`}
        style={{ width: buttonSize, height: buttonSize }}
        aria-label="D-pad Down"
      >
        <svg className="w-1/2 h-1/2 fill-neutral-500 group-hover:fill-neutral-300 transition-colors duration-100" viewBox="0 0 24 24">
          <path d="M12 20l6-8H6z" />
        </svg>
      </button>
      <div style={{ width: buttonSize, height: buttonSize }}></div>
    </div>
  );
};

export default DPad;
