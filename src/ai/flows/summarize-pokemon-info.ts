'use server';
/**
 * @fileOverview Summarizes Pokemon information using GenAI.
 *
 * - summarizePokemonInfo - A function that summarizes information about a Pokemon.
 * - SummarizePokemonInfoInput - The input type for the summarizePokemonInfo function.
 * - SummarizePokemonInfoOutput - The return type for the summarizePokemonInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePokemonInfoInputSchema = z.object({
  pokemonName: z.string().describe('The name of the Pokemon to summarize information for.'),
});
export type SummarizePokemonInfoInput = z.infer<typeof SummarizePokemonInfoInputSchema>;

const SummarizePokemonInfoOutputSchema = z.object({
  summary: z.string().describe('Una descripción resumida del Pokémon, destacando sus características y habilidades clave. Debe estar en español.'),
});
export type SummarizePokemonInfoOutput = z.infer<typeof SummarizePokemonInfoOutputSchema>;

export async function summarizePokemonInfo(input: SummarizePokemonInfoInput): Promise<SummarizePokemonInfoOutput> {
  return summarizePokemonInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePokemonInfoPrompt',
  input: {schema: SummarizePokemonInfoInputSchema},
  output: {schema: SummarizePokemonInfoOutputSchema},
  prompt: `Resume las características y habilidades clave del Pokémon llamado {{{pokemonName}}}. La respuesta debe estar en español.\n`,
});

const summarizePokemonInfoFlow = ai.defineFlow(
  {
    name: 'summarizePokemonInfoFlow',
    inputSchema: SummarizePokemonInfoInputSchema,
    outputSchema: SummarizePokemonInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
