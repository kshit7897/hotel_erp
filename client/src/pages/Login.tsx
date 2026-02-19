import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChefHat, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/staff/kitchen');
      }
    }
  }, [user, userProfile, loading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      // Redirect handled by AuthProvider/Router logic
    } catch (error: any) {
      console.error("Login Error:", error);

      let message = "Invalid email or password. Please try again.";

      // Handle specific Firebase errors
      if (error.code === 'auth/network-request-failed') {
        message = "Network error. Please check your internet connection.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      } else if (error.code && error.code !== 'auth/invalid-credential' && error.code !== 'auth/wrong-password' && error.code !== 'auth/user-not-found') {
        // Show raw error for debugging other issues (like config/domain)
        message = error.message || "An unknown error occurred";
      }

      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://pixabay.com/get/g8a77e7e523c431b8edaf9c97ec1efd91b761f593ea726fef09240d6b1b0a82e9cc78472e82db72ca1248e6756340fff87810b2a5689fb7abdfd3aa5b750c982b_1280.jpg')] bg-cover bg-center" />

      <Card className="w-full max-w-md shadow-xl relative z-10 glass-card">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-primary">GourmetOS</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="chef@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Demo Admin: admin@gourmet.os / password123</p>
            <p>Demo Staff: staff@gourmet.os / password123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
