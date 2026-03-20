import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import AuthModal from "@/components/AuthModal";
import { getToken, getMe, clearToken, User } from "@/lib/auth";

const AUTH_URL = "https://functions.poehali.dev/0f69b8f2-267a-4d9e-b597-2ba21b26ce35";
const PROFILE_IMG = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/045f7fee-76e7-46a2-b619-34043d12fc5e.jpg";

interface MediaItem {
  id: number;
  title: string | null;
  description: string | null;
  type: string;
  subtype: string;
  url: string | null;
  thumbnail_url: string | null;
  tier: string;
  locked: boolean;
  created_at: string;
  likes_count: number;
  user_liked: boolean;
  comments_count: number;
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

  useEffect(() => {
    document.title = "Mia Rey Feed – Latest Photos, Private Content & Exclusive Updates";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Explore the Mia Rey feed with latest photos, reels, exclusive updates and premium content. Discover new posts and private collections.");
    let metaKeys = document.querySelector('meta[name="keywords"]');
    if (!metaKeys) { metaKeys = document.createElement("meta"); metaKeys.setAttribute("name", "keywords"); document.head.appendChild(metaKeys); }
    metaKeys.setAttribute("content", "mia rey, feed, exclusive photos, premium content, updates");
    return () => {
      document.title = "Mia Rey – Exclusive Model Gallery & Premium Content";
      const d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute("content", "Discover the official Mia Rey website featuring exclusive model photos, artistic portrait photography, private galleries and premium content. Explore the gallery and subscribe for VIP access.");
      const k = document.querySelector('meta[name="keywords"]');
      if (k) k.setAttribute("content", "");
    };
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
  const [tab, setTab] = useState<"posts" | "reels">("posts");

  useEffect(() => {
    const token = getToken();
    if (token) getMe(token).then(setUser).catch(() => clearToken());
  }, []);

  useEffect(() => {
    const token = getToken();
    fetchMedia(token).then(setItems).finally(() => setLoading(false));
  }, [user]);

  const logout = () => { clearToken(); setUser(null); setUserMenuOpen(false); };
  const onAuthSuccess = (u: User) => { setUser(u); setAuthOpen(false); };

  const toggleLike = async (item: MediaItem) => {
    const token = getToken();
    if (!token || !user) { setAuthMode("login"); setAuthOpen(true); return; }
    if (likingIds.has(item.id)) return;
    setLikingIds((prev) => new Set(prev).add(item.id));
    setItems((prev) => prev.map((i) =>
      i.id === item.id ? { ...i, user_liked: !i.user_liked, likes_count: i.user_liked ? i.likes_count - 1 : i.likes_count + 1 } : i
    ));
    try {
      await fetch(`${AUTH_URL}/?action=toggle_like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ media_id: item.id }),
      });
    } catch {
      setItems((prev) => prev.map((i) =>
        i.id === item.id ? { ...i, user_liked: item.user_liked, likes_count: item.likes_count } : i
      ));
    } finally {
      setLikingIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

  const totalLikes = items.reduce((sum, i) => sum + i.likes_count, 0);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "#f5f0e8" }}>
      <AuthModal open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onSuccess={onAuthSuccess} onSwitchMode={(m) => setAuthMode(m)} />

      {/* Граффити слева */}
      <div className="fixed left-0 top-0 h-full w-36 pointer-events-none select-none overflow-hidden z-0 hidden lg:block">
        {GRAFFITI_LEFT.map((g, i) => (
          <span key={i} className="absolute" style={{ top: g.top, left: g.left, fontSize: g.size, color: g.color, opacity: g.opacity, transform: `rotate(${g.rotate})`, fontFamily: g.script ? "'Dancing Script', cursive" : "inherit", fontWeight: g.script ? 700 : 400, lineHeight: 1 }}>{g.text}</span>
        ))}
      </div>

      {/* Граффити справа */}
      <div className="fixed right-0 top-0 h-full w-36 pointer-events-none select-none overflow-hidden z-0 hidden lg:block">
        {GRAFFITI_RIGHT.map((g, i) => (
          <span key={i} className="absolute" style={{ top: g.top, right: g.right, fontSize: g.size, color: g.color, opacity: g.opacity, transform: `rotate(${g.rotate})`, fontFamily: g.script ? "'Dancing Script', cursive" : "inherit", fontWeight: g.script ? 700 : 400, lineHeight: 1 }}>{g.text}</span>
        ))}
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-sm border-b" style={{ backgroundColor: "rgba(245,240,232,0.9)", borderColor: "#d4c9b0" }}>
        <Link to="/" className="font-cormorant text-2xl font-light" style={{ color: "#8b7355" }}>Mia Rey</Link>
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
            <button onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="text-sm font-golos px-4 py-1.5 border rounded-full" style={{ color: "#8b7355", borderColor: "#d4c9b0" }}>Sign in</button>
          )}
        </div>
      </nav>

      {/* ── SEO BLOCK ── */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-1 relative z-10">
        <h1 className="font-cormorant text-2xl font-light mb-1" style={{ color: "#5c4a32" }}>
          Mia Rey Feed – Latest Photos & Updates
        </h1>
        <p className="font-golos text-xs leading-relaxed" style={{ color: "#a0916e" }}>
          Explore the Mia Rey feed with latest photos, exclusive content and new updates. Discover recent posts, reels and premium content.
        </p>
      </div>

      <div className="max-w-lg mx-auto px-0 pb-8 relative z-10">

        {/* ── PROFILE HEADER ── */}
        <div className="px-4 pt-6 pb-4">
          {/* Avatar + stats */}
          <div className="flex items-center gap-6 mb-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-0.5" style={{ background: "linear-gradient(135deg, #e8a0b0, #c4a35a, #d4956a)" }}>
                <img src={PROFILE_IMG} alt="Mia Rey" className="w-full h-full rounded-full object-cover object-top" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="font-cormorant text-xl font-semibold" style={{ color: "#5c4a32" }}>{items.length}</p>
                <p className="font-golos text-xs" style={{ color: "#a0916e" }}>posts</p>
              </div>
              <div className="text-center">
                <p className="font-cormorant text-xl font-semibold" style={{ color: "#5c4a32" }}>{totalLikes.toLocaleString()}</p>
                <p className="font-golos text-xs" style={{ color: "#a0916e" }}>likes</p>
              </div>
              <div className="text-center">
                <p className="font-cormorant text-xl font-semibold" style={{ color: "#5c4a32" }}>18+</p>
                <p className="font-golos text-xs" style={{ color: "#a0916e" }}>content</p>
              </div>
            </div>
          </div>

          {/* Name + bio */}
          <p className="font-cormorant text-lg font-semibold mb-0.5" style={{ color: "#5c4a32" }}>Mia Rey ✦</p>
          <p className="font-golos text-xs leading-relaxed mb-4" style={{ color: "#8b7355" }}>
            Content creator · Exclusive 18+ photos & videos<br />
            Subscribe for full access 🔒
          </p>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4 mb-4 pt-1">
            {[
              { label: "Instagram", icon: "📸", url: "https://www.instagram.com/miareymodel?igsh=MWttMHFmaDk5bng2Nw%3D%3D&utm_source=qr" },
              { label: "TikTok", icon: "🎵", url: "https://www.tiktok.com/@miareymodel?_r=1&_t=ZS-94qR22e8d65" },
              { label: "Twitter", icon: "🐦", url: "https://x.com/miareymodel?s=21" },
              { label: "Telegram", icon: "✈️", url: "https://t.me/+TvbSv9JOrm43NjZh" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
              >
                <span className="text-lg">{s.icon}</span>
                <span className="font-golos text-[10px] uppercase tracking-widest" style={{ color: "#a0916e" }}>{s.label}</span>
              </a>
            ))}
          </div>

          {/* Subscribe banners */}
          <div className="flex gap-2">
            <a
              href="https://www.fanvue.com/miarey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-golos tracking-wider uppercase font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#8b7355", color: "#fff" }}
            >
              <span>🌸</span> Fanvue · $3.99
            </a>
            <a
              href="https://boosty.to/miarey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-golos tracking-wider uppercase font-medium border transition-all hover:bg-primary/10"
              style={{ borderColor: "#d4c9b0", color: "#8b7355" }}
            >
              <span>🎀</span> Boosty
            </a>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-t" style={{ borderColor: "#d4c9b0" }}>
          <button
            onClick={() => setTab("posts")}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-golos uppercase tracking-widest transition-colors"
            style={{ color: tab === "posts" ? "#5c4a32" : "#a0916e", borderBottom: tab === "posts" ? "2px solid #8b7355" : "2px solid transparent" }}
          >
            <Icon name="Grid3x3" size={14} />
            Posts
          </button>
          <button
            onClick={() => setTab("reels")}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-golos uppercase tracking-widest transition-colors"
            style={{ color: tab === "reels" ? "#5c4a32" : "#a0916e", borderBottom: tab === "reels" ? "2px solid #8b7355" : "2px solid transparent" }}
          >
            <Icon name="Film" size={14} />
            Reels
          </button>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader" size={24} className="animate-spin" style={{ color: "#a0916e" } as React.CSSProperties} />
          </div>
        ) : tab === "posts" ? (
          (() => {
            const postItems = items.filter((i) => i.subtype !== "reel");
            return postItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-golos text-sm" style={{ color: "#a0916e" }}>No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {postItems.map((item) => {
                  const isVideo = item.type === "video";
                  const preview = item.thumbnail_url || (!isVideo ? item.url : null);
                  return (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer overflow-hidden"
                      style={{ aspectRatio: "1/1" }}
                      onClick={() => navigate(`/feed/${item.id}`)}
                    >
                      {item.locked ? (
                        <>
                          {preview && <img src={preview} alt="" className="w-full h-full object-cover" style={{ filter: "blur(8px) brightness(0.6)", transform: "scale(1.1)" }} />}
                          {!preview && isVideo && item.url && <video src={item.url} className="w-full h-full object-cover" style={{ filter: "blur(8px) brightness(0.6)", transform: "scale(1.1)" }} muted playsInline preload="metadata" />}
                        </>
                      ) : isVideo && item.url ? (
                        <video src={item.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" muted playsInline preload="metadata" />
                      ) : preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#e8ddd0" }}>
                          <Icon name={isVideo ? "Play" : "Image"} size={24} style={{ color: "#a0916e" } as React.CSSProperties} />
                        </div>
                      )}
                      {item.locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,240,232,0.85)" }}>
                            <Icon name="Lock" size={14} style={{ color: "#8b7355" } as React.CSSProperties} />
                          </div>
                        </div>
                      )}
                      {isVideo && !item.locked && (
                        <div className="absolute top-1.5 right-1.5">
                          <Icon name="Play" size={14} style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" } as React.CSSProperties} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: "rgba(92,74,50,0.45)" }}>
                        <span className="flex items-center gap-1 text-white font-golos text-sm font-medium">
                          <span className="text-base">{item.user_liked ? "♥" : "♡"}</span>
                          {item.likes_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-white font-golos text-sm font-medium">
                          <span className="text-base">💬</span>
                          {item.comments_count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          (() => {
            const reelItems = items.filter((i) => i.subtype === "reel");
            return reelItems.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="Film" size={32} className="mx-auto mb-3" style={{ color: "#d4c9b0" } as React.CSSProperties} />
                <p className="font-golos text-sm" style={{ color: "#a0916e" }}>No reels yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                {reelItems.map((item) => {
                  const isVideoType = item.type === "video";
                  const preview = item.thumbnail_url || (!isVideoType ? item.url : null);
                  return (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer overflow-hidden"
                      style={{ aspectRatio: "9/16" }}
                      onClick={() => navigate(`/feed/${item.id}`)}
                    >
                      {item.locked ? (
                        <>
                          {preview && <img src={preview} alt="" className="w-full h-full object-cover" style={{ filter: "blur(8px) brightness(0.6)", transform: "scale(1.1)" }} />}
                          {!preview && isVideoType && item.url && <video src={item.url} className="w-full h-full object-cover" style={{ filter: "blur(8px) brightness(0.6)", transform: "scale(1.1)" }} muted playsInline preload="metadata" />}
                        </>
                      ) : isVideoType && item.url ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#e8ddd0" }}>
                          <Icon name="Play" size={32} style={{ color: "#a0916e" } as React.CSSProperties} />
                        </div>
                      )}
                      {item.locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(245,240,232,0.85)" }}>
                            <Icon name="Lock" size={16} style={{ color: "#8b7355" } as React.CSSProperties} />
                          </div>
                        </div>
                      )}
                      {!item.locked && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1">
                          <Icon name="Play" size={12} style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" } as React.CSSProperties} />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white font-golos text-xs font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                        <span>{item.user_liked ? "♥" : "♡"}</span>
                        <span>{item.likes_count.toLocaleString()}</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ backgroundColor: "rgba(92,74,50,0.35)" }} />
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}