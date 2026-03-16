import { useState, useEffect, useRef } from "react";
import { register, login, googleLogin, saveToken, User } from "@/lib/auth";
import Icon from "@/components/ui/icon";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = "540477062466-8rir2l7nhfto5ai94chdt25bqk9hp1g4.apps.googleusercontent.com";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  defaultMode?: "login" | "register";
}

export default function AuthModal({ open, onClose, onSuccess, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !googleBtnRef.current) return;
    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          setError("");
          try {
            const result = await googleLogin(response.credential);
            saveToken(result.token);
            onSuccess(result.user, result.token);
            onClose();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Google login failed");
          } finally {
            setLoading(false);
          }
        },
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          width: googleBtnRef.current.offsetWidth || 360,
          text: "continue_with",
          shape: "rectangular",
        });
      }
    };
    if (window.google) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google) { clearInterval(interval); init(); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setLoading(false);
  };

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = mode === "register"
        ? await register(email, password, name)
        : await login(email, password);
      saveToken(result.token);
      onSuccess(result.user, result.token);
      reset();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-md border border-primary/20 bg-card rounded-2xl overflow-hidden shadow-2xl"
        style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.1), 0 25px 50px rgba(0,0,0,0.6)" }}
      >
        {/* Top gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={18} />
          </button>

          <p className="font-cormorant text-4xl font-light text-gold-gradient mb-1">
            {mode === "login" ? "Welcome back" : "Join Luna"}
          </p>
          <p className="font-golos text-xs text-muted-foreground tracking-wider">
            {mode === "login"
              ? "Sign in to access your content"
              : "Create an account to get started"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mx-8 mb-6 border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2.5 text-xs font-golos tracking-widest uppercase transition-all duration-200 ${
              mode === "login"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-2.5 text-xs font-golos tracking-widest uppercase transition-all duration-200 ${
              mode === "register"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {/* Google Button */}
        <div className="px-8 pb-4">
          <div ref={googleBtnRef} className="w-full flex justify-center" />
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-golos uppercase tracking-widest text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-8 pb-8 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-[10px] font-golos uppercase tracking-widest text-muted-foreground mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 font-golos text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-golos uppercase tracking-widest text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 font-golos text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-golos uppercase tracking-widest text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                required
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 pr-10 font-golos text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-golos text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground text-sm tracking-widest uppercase font-golos transition-all duration-300 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader" size={14} className="animate-spin" />
                {mode === "register" ? "Creating account..." : "Signing in..."}
              </span>
            ) : (
              mode === "register" ? "Create Account" : "Sign In"
            )}
          </button>

          {mode === "login" && (
            <p className="text-center text-xs font-golos text-muted-foreground pt-1">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Register
              </button>
            </p>
          )}
        </form>

        {/* Bottom gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>
    </div>
  );
}