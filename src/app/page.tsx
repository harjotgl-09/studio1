'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Play, AlertTriangle, Volume2, Send, Settings, Ear, AppWindow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { transcribeWithHuggingFace } from '@/ai/flows/transcribe-with-hugging-face';
import { cn } from '@/lib/utils';


export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiTranscription, setAiTranscription] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const handleStartRecording = async () => {
    setAudioUrl(null);
    setIsRecording(true);
    setAiTranscription('');
    setTranscriptionError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      
      if (!supportedMimeType) {
        throw new Error("No supported MIME type found for MediaRecorder");
      }

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
        };
        reader.onerror = () => {
            console.error("FileReader error");
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
  
  const handleTranscribe = async () => {
    if (!audioUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No audio recorded to transcribe.',
      });
      return;
    }
  
    setIsTranscribing(true);
    setAiTranscription('');
    setTranscriptionError(null);
  
    try {
      const result = await transcribeWithHuggingFace({ audioDataUri: audioUrl });
      setAiTranscription(result);
    } catch (error: any) {
        console.error('Error in transcription flow:', error);
        const errorMessage = error.message || "An unknown error occurred during transcription.";
        setTranscriptionError(errorMessage);
        toast({
          variant: "destructive",
          title: "Transcription Failed",
          description: `There was a problem communicating with the AI model. ${errorMessage}`,
        });
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const handlePlayRecording = () => {
    if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => {
            console.error("Playback error:", e)
            toast({
                variant: 'destructive',
                title: 'Playback Error',
                description: 'Could not play the recorded audio.',
            });
        });
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

  const hasRecording = !!audioUrl;
  const hasTranscription = !!aiTranscription;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-between p-6 bg-background">
        <div className="w-full flex-1 flex flex-col items-center justify-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={cn(
              "w-48 h-48 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center",
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-primary hover:bg-primary/90",
              "ring-8 ring-primary/20"
            )}
          >
            <Mic className="w-20 h-20 text-primary-foreground" />
          </Button>
          <p className="mt-6 text-lg text-muted-foreground">
            {isRecording ? 'Recording...' : 'Tap to speak'}
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <div className="w-full min-h-[56px] rounded-full bg-secondary text-secondary-foreground px-6 py-4 flex items-center justify-between gap-4">
              <span className="flex-1 text-left truncate">
                {isTranscribing && 'Transcribing...'}
                {transcriptionError && <span className='text-destructive'>Error transcribing.</span>}
                {aiTranscription || (!isTranscribing && !transcriptionError && 'Clear Speech will appear here...')}
              </span>
               <Button size="icon" className="rounded-full bg-primary" onClick={handleTranscribe} disabled={!hasRecording || isTranscribing}>
                  {isTranscribing ? <Loader2 className="animate-spin"/> : <Send />}
                </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2">
              <Button variant="outline" className="rounded-full" disabled={!hasRecording}>👍 Yes</Button>
              <Button variant="outline" className="rounded-full" disabled={!hasRecording}>👎 No</Button>
              <Button variant="outline" className="rounded-full" disabled={!hasRecording}>😍 Thank You</Button>
          </div>

          <div className="flex items-center justify-between gap-4">
             <Button variant="ghost" size="icon" className="rounded-full"><AppWindow /></Button>
            <div className='flex items-center gap-2 p-1 bg-secondary rounded-full'>
              <Button 
                variant={hasRecording ? "default" : "secondary"}
                size="icon" 
                className="rounded-full" 
                onClick={handlePlayRecording}
                disabled={!hasRecording}
              >
                <Play />
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
        </div>
      </main>
    </div>
  );
}