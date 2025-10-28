'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Loader2, Volume2, Menu, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeWithHuggingFace } from '@/ai/flows/transcribe-with-hugging-face';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [userInput, setUserInput] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();

  const handleStartRecording = async () => {
    setAudioUrl(null);
    setIsRecording(true);
    setTranscription('');
    setUserInput('Listening...');
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
          setUserInput('');
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          toast({
            variant: "destructive",
            title: "File Reading Error",
            description: "Could not read the recorded audio data.",
          });
          setUserInput('');
        };
      };

      mediaRecorderRef.current.start();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setUserInput('');
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
    if (!audioUrl && !userInput) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No audio recorded or text entered.',
      });
      return;
    }
  
    setIsTranscribing(true);
    setTranscription('');
  
    try {
      let resultText = userInput;
      if (audioUrl && !userInput) {
        resultText = await transcribeWithHuggingFace({ audioDataUri: audioUrl });
      }
      setTranscription(resultText);
      setUserInput(resultText);
    } catch (error: any) {
        console.error('Error transcribing:', error);
        toast({
          variant: "destructive",
          title: "Transcription Failed",
          description: error.message || "There was a problem communicating with the AI model.",
        });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleReplay = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    } else if (transcription) {
      // Read out the transcription
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(transcription);
        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          variant: 'destructive',
          title: 'Unsupported',
          description: 'Text-to-speech is not supported in your browser.',
        });
      }
    }
  };

  const handleQuickButton = (text: string) => {
    setUserInput(text);
  }

  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <header className="flex justify-end p-4">
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex-1 flex items-center justify-center">
          <Button
            onClick={handleMicClick}
            className={`w-40 h-40 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center relative ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 ring-8 ring-red-500/30'
                : 'bg-primary hover:bg-primary/90 ring-8 ring-primary/30'
            }`}
            disabled={isTranscribing}
          >
            {isTranscribing ? <Loader2 className="w-16 h-16 text-primary-foreground animate-spin" /> : <Mic className="w-16 h-16 text-primary-foreground" />}
          </Button>
        </div>

        <div className="w-full space-y-4">
            <div className="relative w-full">
                <Input
                placeholder="Listening..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full rounded-full h-14 pl-6 pr-16 text-lg"
                disabled={isRecording || isTranscribing}
                />
                <Button 
                    onClick={handleTranscribe}
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary"
                    disabled={isTranscribing || (!audioUrl && !userInput) || isRecording}
                >
                    <Send className="w-5 h-5" />
                </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => handleQuickButton('Yes')}>Yes</Button>
                <Button variant="outline" className="rounded-full" onClick={() => handleQuickButton('No')}>No</Button>
                <Button variant="outline" className="rounded-full" onClick={() => handleQuickButton('Thank You')}>Thank You</Button>
            </div>
        </div>
      </main>

      <footer className="flex justify-between items-center p-4">
        <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleReplay} disabled={!audioUrl && !transcription}>
            <Volume2 className="w-6 h-6 text-muted-foreground" />
        </Button>
      </footer>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
}
