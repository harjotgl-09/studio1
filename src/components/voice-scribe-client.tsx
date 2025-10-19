"use client";

import { improveTranscriptionAccuracy } from "@/ai/flows/improve-transcription-accuracy";
import { transcribeAudio } from "@/ai/flows/transcribe-audio-recording";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, LoaderCircle, Mic, Play, RefreshCw, Square, Voicemail, Wand2 } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";

type Status = "initial" | "recording" | "processing" | "success" | "improving" | "error";

export const VoiceScribeClient: FC = () => {
  const [status, setStatus] = useState<Status>("initial");
  const [transcription, setTranscription] = useState<string>("");
  const [improvedTranscription, setImprovedTranscription] = useState<string>("");
  const [audioURL, setAudioURL] = useState<string>("");
  const [audioDataUri, setAudioDataUri] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64DataUri = reader.result as string;
          setAudioDataUri(base64DataUri);
          try {
            const result = await transcribeAudio({ audioDataUri: base64DataUri });
            setTranscription(result.transcription);
            setStatus("success");
          } catch (error) {
            console.error("Transcription failed:", error);
            toast({
              variant: "destructive",
              title: "Transcription Failed",
              description: "Could not transcribe the audio. Please try again.",
            });
            setStatus("error");
          }
        };
      };

      mediaRecorderRef.current.start();
      setStatus("recording");
    } catch (error) {
      console.error("Failed to get microphone access:", error);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to record audio.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setStatus("processing");
    }
  };

  const handleImproveTranscription = async () => {
    if (!audioDataUri || !transcription) return;
    setStatus("improving");
    try {
      const result = await improveTranscriptionAccuracy({
        audioDataUri,
        originalTranscription: transcription,
      });
      setImprovedTranscription(result.improvedTranscription);
    } catch (error) {
      console.error("Improvement failed:", error);
      toast({
        variant: "destructive",
        title: "Improvement Failed",
        description: "Could not improve the transcription. Please try again.",
      });
    } finally {
      setStatus("success");
    }
  };

  const handlePlayTranscription = (text: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleReset = () => {
    setStatus("initial");
    setTranscription("");
    setImprovedTranscription("");
    setAudioURL("");
    setAudioDataUri("");
  };


  const renderContent = () => {
    switch (status) {
      case "initial":
      case "error":
        return (
          <div className="text-center flex flex-col items-center gap-6">
            <div className="p-8 bg-primary/10 rounded-full">
                <Voicemail size={64} className="text-primary" />
            </div>
            <h2 className="text-2xl font-semibold font-headline">Ready to Transcribe</h2>
            <p className="text-muted-foreground max-w-md">
              Press the record button to start capturing your voice. We'll transcribe it for you in seconds.
            </p>
            <Button size="lg" className="rounded-full w-48 h-16 text-lg gap-3" onClick={handleStartRecording}>
              <Mic size={24} /> Record
            </Button>
            {status === "error" && <Button variant="outline" onClick={handleReset}><RefreshCw className="mr-2"/>Try Again</Button>}
          </div>
        );
      case "recording":
        return (
          <div className="text-center flex flex-col items-center gap-6">
            <div className="p-8 bg-destructive/10 rounded-full animate-pulse">
                <Mic size={64} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold font-headline">Recording...</h2>
            <p className="text-muted-foreground">Speak now. Press stop when you're finished.</p>
            <Button variant="destructive" size="lg" className="rounded-full w-48 h-16 text-lg gap-3" onClick={handleStopRecording}>
              <Square size={24} /> Stop
            </Button>
          </div>
        );
      case "processing":
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardFooter>
          </Card>
        );
      case "improving":
      case "success":
        const textToDisplay = improvedTranscription || transcription;
        return (
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Your Transcription</CardTitle>
              <CardDescription>
                {improvedTranscription ? "AI-improved transcription below." : "Here's what we heard. You can play, copy, or improve it."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={textToDisplay}
                className="h-48 text-base bg-secondary/30"
                aria-label="Transcription text"
              />
              <div className="mt-4">
                <audio src={audioURL} controls className="w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
               <Button variant="outline" onClick={handleReset}>
                <RefreshCw size={16} className="mr-2" /> Record New
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handlePlayTranscription(textToDisplay)} aria-label="Play transcription">
                  <Play />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(textToDisplay)} aria-label="Copy transcription">
                  {isCopied ? <Check className="text-green-500" /> : <Copy />}
                </Button>
                <Button onClick={handleImproveTranscription} disabled={status === "improving"}>
                  {status === "improving" ? (
                    <LoaderCircle className="animate-spin mr-2" />
                  ) : (
                    <Wand2 className="mr-2" />
                  )}
                  {status === "improving" ? "Improving..." : "Improve Accuracy"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center justify-center text-center">
      {renderContent()}
    </div>
  );
};
