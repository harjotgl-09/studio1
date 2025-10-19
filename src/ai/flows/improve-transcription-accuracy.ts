'use server';

/**
 * @fileOverview Improves the accuracy of transcriptions, especially for dysarthric speech.
 *
 * - improveTranscriptionAccuracy - A function that enhances transcription accuracy.
 * - ImproveTranscriptionAccuracyInput - The input type for the improveTranscriptionAccuracy function.
 * - ImproveTranscriptionAccuracyOutput - The return type for the improveTranscriptionAccuracy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveTranscriptionAccuracyInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  originalTranscription: z.string().describe('The initial transcription of the audio.'),
});
export type ImproveTranscriptionAccuracyInput = z.infer<
  typeof ImproveTranscriptionAccuracyInputSchema
>;

const ImproveTranscriptionAccuracyOutputSchema = z.object({
  improvedTranscription: z
    .string()
    .describe('The improved transcription of the audio.'),
});
export type ImproveTranscriptionAccuracyOutput = z.infer<
  typeof ImproveTranscriptionAccuracyOutputSchema
>;

export async function improveTranscriptionAccuracy(
  input: ImproveTranscriptionAccuracyInput
): Promise<ImproveTranscriptionAccuracyOutput> {
  return improveTranscriptionAccuracyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveTranscriptionAccuracyPrompt',
  input: {schema: ImproveTranscriptionAccuracyInputSchema},
  output: {schema: ImproveTranscriptionAccuracyOutputSchema},
  prompt: `You are an AI expert in improving the accuracy of audio transcriptions, especially for
people with dysarthria. Use the audio data and the original transcription to produce an improved
transcription.

Original Transcription: {{{originalTranscription}}}

Audio: {{media url=audioDataUri}}

Improved Transcription:`,
});

const improveTranscriptionAccuracyFlow = ai.defineFlow(
  {
    name: 'improveTranscriptionAccuracyFlow',
    inputSchema: ImproveTranscriptionAccuracyInputSchema,
    outputSchema: ImproveTranscriptionAccuracyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
