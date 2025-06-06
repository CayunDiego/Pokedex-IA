
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrientation, type Orientation as OrientationType } from "@/hooks/useOrientation";
import { PokedexClosedView } from "./PokedexClosedView";
import { PokedexOpenView, type PokemonData as PokedexOpenViewPokemonData } from "./PokedexOpenView";
import { identifyPokemon, type IdentifyPokemonOutput } from "@/ai/flows/identify-pokemon";
import { summarizePokemonInfo, type SummarizePokemonInfoOutput } from "@/ai/flows/summarize-pokemon-info";
import { useToast } from "@/hooks/use-toast";

// Ámbito del módulo para las voces y su función de actualización
let synthVoices: SpeechSynthesisVoice[] = [];

function updateVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synthVoices = window.speechSynthesis.getVoices();
    // console.log("Voces de SpeechSynthesis actualizadas:", synthVoices.map(v => ({name: v.name, lang: v.lang})));
  }
}

// Web Speech API function
function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Si las voces aún no se han cargado (por ejemplo, si speak se llama antes de que onvoiceschanged se dispare la primera vez)
    if (synthVoices.length === 0) {
        updateVoices(); 
        if (synthVoices.length === 0) {
            console.warn("La lista de voces sigue vacía después de un segundo intento de actualizar. El primer habla podría usar la voz predeterminada del navegador.");
        }
    }
    // console.log("Intentando hablar:", `"${text}"`);
    // console.log("Voces disponibles al momento de hablar:", synthVoices.map(v => ({name: v.name, lang: v.lang, default: v.default})));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; 
    utterance.pitch = 2.0;
    utterance.rate = 1.3;
    utterance.volume = 1;

    const monicaVoice = synthVoices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('monica'));
    const spanishVoice = synthVoices.find(v => v.lang.startsWith('es'));

    if (monicaVoice) {
      utterance.voice = monicaVoice;
      // console.log("Usando voz Monica:", monicaVoice.name);
    } else if (spanishVoice) {
      utterance.voice = spanishVoice;
      // console.log("Voz Monica no encontrada. Usando voz española por defecto:", spanishVoice.name);
    } else {
      // console.warn("No se encontró voz 'Monica' ni otra voz en español. Usando voz predeterminada para el idioma del sistema.");
    }
    
    utterance.onstart = () => {
        // console.log("Reproducción de voz iniciada para:", `"${text}"`);
    };
    utterance.onend = () => {
        // console.log("Reproducción de voz finalizada para:", `"${text}"`);
    };
    utterance.onerror = (event) => {
        // No registrar "interrupted" como un error crítico, ya que es esperado cuando cancelamos una locución.
        if (event.error === "interrupted") {
          // Opcional: console.info(`Speech synthesis interrupted for "${text}" (expected).`);
          return;
        }
        console.error(`Error en Web Speech API al intentar hablar "${text}":`, event.error, event);
        // Podríamos agregar un toast aquí si el error es informativo para el usuario.
    };
    
    // Cancelar cualquier habla anterior para evitar colas o errores si el usuario hace clic rápido.
    window.speechSynthesis.cancel(); 
    window.speechSynthesis.speak(utterance);

  } else {
    console.warn("Web Speech API no está disponible en este navegador.");
  }
}


export interface PokemonDisplayData {
  isPokemon: boolean;
  name?: string;
  confidence: number;
  pokemonType?: string[];
  generation?: string;
  description?: string;
  summary?: string; 
}

