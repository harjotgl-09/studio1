'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleAuthError = (error: any) => {
    console.error(error);
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        title = 'User Not Found';
        description = 'No user found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        title = 'Incorrect Password';
        description = 'The password you entered is incorrect. Please try again.';
        break;
      case 'auth/email-already-in-use':
        title = 'Email Already in Use';
        description =
          'This email is already associated with an account. Please sign in.';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'The password must be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        title = 'Invalid Email';
        description = 'Please enter a valid email address.';
        break;
    }

    toast({
      variant: 'destructive',
      title: title,
      description: description,
    });
  };

  const handleSignUp = async () => {
    if (!auth) return;
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure your passwords match.',
      });
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    toast({
      title: 'Apple Sign-In Not Implemented',
      description:
        'Setting up Apple Sign-In requires a paid Apple Developer account and additional manual configuration.',
    });
  };
  
  const handlePasswordReset = async () => {
    if (!auth) return;
     if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
    } catch (error) {
       handleAuthError(error);
    } finally {
        setLoading(false);
    }
  }

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  if (user === undefined) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-6 h-8 w-8"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
               <div className="text-right">
                <Button variant="link" className="p-0 h-auto" onClick={handlePasswordReset} disabled={loading}>
                  Forgot your password?
                </Button>
              </div>
              <Button onClick={handleSignIn} className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
                  Google
                </Button>
                <Button variant="outline" onClick={handleAppleSignIn} disabled={loading}>
                  Apple
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Enter your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-6 h-8 w-8"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password-signup">Confirm Password</Label>
                <Input
                  id="confirm-password-signup"
                  type={passwordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
                <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
                  Google
                </Button>
                <Button variant="outline" onClick={handleAppleSignIn} disabled={loading}>
                  Apple
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
