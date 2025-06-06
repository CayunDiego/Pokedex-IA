"use client";

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape' | 'unknown';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const getOrientationValue = (): Orientation => {
      return window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait';
    };

    setOrientation(getOrientationValue());

    const mediaQueryList = window.matchMedia("(orientation: landscape)");

    const handleChange = (event: MediaQueryListEvent) => {
      setOrientation(event.matches ? 'landscape' : 'portrait');
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);

  return orientation;
}
