
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrientation, type Orientation as OrientationType } from "@/hooks/useOrientation";
import { PokedexClosedView } from "./PokedexClosedView";
import { PokedexOpenView, type PokemonData as PokedexOpenViewPokemonData } from "./PokedexOpenView";
import { identifyPokemon, type IdentifyPokemonOutput } from "@/ai/flows/identify-pokemon";
import { summarizePokemonInfo, type SummarizePokemonInfoOutput } from "@/ai/flows/summarize-pokemon-info";

let synthVoices: SpeechSynthesisVoice[] = [];

function updateVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synthVoices = window.speechSynthesis.getVoices();
  }
}

export interface PokemonDisplayData {
  isPokemon: boolean;
  name?: string;
  id?: number;
  confidence: number;
  pokemonType?: string[]; // Original type names from identifyPokemon
  generation?: string;
  description?: string;
  summary?: string;
  spriteUrl?: string;
  height?: number;
  weight?: number;
  typeDetails?: { name: string; iconUrl: string }[]; // For type names and their icons
  stats?: { name: string; base_stat: number }[];
}

const MIN_POKEBALL_ANIMATION_MS = 5130;

export function PokedexShell() {
  const orientation: OrientationType = useOrientation();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonDisplayData | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [showPokeballAnimation, setShowPokeballAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const animationTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const identifyCallRef = useRef(0);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (synthVoices.length === 0) {
          updateVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.pitch = 2.0;
      utterance.rate = 1.3;
      utterance.volume = 1;

      const monicaVoice = synthVoices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('monica'));
      const spanishVoice = synthVoices.find(v => v.lang.startsWith('es'));

      if (monicaVoice) {
        utterance.voice = monicaVoice;
      } else if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onstart = () => {
          setIsSpeaking(true);
      };
      utterance.onend = () => {
          setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
          console.error(`Web Speech API error for "${text}": ${event.error}`);
          setIsSpeaking(false);
      };

      window.speechSynthesis.cancel();
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Error calling speechSynthesis.speak:", e);
        setIsSpeaking(false);
      }
    } else {
      console.warn("Web Speech API is not available in this browser.");
      setIsSpeaking(false);
    }
  }, [setIsSpeaking]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
      }
      if (animationTimeoutIdRef.current) {
        clearTimeout(animationTimeoutIdRef.current);
      }
    };
  }, []);

  const clearCapturedImage = useCallback(() => {
    setCapturedImageUri(null);
    setPokemonData(null);
    setError(null);
    setShowPokeballAnimation(false);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (animationTimeoutIdRef.current) {
      clearTimeout(animationTimeoutIdRef.current);
      animationTimeoutIdRef.current = null;
    }
    identifyCallRef.current = 0;
  }, [setIsSpeaking]);

  const handleImageCapture = useCallback((dataUri: string) => {
    clearCapturedImage();
    setCapturedImageUri(dataUri);

    setShowPokeballAnimation(true);
    if (animationTimeoutIdRef.current) {
      clearTimeout(animationTimeoutIdRef.current);
    }
    animationTimeoutIdRef.current = setTimeout(() => {
      setShowPokeballAnimation(false);
      animationTimeoutIdRef.current = null;
    }, MIN_POKEBALL_ANIMATION_MS);

    identifyCallRef.current += 1;
  }, [clearCapturedImage]);


  const handleIdentify = useCallback(async (currentCapturedImageUri: string) => {
    if (!currentCapturedImageUri) {
      setError("Error: No image captured for identification.");
      return;
    }

    setIsApiLoading(true);
    setError(null);

    let identificationResult: IdentifyPokemonOutput | null = null;
    let pokemonIdToSet: number | undefined = undefined;
    let pokemonHeightToSet: number | undefined = undefined;
    let pokemonWeightToSet: number | undefined = undefined;
    let typeDetailsToSet: { name: string; iconUrl: string }[] = [];
    let statsToSet: { name: string; base_stat: number }[] = [];

    try {
      identificationResult = await identifyPokemon({ photoDataUri: currentCapturedImageUri });

      if (identificationResult.isPokemon && identificationResult.pokemonName) {
        setPokemonData({
          isPokemon: true,
          name: identificationResult.pokemonName,
          id: undefined,
          confidence: identificationResult.confidence,
          pokemonType: identificationResult.pokemonType || [],
          generation: identificationResult.generation,
          description: identificationResult.description,
          spriteUrl: undefined,
          summary: undefined,
          height: undefined,
          weight: undefined,
          typeDetails: [],
          stats: [],
        });

        const [pokeApiResponse, summaryResultResponse] = await Promise.allSettled([
          fetch(`https://pokeapi.co/api/v2/pokemon/${identificationResult.pokemonName.toLowerCase()}`),
          summarizePokemonInfo({ pokemonName: identificationResult.pokemonName })
        ]);

        let spriteUrlToSet: string | undefined = undefined;
        if (pokeApiResponse.status === 'fulfilled' && pokeApiResponse.value.ok) {
          const pokeApiData = await pokeApiResponse.value.json();
          spriteUrlToSet = pokeApiData?.sprites?.other?.showdown?.front_default || pokeApiData?.sprites?.front_default;
          pokemonIdToSet = pokeApiData?.id;
          pokemonHeightToSet = pokeApiData?.height;
          pokemonWeightToSet = pokeApiData?.weight;

          if (pokeApiData.types && Array.isArray(pokeApiData.types)) {
            typeDetailsToSet = pokeApiData.types.map((typeObj: any) => {
              const typeUrlParts = typeObj.type.url.split('/');
              const typeId = typeUrlParts[typeUrlParts.length - 2]; 
              return {
                name: typeObj.type.name,
                iconUrl: `/types/type-${typeId}.png` 
              };
            });
          }

          if (pokeApiData.stats && Array.isArray(pokeApiData.stats)) {
            statsToSet = pokeApiData.stats.map((statObj: any) => ({
              name: statObj.stat.name,
              base_stat: statObj.base_stat,
            }));
          }

        } else {
          console.warn(`PokeAPI request failed for ${identificationResult.pokemonName}: ${pokeApiResponse.status === 'fulfilled' ? pokeApiResponse.value.status : 'Fetch error'}`);
        }

        let summaryText: string | undefined = undefined;
        if (summaryResultResponse.status === 'fulfilled' && summaryResultResponse.value.summary) {
          summaryText = summaryResultResponse.value.summary;
          const textToSpeak = `${identificationResult.pokemonName}... ${summaryText}`;
          speak(textToSpeak);
        } else {
            console.error("Error fetching summary:", summaryResultResponse.status === 'rejected' ? summaryResultResponse.reason : 'Summary was empty');
            summaryText = identificationResult.description || "No se pudo cargar el resumen.";
            const textToSpeak = `${identificationResult.pokemonName}. ${summaryText}`;
            speak(textToSpeak);
        }

        setPokemonData(prev => prev ? {
          ...prev,
          id: pokemonIdToSet,
          spriteUrl: spriteUrlToSet,
          summary: summaryText,
          height: pokemonHeightToSet,
          weight: pokemonWeightToSet,
          typeDetails: typeDetailsToSet,
          stats: statsToSet,
        } : {
          isPokemon: true,
          name: identificationResult.pokemonName,
          id: pokemonIdToSet,
          confidence: identificationResult.confidence,
          pokemonType: identificationResult.pokemonType || [],
          generation: identificationResult.generation,
          description: identificationResult.description,
          spriteUrl: spriteUrlToSet,
          summary: summaryText,
          height: pokemonHeightToSet,
          weight: pokemonWeightToSet,
          typeDetails: typeDetailsToSet,
          stats: statsToSet,
        });

      } else {
        const noPokemonErrorMsg = identificationResult?.description || "No se pudo identificar un Pokémon en la imagen.";
        setError(noPokemonErrorMsg);
        setPokemonData({
            isPokemon: false,
            confidence: identificationResult?.confidence || 0,
            name: "Desconocido",
            id: undefined,
            pokemonType: [],
            generation: "-",
            description: noPokemonErrorMsg,
            summary: "",
            spriteUrl: "/MissingNo.png",
            height: undefined,
            weight: undefined,
            typeDetails: [],
            stats: [],
        });
        speak(noPokemonErrorMsg);
      }

    } catch (err) {
      console.error("Error in identification process:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido durante la identificación.";
      setError(errorMessage);
      setPokemonData(prev => ({
        isPokemon: false,
        confidence: prev?.confidence || (identificationResult?.confidence ?? 0),
        name: prev?.name || "Error",
        id: undefined,
        description: prev?.description || errorMessage,
        pokemonType: prev?.pokemonType || [],
        generation: prev?.generation || "-",
        summary: prev?.summary || "",
        spriteUrl: "/MissingNo.png",
        height: undefined,
        weight: undefined,
        typeDetails: [],
        stats: [],
      }));
      speak("Error durante la identificación del Pokémon.");
    } finally {
      setIsApiLoading(false);
    }
  }, [speak]);

  useEffect(() => {
    if (capturedImageUri && identifyCallRef.current > 0) {
      handleIdentify(capturedImageUri);
    }
  }, [capturedImageUri, handleIdentify]);


  if (orientation === 'unknown') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  const commonViewProps = {
      capturedImageUri,
      pokemonData: pokemonData as PokedexOpenViewPokemonData | null,
      isApiLoading,
      showPokeballAnimation,
      error,
      onImageCapture: handleImageCapture,
      clearCapturedImage,
      isSpeaking,
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex items-center justify-center p-1 sm:p-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={orientation}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full w-full"
        >
          {orientation === "portrait" ? (
            <PokedexClosedView />
          ) : (
            <PokedexOpenView
              {...commonViewProps}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
