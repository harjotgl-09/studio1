import { Settings } from 'lucide-react';
import type { FC } from 'react';
import { Button } from './ui/button';

export const Header: FC = () => {
  return (
    <header className="w-full p-4 bg-background">
      <div className="flex items-center justify-between">
        <div></div>
        <h1 className="text-3xl font-bold text-primary tracking-tighter">SpeakIn'</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};
