'use client';
import { useUser, UserProvider } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is not defined, we are still loading.
    if (user === undefined) {
      return;
    }
    // If the user is null, they are not logged in.
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  // If the user is logged in, render the children.
  if (user) {
    return <>{children}</>;
  }

  // Otherwise, render a loading state.
  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-background text-foreground font-body">
      <header className="flex justify-between items-center p-4">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-40 h-40 rounded-full" />
        </div>
        <div className="w-full space-y-4">
          <div className="relative w-full">
            <Skeleton className="w-full rounded-full h-14" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-20 h-9 rounded-full" />
            <Skeleton className="w-20 h-9 rounded-full" />
            <Skeleton className="w-28 h-9 rounded-full" />
          </div>
        </div>
      </main>
      <footer className="flex justify-between items-center p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </footer>
    </div>
  )
}


export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthGuard>{children}</AuthGuard>
    </UserProvider>
  );
}