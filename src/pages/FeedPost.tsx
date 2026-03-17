import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import AuthModal from "@/components/AuthModal";
import { getToken, getMe, clearToken, User } from "@/lib/auth";

const AUTH_URL = "https://functions.poehali.dev/0f69b8f2-267a-4d9e-b597-2ba21b26ce35";

interface MediaItem {
  id: number;
  title: string | null;
  description: string | null;
  type: string;
  url: string | null;
  thumbnail_url: string | null;
  tier: string;
  locked: boolean;
  created_at: string;
}

export default function FeedPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe(token).then(setUser).catch(() => clearToken());
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    fetch(`${AUTH_URL}/?action=get_media&id=${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setItem(data.item || null))
      .finally(() => setLoading(false));
  }, [id, user]);

  const logout = () => {
    clearToken();
    setUser(null);
    setUserMenuOpen(false);
  };

  const onAuthSuccess = (u: User) => {
    setUser(u);
    setAuthOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={onAuthSuccess}
        onSwitchMode={(m) => setAuthMode(m)}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-sm border-b" style={{ backgroundColor: "rgba(245,240,232,0.9)", borderColor: "#d4c9b0" }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-golos text-sm transition-colors" style={{ color: "#8b7355" }}>
          <Icon name="ArrowLeft" size={16} />
          Back
        </button>
        <Link to="/" className="font-cormorant text-xl font-light" style={{ color: "#8b7355" }}>
          Mia Rey
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium" style={{ color: "#8b7355" }}>
                {(user.name || user.email)[0].toUpperCase()}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-44 rounded-lg border shadow-lg py-1 z-50" style={{ backgroundColor: "#f5f0e8", borderColor: "#d4c9b0" }}>
                  <div className="px-4 py-2 text-xs font-golos border-b truncate" style={{ color: "#a0916e", borderColor: "#d4c9b0" }}>{user.email}</div>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-golos hover:bg-black/5" style={{ color: "#8b7355" }}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="text-sm font-golos px-4 py-1.5 border rounded-full" style={{ color: "#8b7355", borderColor: "#d4c9b0" }}>
              Sign in
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#a0916e" } as React.CSSProperties} />
          </div>
        ) : !item ? (
          <div className="text-center py-20">
            <p className="font-golos text-sm mb-4" style={{ color: "#a0916e" }}>Post not found</p>
            <Link to="/feed" className="text-sm font-golos underline" style={{ color: "#8b7355" }}>Back to feed</Link>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ backgroundColor: "#fff8f0", borderColor: "#e8ddd0" }}>
            {/* Media */}
            <div className="relative w-full" style={{ aspectRatio: item.type === "video" ? "16/9" : "4/5" }}>
              {item.locked ? (
                <>
                  {item.thumbnail_url && (
                    <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" style={{ filter: "blur(14px) brightness(0.65)", transform: "scale(1.1)" }} />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,240,232,0.9)" }}>
                      <Icon name="Lock" size={24} style={{ color: "#8b7355" } as React.CSSProperties} />
                    </div>
                    <p className="font-cormorant text-2xl text-white font-light">
                      {item.tier === "vip" ? "VIP Content" : "Exclusive Content"}
                    </p>
                    <p className="font-golos text-xs text-white/70 uppercase tracking-widest">
                      {item.tier === "vip" ? "Available for VIP subscribers" : "Available for subscribers"}
                    </p>
                    <div className="flex flex-col gap-2 mt-2 w-48">
                      <a href="https://www.fanvue.com/miarey" target="_blank" rel="noopener noreferrer"
                        className="w-full py-2.5 text-xs font-golos tracking-widest uppercase rounded-full text-center transition-all"
                        style={{ backgroundColor: "#8b7355", color: "#fff" }}>
                        Subscribe on Fanvue
                      </a>
                      <a href="https://boosty.to/miarey" target="_blank" rel="noopener noreferrer"
                        className="w-full py-2.5 text-xs font-golos tracking-widest uppercase rounded-full text-center border transition-all"
                        style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}>
                        Subscribe on Boosty
                      </a>
                    </div>
                  </div>
                </>
              ) : item.type === "video" && item.url ? (
                <video src={item.url} controls className="w-full h-full object-contain" style={{ backgroundColor: "#000" }} />
              ) : item.url ? (
                <img src={item.url} alt={item.title || ""} className="w-full h-full object-cover" />
              ) : null}
            </div>

            {/* Info */}
            <div className="px-5 py-4">
              {item.title && (
                <h1 className="font-cormorant text-2xl font-light mb-1" style={{ color: "#5c4a32" }}>{item.title}</h1>
              )}
              <p className="font-golos text-xs mb-3" style={{ color: "#b8a882" }}>
                {new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              {item.description && (
                <p className="font-golos text-sm leading-relaxed" style={{ color: "#7a6548" }}>{item.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Back to feed */}
        <div className="text-center mt-8">
          <Link to="/feed" className="font-golos text-sm underline-offset-4 hover:underline" style={{ color: "#a0916e" }}>
            ← Back to feed
          </Link>
        </div>
      </div>
    </div>
  );
}
