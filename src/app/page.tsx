import { Header } from '@/components/header';
import { VoiceScribeClient } from '@/components/voice-scribe-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <VoiceScribeClient />
      </main>
    </div>
  );
}
