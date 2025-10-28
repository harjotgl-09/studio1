'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('sarah.johnson@email.com');

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <header className="flex justify-between items-center p-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col px-6 py-2">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <div className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-full h-12 px-6"
          />
          <Input
            placeholder="28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="rounded-full h-12 px-6"
            type="number"
          />
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="rounded-full h-12 px-6">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="sarah.johnson@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full h-12 px-6"
            type="email"
          />
        </div>

        <Separator className="my-8 bg-primary h-0.5" />

        <h2 className="text-2xl font-bold mb-4">Emotion Colours</h2>
        {/* Color settings UI will go here */}
      </main>
    </div>
  );
}
