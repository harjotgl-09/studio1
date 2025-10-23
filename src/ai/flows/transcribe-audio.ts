'use server';
/**
 * @fileOverview A flow that transcribes audio using the Gemini model.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranscribeInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export async function transcribeAudio(
  input: z.infer<typeof TranscribeInputSchema>
): Promise<string> {
  const {text} = await ai.generate({
    prompt: [
      {text: 'Transcribe the following audio. Respond only with the transcribed text.'},
      {media: {url: input.audioDataUri}},
    ],
  });
  return text;
}
