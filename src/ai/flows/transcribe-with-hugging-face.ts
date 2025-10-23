'use server';
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
  const { audioDataUri } = TranscribeInputSchema.parse(input);
  
  const base64Data = audioDataUri.split(',')[1];
  const audioBlob = Buffer.from(base64Data, 'base64');

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) {
    throw new Error("Hugging Face API token is not configured.");
  }
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
    {
      headers: { Authorization: `Bearer ${hfToken}` },
      method: "POST",
      body: audioBlob,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Hugging Face API Error:", errorBody);
    throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  return result.text;
}
