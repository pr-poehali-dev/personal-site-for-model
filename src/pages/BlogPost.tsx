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
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
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