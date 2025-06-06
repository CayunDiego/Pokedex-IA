// src/ai/flows/identify-pokemon.ts
'use server';
/**
 * @fileOverview A flow to identify a Pokemon from an image, providing its name, type, generation, and a brief description.
 *
 * - identifyPokemon - A function that handles the pokemon identification process.
 * - IdentifyPokemonInput - The input type for the identifyPokemon function.
 * - IdentifyPokemonOutput - The return type for the identifyPokemon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPokemonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a Pokemon card or figure, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type IdentifyPokemonInput = z.infer<typeof IdentifyPokemonInputSchema>;

const IdentifyPokemonOutputSchema = z.object({
  isPokemon: z.boolean().describe('Indica si la imagen analizada corresponde a un Pokémon.'),
  pokemonName: z.string().optional().describe('El nombre del Pokémon identificado en español (si es un Pokémon).'),
  confidence: z.number().describe('El nivel de confianza de la identificación (0-1).'),
  pokemonType: z.array(z.string()).optional().describe('El tipo o tipos del Pokémon en español (ej. Agua, Fuego) (si es un Pokémon).'),
  generation: z.string().optional().describe('La generación a la que pertenece el Pokémon en español (ej. "Generación I", "II") (si es un Pokémon).'),
  description: z.string().optional().describe('Una breve descripción del Pokémon en español (si es un Pokémon).')
});
export type IdentifyPokemonOutput = z.infer<typeof IdentifyPokemonOutputSchema>;

export async function identifyPokemon(input: IdentifyPokemonInput): Promise<IdentifyPokemonOutput> {
  return identifyPokemonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPokemonPrompt',
  input: {schema: IdentifyPokemonInputSchema},
  output: {schema: IdentifyPokemonOutputSchema},
  prompt: `Eres un experto mundial en Pokémon, con un conocimiento enciclopédico de todas las especies, sus características, tipos y generaciones. Tu tarea es analizar una imagen proporcionada por el usuario para identificar si contiene un Pokémon y, de ser así, proporcionar detalles específicos. La imagen podría ser una fotografía de una carta de Pokémon, una figura de juguete, una captura de pantalla de un videojuego, arte oficial, o incluso un dibujo.

Analiza la siguiente imagen con sumo detalle:
{{media url=photoDataUri}}

Instrucciones Clave:
1.  **Evaluación Primaria**: Con la máxima precisión, determina si la imagen principal en la foto es un Pokémon. Establece el campo 'isPokemon' en \`true\` si lo es, o \`false\` en caso contrario.
2.  **Identificación Detallada (Solo si es un Pokémon)**:
    *   Si y solo si 'isPokemon' es \`true\`, identifica el Pokémon. Debes proporcionar:
        *   \`pokemonName\`: El nombre oficial y completo del Pokémon.
        *   \`pokemonType\`: Un array con su(s) tipo(s) elemental(es) (ej: Agua, Fuego/Volador).
        *   \`generation\`: La generación a la que pertenece (ej: "Generación I", "Generación IV").
        *   \`description\`: Una breve descripción enciclopédica del Pokémon, destacando alguna característica o dato interesante.
    *   Toda esta información (nombre, tipo(s), generación, descripción) DEBE estar en español.
    *   Presta especial atención a las características visuales distintivas, colores, formas y cualquier detalle único del Pokémon para asegurar una identificación lo más precisa posible. Compara con tu vasto conocimiento de todos los Pokémon existentes.
3.  **Nivel de Confianza (\`confidence\`)**: Proporciona un valor numérico entre 0.0 y 1.0 que refleje tu nivel de confianza en la identificación.
    *   Una confianza de 1.0 significa certeza absoluta.
    *   Una confianza inferior a 0.5 sugiere duda significativa.
    *   Este valor debe reflejar tu certeza tanto sobre si es un Pokémon como sobre la identidad específica del mismo.
4.  **Caso de No Ser un Pokémon o Duda Extrema**:
    *   Si 'isPokemon' es \`false\`, o si la imagen es demasiado ambigua para una identificación confiable (confianza < 0.3), puedes omitir los campos \`pokemonName\`, \`pokemonType\`, \`generation\`, y \`description\`. La descripción podría indicar por qué no se pudo identificar (ej: "Imagen muy borrosa", "No parece ser un Pokémon conocido").

Tu reputación como el mayor experto Pokémon está en juego. Es crucial ser preciso. Es preferible indicar una baja confianza o no identificar un Pokémon si no estás seguro, en lugar de proporcionar información incorrecta.`,
});

const identifyPokemonFlow = ai.defineFlow(
  {
    name: 'identifyPokemonFlow',
    inputSchema: IdentifyPokemonInputSchema,
    outputSchema: IdentifyPokemonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
