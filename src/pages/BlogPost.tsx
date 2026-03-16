import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { posts } from "@/lib/posts";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = posts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post) return;
    if (post.seoTitle) document.title = post.seoTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.seoDescription) metaDesc.setAttribute("content", post.seoDescription);
    return () => {
      document.title = "Mia Rey – Exclusive Model Gallery & Premium Content";
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-cormorant text-3xl text-foreground">Post not found</p>
        <button onClick={() => navigate("/blog")} className="text-primary text-sm font-golos hover:underline">
          ← Back to Blog
        </button>
      </div>
    );
  }

  const otherPosts = posts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#f5f0e8" }}>

      {/* Граффити по бокам */}
      <div className="fixed left-0 top-0 h-full w-40 pointer-events-none select-none overflow-hidden z-0" style={{ fontFamily: "'Dancing Script', cursive" }}>
        <span className="absolute text-4xl" style={{ top: "8%", left: "8px", color: "#e8a0b0", opacity: 0.5, transform: "rotate(-15deg)" }}>♥</span>
        <span className="absolute text-lg" style={{ top: "14%", left: "30px", color: "#c4a35a", opacity: 0.4, transform: "rotate(8deg)" }}>mia rey</span>
        <span className="absolute text-3xl" style={{ top: "22%", left: "5px", color: "#b0c4de", opacity: 0.35, transform: "rotate(-20deg)" }}>✦</span>
        <span className="absolute text-base" style={{ top: "30%", left: "20px", color: "#d4956a", opacity: 0.45, transform: "rotate(12deg)" }}>xoxo</span>
        <span className="absolute text-5xl" style={{ top: "38%", left: "0px", color: "#e8a0b0", opacity: 0.3, transform: "rotate(-8deg)" }}>♡</span>
        <span className="absolute text-sm" style={{ top: "47%", left: "35px", color: "#8b7355", opacity: 0.4, transform: "rotate(-18deg)" }}>✨ love</span>
        <span className="absolute text-2xl" style={{ top: "55%", left: "10px", color: "#c4a35a", opacity: 0.35, transform: "rotate(15deg)" }}>★</span>
        <span className="absolute text-base" style={{ top: "63%", left: "18px", color: "#e8a0b0", opacity: 0.45, transform: "rotate(-10deg)" }}>💋</span>
        <span className="absolute text-3xl" style={{ top: "70%", left: "5px", color: "#b0c4de", opacity: 0.3, transform: "rotate(22deg)" }}>♥</span>
        <span className="absolute text-sm" style={{ top: "78%", left: "28px", color: "#c4a35a", opacity: 0.4, transform: "rotate(-14deg)" }}>always</span>
        <span className="absolute text-4xl" style={{ top: "85%", left: "8px", color: "#e8a0b0", opacity: 0.35, transform: "rotate(6deg)" }}>✿</span>
        <span className="absolute text-base" style={{ top: "92%", left: "15px", color: "#d4956a", opacity: 0.4, transform: "rotate(-20deg)" }}>dreaming</span>
      </div>

      <div className="fixed right-0 top-0 h-full w-40 pointer-events-none select-none overflow-hidden z-0" style={{ fontFamily: "'Dancing Script', cursive" }}>
        <span className="absolute text-3xl" style={{ top: "6%", right: "12px", color: "#c4a35a", opacity: 0.4, transform: "rotate(18deg)" }}>✦</span>
        <span className="absolute text-base" style={{ top: "13%", right: "20px", color: "#e8a0b0", opacity: 0.45, transform: "rotate(-12deg)" }}>be mine</span>
        <span className="absolute text-5xl" style={{ top: "21%", right: "5px", color: "#e8a0b0", opacity: 0.3, transform: "rotate(10deg)" }}>♡</span>
        <span className="absolute text-sm" style={{ top: "29%", right: "25px", color: "#8b7355", opacity: 0.4, transform: "rotate(16deg)" }}>✨ magic</span>
        <span className="absolute text-2xl" style={{ top: "37%", right: "8px", color: "#d4956a", opacity: 0.35, transform: "rotate(-25deg)" }}>♥</span>
        <span className="absolute text-base" style={{ top: "45%", right: "18px", color: "#c4a35a", opacity: 0.45, transform: "rotate(8deg)" }}>gorgeous</span>
        <span className="absolute text-4xl" style={{ top: "53%", right: "3px", color: "#b0c4de", opacity: 0.3, transform: "rotate(-12deg)" }}>★</span>
        <span className="absolute text-base" style={{ top: "61%", right: "22px", color: "#e8a0b0", opacity: 0.4, transform: "rotate(20deg)" }}>💋</span>
        <span className="absolute text-3xl" style={{ top: "69%", right: "10px", color: "#c4a35a", opacity: 0.35, transform: "rotate(-8deg)" }}>✿</span>
        <span className="absolute text-sm" style={{ top: "77%", right: "28px", color: "#d4956a", opacity: 0.4, transform: "rotate(14deg)" }}>art & soul</span>
        <span className="absolute text-4xl" style={{ top: "84%", right: "6px", color: "#e8a0b0", opacity: 0.3, transform: "rotate(-18deg)" }}>♥</span>
        <span className="absolute text-sm" style={{ top: "91%", right: "15px", color: "#8b7355", opacity: 0.4, transform: "rotate(10deg)" }}>forever</span>
      </div>
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-5 flex items-center justify-between backdrop-blur-sm border-b" style={{ backgroundColor: "rgba(245,240,232,0.9)", borderColor: "#d4c9b0" }}>
        <Link
          to="/blog"
          className="flex items-center gap-2 transition-colors"
          style={{ color: "#8b7355" }}
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="font-golos text-xs tracking-widest uppercase">Back to Blog</span>
        </Link>
        <Link to="/" className="font-cormorant text-xl font-light tracking-[0.2em] text-gold-gradient">
          Mia Rey
        </Link>
        <div className="w-28" />
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-16" style={{ color: "#3a2e1e" }}>
        {/* Tag + date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full font-golos" style={{ backgroundColor: "#e8dcc8", color: "#8b6914" }}>
            {post.tag}
          </span>
          <span className="text-xs font-golos" style={{ color: "#9c8b6e" }}>{post.date}</span>
        </div>

        {/* Title */}
        <h1 className="font-cormorant text-4xl md:text-6xl font-light leading-tight mb-6" style={{ color: "#2a1f0e" }}>
          {post.title}
        </h1>
        <div className="h-px w-16 mb-10" style={{ background: "linear-gradient(to right, #c4a35a, transparent)" }} />

        {/* Hero image — Polaroid style */}
        <div className="mb-14 flex justify-center">
          <div
            className="relative bg-white shadow-2xl"
            style={{ padding: "14px 14px 56px 14px", maxWidth: "480px", width: "100%", transform: "rotate(-1.5deg)" }}
          >
            <div className="overflow-hidden" style={{ aspectRatio: "4/5" }}>
              <img src={post.img} alt={post.title} className="w-full h-full object-cover object-top" />
            </div>
            <p
              className="text-center mt-3 text-base"
              style={{ fontFamily: "'Dancing Script', cursive", color: "#555", letterSpacing: "0.02em" }}
            >
              {post.title}
            </p>
          </div>
        </div>

        {/* Content or excerpt */}
        {post.content ? post.content : (
          <p className="font-golos text-foreground/70 text-lg leading-relaxed">{post.excerpt}</p>
        )}

        {/* Keywords */}
        {post.keywords && (
          <div className="mt-16 pt-8" style={{ borderTop: "1px solid #d4c9b0" }}>
            <div className="flex flex-wrap gap-2">
              {post.keywords.split(",").map((kw) => (
                <span key={kw} className="text-xs px-3 py-1 rounded-full font-golos" style={{ backgroundColor: "#e8dcc8", color: "#8b7355" }}>
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid #d4c9b0" }}>
          <p className="font-golos text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#9c8b6e" }}>Share this post</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Instagram", icon: "📸", url: `https://www.instagram.com/` },
              { label: "Twitter / X", icon: "𝕏", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}` },
              { label: "Telegram", icon: "✈️", url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}` },
              { label: "TikTok", icon: "🎵", url: `https://www.tiktok.com/` },
            ].map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full font-golos text-sm transition-all hover:scale-105"
                style={{ backgroundColor: "#e8dcc8", color: "#5a3e1b", border: "1px solid #d4c9b0" }}
              >
                <span>{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Subscribe CTA */}
        <div
          className="mt-14 rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2a1f0e 0%, #4a2f1a 50%, #2a1f0e 100%)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #c4a35a 0%, transparent 60%), radial-gradient(circle at 70% 50%, #e8a0b0 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <p className="font-golos text-xs tracking-[0.4em] uppercase mb-3" style={{ color: "#c4a35a" }}>Exclusive Access</p>
            <h3 className="font-cormorant text-3xl md:text-4xl font-light mb-3" style={{ color: "#f5f0e8" }}>
              Want to see more?
            </h3>
            <p className="font-golos text-sm leading-relaxed mb-6 max-w-sm mx-auto" style={{ color: "rgba(245,240,232,0.65)" }}>
              Subscribe and get access to private photo collections, exclusive content and personal stories that I share only with my subscribers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="/#subscribe"
                className="px-8 py-3 rounded-none font-golos text-sm tracking-widest uppercase transition-all hover:opacity-90"
                style={{ backgroundColor: "#c4a35a", color: "#1a0f00" }}
              >
                Subscribe Now
              </a>
              <span className="font-golos text-xs" style={{ color: "rgba(245,240,232,0.4)" }}>
                From $9.99 / month
              </span>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              {[
                { icon: "📸", label: "Instagram", href: "https://www.instagram.com/" },
                { icon: "𝕏", label: "Twitter", href: "https://twitter.com/" },
                { icon: "✈️", label: "Telegram", href: "https://t.me/" },
                { icon: "🎵", label: "TikTok", href: "https://www.tiktok.com/" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="font-golos text-xs transition-colors hover:opacity-80"
                  style={{ color: "rgba(245,240,232,0.5)" }}
                >
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* More posts */}
      {otherPosts.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <div className="h-px w-full mb-12" style={{ backgroundColor: "#d4c9b0" }} />
          <p className="font-golos text-xs tracking-[0.4em] uppercase mb-8" style={{ color: "#9c8b6e" }}>More stories</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherPosts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[10px] tracking-widest uppercase font-golos" style={{ color: "#c4a35a" }}>{p.tag}</span>
                <p className="font-cormorant text-lg leading-snug mt-1 transition-colors" style={{ color: "#2a1f0e" }}>
                  {p.title}
                </p>
                <p className="text-xs font-golos mt-1" style={{ color: "#9c8b6e" }}>{p.date}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}