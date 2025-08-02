// This file is intentionally left empty as the component is being removed.
// In a real file system, this file would be deleted.
// For the purpose of this tool, returning null effectively removes it.
import type React from 'react';

const InfoPanel: React.FC = () => {
  return null;
};

export { InfoPanel };
export type { PokemonData } from "./PokedexOpenView"; // Keep type export if used elsewhere, otherwise remove
