'use server';
/**
 * @fileOverview A flow to generate an image of a Pokemon.
 *
 * - generatePokemonImage - A function that handles the Pokemon image generation process.
 * - GeneratePokemonImageInput - The input type for the generatePokemonImage function.
 * - GeneratePokemonImageOutput - The return type for the generatePokemonImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePokemonImageInputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokemon to generate an image for.'),
});
export type GeneratePokemonImageInput = z.infer<typeof GeneratePokemonImageInputSchema>;

const GeneratePokemonImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image of the Pokemon, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GeneratePokemonImageOutput = z.infer<typeof GeneratePokemonImageOutputSchema>;

export async function generatePokemonImage(input: GeneratePokemonImageInput): Promise<GeneratePokemonImageOutput> {
  return generatePokemonImageFlow(input);
}

const generatePokemonImageFlow = ai.defineFlow(
  {
    name: 'generatePokemonImageFlow',
    inputSchema: GeneratePokemonImageInputSchema,
    outputSchema: GeneratePokemonImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a vibrant and dynamic image of the Pokémon named ${input.pokemonName}. The style should be suitable for a Pokedex entry, clear and showing the Pokémon's key features. Ensure the background is simple or transparent.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }
    
    return { imageDataUri: media.url };
  }
);
