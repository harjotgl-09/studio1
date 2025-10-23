'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Edit, Mic, Plus, User, Bot, Ear } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <header className="w-full p-4 bg-background">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>
      <main className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-secondary">
                  <User className="w-8 h-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">User Name</h2>
                <p className="text-sm text-muted-foreground">Age, Gender, Email</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="w-5 h-5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-4">Emotion Colours</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Sadness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span>Joy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Anger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span>Neutral</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <span className="font-medium">Allow Access</span>
            </div>
            <Switch defaultChecked />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="font-semibold text-lg">Personalize</h2>
              <p className="text-sm text-muted-foreground">Add custom sounds and words</p>
            </div>
            <Button variant="secondary" size="icon" className="rounded-full bg-secondary">
              <Plus className="w-6 h-6" />
            </Button>
          </CardContent>
        </Card>
        
        <div className="flex-grow"></div>

      </main>
        <footer className="p-4 flex justify-center">
            <div className="flex items-center gap-2 p-1 bg-secondary rounded-full">
                <Button variant={"ghost"} size="icon" className="rounded-full bg-accent text-accent-foreground">
                    <Bot className="w-6 h-6" />
                </Button>
                <Button variant={"ghost"} size="icon" className="rounded-full">
                    <Ear className="w-6 h-6 text-muted-foreground" />
                </Button>
            </div>
        </footer>
    </div>
  );
}
