import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  likes_count: number;
  user_liked: boolean;
}

async function fetchMedia(token?: string | null): Promise<MediaItem[]> {
  const res = await fetch(`${AUTH_URL}/?action=get_media`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  return data.items || [];
}

const GRAFFITI_LEFT = [
  { text: "♥", top: "6%", left: "12px", size: "2.8rem", color: "#e8a0b0", rotate: "-14deg", opacity: 0.55 },
  { text: "mia rey", top: "12%", left: "28px", size: "0.9rem", color: "#c4a35a", rotate: "8deg", opacity: 0.45, script: true },
  { text: "✦", top: "20%", left: "8px", size: "2rem", color: "#b0c4de", rotate: "-22deg", opacity: 0.4 },
  { text: "xoxo", top: "28%", left: "18px", size: "0.85rem", color: "#d4956a", rotate: "12deg", opacity: 0.5, script: true },
  { text: "♡", top: "36%", left: "4px", size: "3.5rem", color: "#e8a0b0", rotate: "-8deg", opacity: 0.35 },
  { text: "✨ love", top: "45%", left: "32px", size: "0.8rem", color: "#8b7355", rotate: "-18deg", opacity: 0.45, script: true },
  { text: "★", top: "53%", left: "10px", size: "1.6rem", color: "#c4a35a", rotate: "16deg", opacity: 0.4 },
  { text: "💋", top: "61%", left: "22px", size: "1.2rem", color: "#e8a0b0", rotate: "-10deg", opacity: 0.5 },
  { text: "♥", top: "69%", left: "6px", size: "2.2rem", color: "#b0c4de", rotate: "22deg", opacity: 0.35 },
  { text: "always", top: "77%", left: "26px", size: "0.8rem", color: "#c4a35a", rotate: "-14deg", opacity: 0.45, script: true },
  { text: "✿", top: "84%", left: "8px", size: "2.5rem", color: "#e8a0b0", rotate: "6deg", opacity: 0.4 },
  { text: "dreaming", top: "91%", left: "14px", size: "0.8rem", color: "#d4956a", rotate: "-20deg", opacity: 0.45, script: true },
];

const GRAFFITI_RIGHT = [
  { text: "✦", top: "5%", right: "14px", size: "2rem", color: "#c4a35a", rotate: "18deg", opacity: 0.4 },
  { text: "be mine", top: "12%", right: "20px", size: "0.85rem", color: "#e8a0b0", rotate: "-12deg", opacity: 0.5, script: true },
  { text: "♡", top: "20%", right: "6px", size: "3.8rem", color: "#e8a0b0", rotate: "10deg", opacity: 0.35 },
  { text: "✨ magic", top: "28%", right: "24px", size: "0.8rem", color: "#8b7355", rotate: "16deg", opacity: 0.45, script: true },
  { text: "♥", top: "36%", right: "8px", size: "2.5rem", color: "#d4956a", rotate: "-25deg", opacity: 0.4 },
  { text: "gorgeous", top: "44%", right: "18px", size: "0.85rem", color: "#c4a35a", rotate: "8deg", opacity: 0.5, script: true },
  { text: "★", top: "52%", right: "4px", size: "2.8rem", color: "#b0c4de", rotate: "-12deg", opacity: 0.35 },
  { text: "💋", top: "60%", right: "22px", size: "1.2rem", color: "#e8a0b0", rotate: "20deg", opacity: 0.5 },
  { text: "✿", top: "68%", right: "10px", size: "2.2rem", color: "#c4a35a", rotate: "-8deg", opacity: 0.4 },
  { text: "art & soul", top: "76%", right: "26px", size: "0.8rem", color: "#d4956a", rotate: "14deg", opacity: 0.45, script: true },
  { text: "♥", top: "83%", right: "6px", size: "3rem", color: "#e8a0b0", rotate: "-18deg", opacity: 0.35 },
  { text: "forever", top: "91%", right: "16px", size: "0.8rem", color: "#8b7355", rotate: "10deg", opacity: 0.45, script: true },
];

export default function Feed() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe(token).then(setUser).catch(() => clearToken());
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    fetchMedia(token).then(setItems).finally(() => setLoading(false));
  }, [user]);

  const logout = () => {
    clearToken();
    setUser(null);
    setUserMenuOpen(false);
  };

  const onAuthSuccess = (u: User) => {
    setUser(u);
    setAuthOpen(false);
  };

  const toggleLike = async (item: MediaItem) => {
    const token = getToken();
    if (!token || !user) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    if (likingIds.has(item.id)) return;
    setLikingIds((prev) => new Set(prev).add(item.id));
    setItems((prev) => prev.map((i) =>
      i.id === item.id
        ? { ...i, user_liked: !i.user_liked, likes_count: i.user_liked ? i.likes_count - 1 : i.likes_count + 1 }
        : i
    ));
    try {
      await fetch(`${AUTH_URL}/?action=toggle_like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ media_id: item.id }),
      });
    } catch {
      setItems((prev) => prev.map((i) =>
        i.id === item.id
          ? { ...i, user_liked: item.user_liked, likes_count: item.likes_count }
          : i
      ));
    } finally {
      setLikingIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "#f5f0e8" }}>
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={onAuthSuccess}
        onSwitchMode={(m) => setAuthMode(m)}
      />

      {/* Граффити слева */}
      <div className="fixed left-0 top-0 h-full w-36 pointer-events-none select-none overflow-hidden z-0 hidden lg:block">
        {GRAFFITI_LEFT.map((g, i) => (
          <span key={i} className="absolute" style={{
            top: g.top, left: g.left,
            fontSize: g.size, color: g.color,
            opacity: g.opacity,
            transform: `rotate(${g.rotate})`,
            fontFamily: g.script ? "'Dancing Script', cursive" : "inherit",
            fontWeight: g.script ? 700 : 400,
            lineHeight: 1,
          }}>{g.text}</span>
        ))}
      </div>

      {/* Граффити справа */}
      <div className="fixed right-0 top-0 h-full w-36 pointer-events-none select-none overflow-hidden z-0 hidden lg:block">
        {GRAFFITI_RIGHT.map((g, i) => (
          <span key={i} className="absolute" style={{
            top: g.top, right: g.right,
            fontSize: g.size, color: g.color,
            opacity: g.opacity,
            transform: `rotate(${g.rotate})`,
            fontFamily: g.script ? "'Dancing Script', cursive" : "inherit",
            fontWeight: g.script ? 700 : 400,
            lineHeight: 1,
          }}>{g.text}</span>
        ))}
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-sm border-b" style={{ backgroundColor: "rgba(245,240,232,0.9)", borderColor: "#d4c9b0" }}>
        <Link to="/" className="font-cormorant text-2xl font-light" style={{ color: "#8b7355" }}>
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
                  {user.subscription && <div className="px-4 py-2 text-xs font-golos" style={{ color: "#8b7355" }}>✦ {user.subscription.tier.toUpperCase()}</div>}
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

      <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <p className="font-golos text-xs tracking-[0.4em] uppercase mb-2" style={{ color: "#a0916e" }}>Latest content</p>
          <h1 className="font-cormorant text-4xl font-light" style={{ color: "#5c4a32" }}>Feed</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#a0916e" } as React.CSSProperties} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-golos text-sm" style={{ color: "#a0916e" }}>No content yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                user={user}
                onSubscribe={() => { setAuthMode("register"); setAuthOpen(true); }}
                onClick={() => !item.locked && navigate(`/feed/${item.id}`)}
                onLike={() => toggleLike(item)}
                liking={likingIds.has(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ item, user, onSubscribe, onClick, onLike, liking }: {
  item: MediaItem;
  user: User | null;
  onSubscribe: () => void;
  onClick: () => void;
  onLike: () => void;
  liking: boolean;
}) {
  const isVideo = item.type === "video";
  const preview = item.thumbnail_url || item.url;

  return (
    <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ backgroundColor: "#fff8f0", borderColor: "#e8ddd0" }}>
      <div
        className={`relative w-full overflow-hidden ${!item.locked ? "cursor-pointer" : ""}`}
        style={{ aspectRatio: "4/5" }}
        onClick={!item.locked ? onClick : undefined}
      >
        {preview ? (
          <img
            src={preview}
            alt={item.title || ""}
            className={`w-full h-full object-cover transition-transform duration-500 ${!item.locked ? "hover:scale-105" : ""}`}
            style={item.locked ? { filter: "blur(12px) brightness(0.65)", transform: "scale(1.1)" } : {}}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#e8ddd0" }}>
            <Icon name={isVideo ? "Play" : "Image"} size={40} style={{ color: "#a0916e" } as React.CSSProperties} />
          </div>
        )}

        {isVideo && !item.locked && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-golos" style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff" }}>
            <Icon name="Play" size={10} /> Video
          </div>
        )}

        {item.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,240,232,0.9)" }}>
              <Icon name="Lock" size={20} style={{ color: "#8b7355" } as React.CSSProperties} />
            </div>
            <p className="font-golos text-xs uppercase tracking-widest text-white font-medium">
              {item.tier === "vip" ? "VIP only" : "Subscribers only"}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onSubscribe(); }}
              className="px-5 py-2 text-xs font-golos tracking-widest uppercase rounded-full"
              style={{ backgroundColor: "#8b7355", color: "#fff" }}
            >
              {user ? "Subscribe" : "Sign in"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          {item.title && (
            <p className="font-cormorant text-base font-medium mb-0.5" style={{ color: "#5c4a32" }}>{item.title}</p>
          )}
          <p className="font-golos text-xs" style={{ color: "#b8a882" }}>
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {item.tier !== "free" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase font-golos" style={{ backgroundColor: "#f0e8d8", color: "#8b7355" }}>
              {item.tier}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(); }}
            disabled={liking}
            className="flex items-center gap-1.5 transition-all disabled:opacity-50 group"
            style={{ color: item.user_liked ? "#e8a0b0" : "#b8a882" }}
          >
            <span className="text-xl leading-none transition-transform group-active:scale-125" style={{ display: "inline-block" }}>
              {item.user_liked ? "♥" : "♡"}
            </span>
            <span className="font-golos text-sm font-medium tabular-nums">
              {item.likes_count.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
