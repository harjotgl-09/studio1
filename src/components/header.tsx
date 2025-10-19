import { Droplet } from 'lucide-react';
import type { FC } from 'react';
import { Button } from './ui/button';

export const Header: FC = () => {
  return (
    <header className="w-full p-4 border-b bg-card/50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Droplet className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">Vitalink</h1>
        </div>
        <Button>Login</Button>
      </div>
    </header>
  );
};