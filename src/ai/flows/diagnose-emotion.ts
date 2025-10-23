'use server';
/**
 * @fileOverview An AI flow to diagnose emotion from text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EmotionEnum = z.enum(['Sadness', 'Joy', 'Anger', 'Neutral']);
export type Emotion = z.infer<typeof EmotionEnum>;

const DiagnoseEmotionInputSchema = z.object({
  text: z.string().describe('The text to analyze for emotion.'),
});

const DiagnoseEmotionOutputSchema = EmotionEnum;

export async function diagnoseEmotion(
  input: z.infer<typeof DiagnoseEmotionInputSchema>
): Promise<Emotion> {
  return diagnoseEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseEmotionPrompt',
  input: { schema: DiagnoseEmotionInputSchema },
  output: { schema: DiagnoseEmotionOutputSchema },
  prompt: `Analyze the following text and determine if the primary emotion is Sadness, Joy, Anger, or Neutral. Respond with only one of those four words.

Text: {{{text}}}
`,
});

const diagnoseEmotionFlow = ai.defineFlow(
  {
    name: 'diagnoseEmotionFlow',
    inputSchema: DiagnoseEmotionInputSchema,
    outputSchema: DiagnoseEmotionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || 'Neutral';
  }
);
