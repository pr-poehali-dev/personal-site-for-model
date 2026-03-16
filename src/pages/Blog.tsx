import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { posts } from "@/lib/posts";

export default function Blog() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ctext x='10' y='50' font-size='36' opacity='0.07'%3E🍓%3C/text%3E%3Ctext x='50' y='20' font-size='28' opacity='0.05'%3E🍓%3C/text%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
          backgroundColor: "hsl(var(--background))",
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(350 40% 8% / 0.6) 100%)" }}
      />

      {/* Nav */}
      <nav className="relative z-50 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-background/70 border-b border-border sticky top-0">
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
        <h1 className="font-cormorant text-6xl md:text-8xl font-light tracking-wide text-gold-gradient mb-4">
          Blog
        </h1>
        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="font-golos text-muted-foreground text-sm mt-6 max-w-md mx-auto leading-relaxed">
          Behind the lens — thoughts on photography, aesthetics, and creative life.
        </p>
      </div>

      {/* Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className={`group cursor-pointer transition-all duration-500 ${post.rotate} ${
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
                <div className="overflow-hidden aspect-[3/4] w-full">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
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
                  <p className="text-[11px] mt-1" style={{ color: "#999" }}>{post.date}</p>
                  {post.content && (
                    <p className="text-[10px] mt-1 tracking-wider" style={{ color: "hsl(350, 60%, 45%)" }}>READ →</p>
                  )}
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
          ))}
        </div>

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
