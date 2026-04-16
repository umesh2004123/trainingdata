import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !displayName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSubmitted(true);
    }
  };

  const handleGoogleSignup = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    toast.success("Signed up successfully");
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-4">
          <div className="bg-card border border-border rounded-xl p-8" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div className="h-12 w-12 rounded-full bg-status-completed/10 text-status-completed flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to <strong>{email}</strong>. Please verify your email, then an admin will review your account.
            </p>
          </div>
          <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-status-completed animate-pulse" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Telltale Platform</h1>
          </div>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" maxLength={100} required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignup}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}