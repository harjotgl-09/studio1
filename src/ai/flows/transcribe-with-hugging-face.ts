'use server';
/**
 * @fileOverview A flow that transcribes audio using a Hugging Face Inference Endpoint.
 */
import { z } from 'zod';

const TranscribeInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export async function transcribeWithHuggingFace(
  input: z.infer<typeof TranscribeInputSchema>
): Promise<string> {
  const model = 'openai/whisper-large-v3';
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error('Hugging Face API key is not set. Please add HUGGINGFACE_API_KEY to your .env file.');
  }

  try {
    const audioBlob = await (await fetch(input.audioDataUri)).blob();

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: audioBlob,
      }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Hugging Face API Error:", errorBody);
        throw new Error(`Failed to transcribe audio. Status: ${response.status}. Body: ${errorBody}`);
    }
    
    const result = await response.json();
    
    // Log the full response to see its structure
    console.log("Hugging Face API Response:", JSON.stringify(result, null, 2));

    if (result && result.text) {
        return result.text;
    } else {
      throw new Error('Transcription not found in the expected format.');
    }

  } catch (error: any) {
    console.error("Error in transcribeWithHuggingFace flow:", error);
    throw new Error(error.message || 'An unexpected error occurred during transcription.');
  }
}
