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
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border">
        <Link
          to="/blog"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
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
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Tag + date */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-primary/10 text-primary font-golos">
            {post.tag}
          </span>
          <span className="text-xs text-muted-foreground font-golos">{post.date}</span>
        </div>

        {/* Title */}
        <h1 className="font-cormorant text-4xl md:text-6xl font-light text-foreground leading-tight mb-6">
          {post.title}
        </h1>
        <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent mb-10" />

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden mb-12 aspect-[16/9]">
          <img src={post.img} alt={post.title} className="w-full h-full object-cover object-top" />
        </div>

        {/* Content or excerpt */}
        {post.content ? post.content : (
          <p className="font-golos text-foreground/70 text-lg leading-relaxed">{post.excerpt}</p>
        )}

        {/* Keywords */}
        {post.keywords && (
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.keywords.split(",").map((kw) => (
                <span key={kw} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-golos">
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
          <div className="h-px w-full bg-border mb-12" />
          <p className="font-golos text-xs tracking-[0.4em] uppercase text-muted-foreground mb-8">More stories</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherPosts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group block">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[10px] tracking-widest uppercase text-primary font-golos">{p.tag}</span>
                <p className="font-cormorant text-lg text-foreground leading-snug mt-1 group-hover:text-primary transition-colors">
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground font-golos mt-1">{p.date}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
