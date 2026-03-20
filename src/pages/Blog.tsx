import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/0f69b8f2-267a-4d9e-b597-2ba21b26ce35";

interface BlogPostItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  img_url: string | null;
  tag: string;
  created_at: string;
}

const ROTATES = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-1"];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Blog() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${AUTH_URL}/?action=get_blog_posts`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = "Mia Rey Blog – Portrait Photography, Photoshoots & Exclusive Content";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Read the Mia Rey blog about portrait photography, aesthetic photoshoots, creative inspiration and exclusive content. Discover new ideas and visual stories.");
    let metaKeys = document.querySelector('meta[name="keywords"]');
    if (!metaKeys) { metaKeys = document.createElement("meta"); metaKeys.setAttribute("name", "keywords"); document.head.appendChild(metaKeys); }
    metaKeys.setAttribute("content", "mia rey, blog, portrait photography, aesthetic photos");
    return () => {
      document.title = "Mia Rey – Exclusive Model Gallery & Premium Content";
      const d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute("content", "Discover the official Mia Rey website featuring exclusive model photos, artistic portrait photography, private galleries and premium content. Explore the gallery and subscribe for VIP access.");
      const k = document.querySelector('meta[name="keywords"]');
      if (k) k.setAttribute("content", "");
    };
  }, []);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative" style={{ backgroundColor: "#f5f0e8" }}>

      {/* Nav */}
      <nav className="relative z-50 px-6 py-5 flex items-center justify-between backdrop-blur-sm border-b sticky top-0" style={{ backgroundColor: "rgba(245,240,232,0.9)", borderColor: "#d4c9b0" }}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="font-golos text-xs tracking-widest uppercase">Back</span>
        </button>
        <span className="font-cormorant text-2xl font-light tracking-[0.2em] text-gold-gradient">
          Mia Rey · Blog
        </span>
        <div className="w-20" />
      </nav>

      {/* Header */}
      <div className="relative z-10 text-center py-20 px-6">
        <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-4">
          Journal & Stories
        </p>
        <h1 className="font-cormorant text-5xl md:text-7xl font-light tracking-wide text-gold-gradient mb-4">
          Mia Rey Blog – Photography & Creative Inspiration
        </h1>
        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="font-golos text-muted-foreground text-sm mt-6 max-w-lg mx-auto leading-relaxed">
          Welcome to the Mia Rey blog, where I share insights about portrait photography, aesthetic photoshoots and creative inspiration. Explore articles, ideas and exclusive content.
        </p>
      </div>

      {/* Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <Icon name="Loader" size={28} className="animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-golos text-muted-foreground text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {posts.map((post, idx) => {
              const rotate = ROTATES[idx % ROTATES.length];
              return (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className={`group cursor-pointer transition-all duration-500 ${rotate} ${
                    hovered === post.id ? "rotate-0 scale-105 z-20" : "hover:rotate-0 hover:scale-105 z-10"
                  }`}
                  style={{ position: "relative", display: "block" }}
                  onMouseEnter={() => setHovered(post.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="bg-white shadow-2xl"
                    style={{
                      padding: "12px 12px 48px 12px",
                      boxShadow: hovered === post.id
                        ? "0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)"
                        : "0 15px 40px rgba(0,0,0,0.4)",
                      transition: "box-shadow 0.4s ease",
                    }}
                  >
                    <div className="overflow-hidden aspect-[3/4] w-full bg-muted">
                      {post.img_url ? (
                        <img
                          src={post.img_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#e8ddd0" }}>
                          <Icon name="Image" size={32} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="pt-4 pb-1 px-1 text-center" style={{ fontFamily: "'Golos Text', sans-serif" }}>
                      <span
                        className="inline-block text-[10px] tracking-[0.2em] uppercase mb-2 px-2 py-0.5 rounded-full"
                        style={{ color: "hsl(350, 60%, 45%)", backgroundColor: "hsl(350, 60%, 95%)" }}
                      >
                        {post.tag}
                      </span>
                      <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "#1a1a1a" }}>
                        {post.title}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: "#999" }}>{formatDate(post.created_at)}</p>
                      <p className="text-[10px] mt-1 tracking-wider" style={{ color: "hsl(350, 60%, 45%)" }}>READ →</p>
                    </div>
                  </div>

                  {/* Tape */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 opacity-60"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,220,180,0.8) 0%, rgba(255,200,150,0.6) 100%)",
                      transform: "translateX(-50%) rotate(-1deg)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />

                  {/* Excerpt on hover */}
                  <div className="absolute inset-x-0 -bottom-2 translate-y-full pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none px-1">
                    <p className="font-golos text-xs text-muted-foreground leading-relaxed text-center line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-32">
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-8" />
          <p className="font-golos text-xs tracking-[0.4em] uppercase text-muted-foreground/50">
            More stories coming soon
          </p>
        </div>
      </div>
    </div>
  );
}