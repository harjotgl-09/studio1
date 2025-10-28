import { Settings } from 'lucide-react';
import type { FC } from 'react';
import { Button } from './ui/button';

export const Header: FC = () => {
  return (
    <header className="w-full p-4 flex justify-end">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </Button>
    </header>
  );
};
