'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, Ear, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { transcribeWithHuggingFace } from '@/ai/flows/transcribe-with-hugging-face';
import { diagnoseEmotion, Emotion } from '@/ai/flows/diagnose-emotion';
import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/AudioPlayer';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiTranscription, setAiTranscription] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('Neutral');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const emotionColors: Record<Emotion, { ring: string; background: string }> = {
    Neutral: { ring: 'ring-purple-500/30', background: 'bg-purple-500 hover:bg-purple-600' },
    Sadness: { ring: 'ring-blue-500/30', background: 'bg-blue-500 hover:bg-blue-600' },
    Joy: { ring: 'ring-yellow-500/30', background: 'bg-yellow-500 hover:bg-yellow-600' },
    Anger: { ring: 'ring-red-500/30', background: 'bg-red-500 hover:bg-red-600' },
  };
  
  const handleTranscribeAndDiagnose = async (audioDataUrl: string) => {
    if (!audioDataUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No audio recorded to process.',
      });
      return;
    }
  
    setIsTranscribing(true);
    setAiTranscription('');
    setTranscriptionError(null);
    setCurrentEmotion('Neutral');
  
    try {
      const transcription = await transcribeWithHuggingFace({ audioDataUri: audioDataUrl });
      setAiTranscription(transcription);

      if (transcription) {
        const emotion = await diagnoseEmotion({ text: transcription });
        setCurrentEmotion(emotion);
      }

    } catch (error: any) {
        console.error('Error in processing flow:', error);
        const errorMessage = error.message || "An unknown error occurred.";
        setTranscriptionError(errorMessage);
        toast({
          variant: "destructive",
          title: "Processing Failed",
          description: `There was a problem communicating with the AI model. ${errorMessage}`,
        });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStartRecording = async () => {
    setAudioUrl(null);
    setIsRecording(true);
    setAiTranscription('');
    setTranscriptionError(null);
    setCurrentEmotion('Neutral');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      const options = { mimeType: supportedMimeType };
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setAudioUrl(base64Audio);
            handleTranscribeAndDiagnose(base64Audio);
        };
        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            toast({
                variant: "destructive",
                title: "File Reading Error",
                description: "Could not read the recorded audio data.",
            });
        };
      };

      mediaRecorderRef.current.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start recording. Please ensure you have given microphone permissions.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
       if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };
  
  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported',
        description: 'Text-to-speech is not supported in your browser or there is no text to read.',
      });
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "The transcription has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: "Copy Failed",
        description: "Could not copy text to the clipboard.",
      });
    });
  };

  const hasTranscription = !!aiTranscription;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-between p-6 bg-background">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <>
                <div className={cn("absolute w-64 h-64 rounded-full animate-pulse", emotionColors[currentEmotion].background, "opacity-20")}></div>
                <div className={cn("absolute w-80 h-80 rounded-full animate-pulse delay-75", emotionColors[currentEmotion].background, "opacity-10")}></div>
                 <div className={cn("absolute w-96 h-96 rounded-full animate-pulse delay-150", emotionColors[currentEmotion].background, "opacity-5")}></div>
              </>
            )}
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={cn(
                "w-48 h-48 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center relative",
                isRecording 
                  ? emotionColors['Anger'].background // Use a consistent stop color
                  : emotionColors[currentEmotion].background,
                "ring-8",
                 isRecording ? 'ring-red-500/30' : emotionColors[currentEmotion].ring
              )}
              disabled={isTranscribing}
            >
              {isTranscribing ? <Loader2 className="w-20 h-20 text-primary-foreground animate-spin" /> : <Mic className="w-20 h-20 text-primary-foreground" />}
            </Button>
          </div>
          <p className="mt-8 text-lg text-muted-foreground">
            {isRecording ? 'Recording...' : isTranscribing ? 'Transcribing...' : 'Tap to speak'}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          {audioUrl && !isTranscribing && <AudioPlayer src={audioUrl} />}
          
          <div className="relative w-full">
            <div className="w-full min-h-[56px] rounded-2xl bg-secondary text-secondary-foreground px-6 py-4 flex items-center">
              <span className="flex-1 text-left whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                {isTranscribing && 'Transcribing...'}
                {transcriptionError && <span className='text-destructive'>Error transcribing.</span>}
                {aiTranscription || (!isTranscribing && !transcriptionError && 'Clear Speech will appear here...')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => handleCopyToClipboard(aiTranscription)}
              disabled={!hasTranscription}
            >
              <Copy />
            </Button>
            <Button 
              variant={hasTranscription ? "default" : "secondary"}
              size="icon" 
              className="rounded-full"
              onClick={() => handleReadAloud(aiTranscription)}
              disabled={!hasTranscription}
            >
              <Ear />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