export function PokedexShell() {
  const orientation: OrientationType = useOrientation();
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifyAfterCapture, setIdentifyAfterCapture] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cargar voces inicialmente. Es importante hacerlo antes de que onvoiceschanged se dispare la primera vez.
      updateVoices();
      
      // Suscribirse a cambios en las voces disponibles
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        // Limpiar el listener cuando el componente se desmonte
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel(); // Cancelar cualquier habla pendiente al desmontar
        }
      };
    }
  }, []); 


  const handleImageCapture = useCallback((dataUri: string) => {
    setCapturedImageUri(dataUri);
    setPokemonData(null); 
    setError(null);
    setIdentifyAfterCapture(true); // Indicate that identification should occur
  }, []);

  const clearCapturedImage = useCallback(() => {
    setCapturedImageUri(null);
    setPokemonData(null);
    setError(null);
    setIdentifyAfterCapture(false); // Reset trigger if image is cleared
  }, []);

  const handleIdentify = useCallback(async () => {
    if (!capturedImageUri) {
      toast({ title: "Error", description: "No image captured.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setError(null);
    // No resetear pokemonData aquí para que la información anterior se mantenga visible mientras carga la nueva
    // setPokemonData(null); 

    try {
      const identificationResult: IdentifyPokemonOutput = await identifyPokemon({ photoDataUri: capturedImageUri });
      
      if (!identificationResult.isPokemon || !identificationResult.pokemonName) {
        setError("No se pudo identificar un Pokémon en la imagen o falta el nombre.");
        setPokemonData({
            isPokemon: false,
            confidence: identificationResult.confidence,
            name: "Desconocido",
            pokemonType: [],
            generation: "-",
            description: "No se pudo determinar la información del Pokémon.",
            summary: ""
        });
        setIsLoading(false);
        toast({ title: "Identificación Fallida", description: "No parece ser un Pokémon o no se pudo identificar con certeza.", variant: "default" });
        if (identificationResult.description && identificationResult.isPokemon === false) { 
          speak(`Análisis: ${identificationResult.description}`);
        } else {
          speak("No se pudo identificar un Pokémon con la imagen proporcionada.");
        }
        return;
      }
      
      toast({ title: "¡Pokémon Identificado!", description: `Identificado como: ${identificationResult.pokemonName}` });

      const summaryResult: SummarizePokemonInfoOutput = await summarizePokemonInfo({ pokemonName: identificationResult.pokemonName });

      let textToSpeak = "";
      if (summaryResult && summaryResult.summary) {
          textToSpeak = `${identificationResult.pokemonName}... ${summaryResult.summary}`;
      } else {
          textToSpeak = `${identificationResult.pokemonName}. ${identificationResult.description || 'No se encontró descripción.'}`;
          toast({ title: "Advertencia", description: "No se pudo obtener el resumen detallado del Pokémon.", variant: "default" });
      }
      speak(textToSpeak);
      
      const displayData: PokemonDisplayData = {
        isPokemon: true,
        name: identificationResult.pokemonName,
        confidence: identificationResult.confidence,
        pokemonType: identificationResult.pokemonType || [],
        generation: identificationResult.generation,
        description: identificationResult.description,
        summary: summaryResult?.summary || "No se pudo cargar el resumen.", 
      };
      setPokemonData(displayData); 

    } catch (err) {
      console.error("Error in identification process:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido durante la identificación.";
      setError(errorMessage);
      toast({ title: "Identificación Fallida", description: errorMessage, variant: "destructive" });
      setPokemonData(prev => prev || { // Preserve previous data on error, or set default error state
        isPokemon: !!prev?.isPokemon, // keep previous isPokemon status if available
        confidence: prev?.confidence || 0, 
        name: prev?.name || "Error", 
        description: prev?.description || "Error en la identificación.",
        pokemonType: prev?.pokemonType || [],
        generation: prev?.generation || "-",
        summary: prev?.summary || ""
      });
      speak("Error durante la identificación del Pokémon.");
    } finally {
      setIsLoading(false); 
    }
  }, [capturedImageUri, toast]);

  useEffect(() => {
    if (identifyAfterCapture && capturedImageUri && !isLoading) {
      handleIdentify();
      setIdentifyAfterCapture(false); // Reset the trigger
    }
  }, [identifyAfterCapture, capturedImageUri, isLoading, handleIdentify]);


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
      isLoading, 
      error,
      onImageCapture: handleImageCapture,
      clearCapturedImage,
      // onIdentify is no longer needed here as it's automatic
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
