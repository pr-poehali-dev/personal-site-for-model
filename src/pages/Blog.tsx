import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const IMG_1 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2a3de33c-b05b-4601-920b-5a7396c0b13f.jpg";
const IMG_2 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/8c29e61e-79ab-4828-9cca-4d1338afb7a3.jpg";
const IMG_3 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2b5eac32-ce1c-404e-94cc-4a15436f038e.jpg";
const IMG_POST1 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/803768b9-9a5c-472a-9e6f-4deb2e53b935.jpg";

interface Post {
  id: number;
  img: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  rotate: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string;
  content?: React.ReactNode;
}

const posts: Post[] = [
  {
    id: 1,
    img: IMG_POST1,
    title: "Welcome to My Official Website",
    excerpt: "A place where I share my creative world, photography, and the visual stories behind every image.",
    date: "March 16, 2026",
    tag: "About",
    rotate: "-rotate-2",
    seoTitle: "Welcome to the Official Mia Rey Website – Model Gallery & Exclusive Content",
    seoDescription: "Discover the official Mia Rey website featuring artistic portrait photography, exclusive photos, and premium content. Explore the gallery and join for VIP access.",
    keywords: "mia rey, mia rey model, mia rey official website, mia rey photos, mia rey gallery, mia rey exclusive content, mia rey premium content, mia rey private photos, exclusive model gallery, artistic portrait photography",
    content: (
      <div className="font-golos text-foreground/80 leading-relaxed space-y-6 text-[15px]">
        <p>Hi, I'm Mia Rey.</p>
        <p>
          Welcome to my official website — a place where I share my creative world, my photography, and the visual stories behind every image. This website is more than just a gallery of photos. It's a space where artistic portrait photography, aesthetic style, and personal expression come together.
        </p>
        <p>
          Many of you may have discovered my work through social media, but this website is the central place where I can share my photography the way it was meant to be seen. Here you will find the Mia Rey gallery, exclusive content, and new photos that showcase my evolving style as a model and creative personality.
        </p>

        <h2 className="font-cormorant text-3xl text-foreground font-light mt-10 mb-2">My Work as a Model</h2>
        <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-6" />
        <p>
          As a Mia Rey model, I focus on creating visual content that feels authentic, cinematic, and artistic. I'm inspired by portrait photography, fashion imagery, and modern aesthetic visuals.
        </p>
        <p>
          Each photoshoot is an opportunity to experiment with mood, lighting, and atmosphere. Sometimes the result is a soft and intimate portrait, and other times it becomes a dramatic and cinematic image. That contrast is what makes photography so exciting to me.
        </p>
        <p>
          The Mia Rey photos you see on this site are carefully selected to represent my style and creative direction.
        </p>

        <h2 className="font-cormorant text-3xl text-foreground font-light mt-10 mb-2">Inside the Mia Rey Gallery</h2>
        <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-6" />
        <p>
          One of the main parts of this website is the Mia Rey gallery. This is where you can explore different collections of my work.
        </p>
        <p>The gallery includes:</p>
        <ul className="list-none space-y-2 pl-4 border-l border-primary/30">
          <li className="text-foreground/70">— portrait photography</li>
          <li className="text-foreground/70">— lifestyle imagery</li>
          <li className="text-foreground/70">— aesthetic visual projects</li>
          <li className="text-foreground/70">— artistic photography sessions</li>
        </ul>
        <p>
          Every collection represents a moment in my creative journey. Some images are soft and minimal, while others explore darker, more cinematic aesthetics.
        </p>
        <p>
          Photography is not just about capturing how someone looks — it's about capturing emotion, mood, and personality.
        </p>

        <h2 className="font-cormorant text-3xl text-foreground font-light mt-10 mb-2">Exclusive Content and Premium Collections</h2>
        <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-6" />
        <p>
          Beyond the public gallery, I also create Mia Rey exclusive content for those who want to see more of my work.
        </p>
        <p>
          Subscribers can access Mia Rey premium content, including private photos, extended photo sets, and exclusive collections that are not available publicly. These collections allow me to share more personal and creative work with my audience.
        </p>
        <p>
          My goal is to create content that feels artistic, authentic, and visually unique.
        </p>

        <h2 className="font-cormorant text-3xl text-foreground font-light mt-10 mb-2">Join My Creative Journey</h2>
        <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-6" />
        <p>
          This website is the official home of my work.
        </p>
        <p>
          If you enjoy aesthetic portrait photography and creative visual storytelling, I invite you to explore the gallery and discover the world of Mia Rey photos.
        </p>
        <p>
          You can also subscribe to gain access to exclusive content and private photo collections that are available only to members.
        </p>
        <p className="text-foreground/60 italic">
          Thank you for visiting my website and being part of this journey.
        </p>
        <p className="font-cormorant text-2xl text-gold-gradient">— Mia Rey</p>
      </div>
    ),
  },
  {
    id: 2,
    img: IMG_1,
    title: "Cinematic Light: My Favourite Shooting Techniques",
    excerpt: "How I use golden hour light and controlled shadows to create that signature moody aesthetic in every session.",
    date: "March 12, 2026",
    tag: "Photography",
    rotate: "rotate-1",
  },
  {
    id: 3,
    img: IMG_2,
    title: "Behind the Scenes: Studio Sessions",
    excerpt: "A peek into what actually happens during a studio day — from setup to final selection of the best shots.",
    date: "March 5, 2026",
    tag: "Behind the Scenes",
    rotate: "-rotate-1",
  },
  {
    id: 4,
    img: IMG_3,
    title: "Building an Aesthetic: Colour & Mood",
    excerpt: "The palette I return to again and again — deep burgundies, warm neutrals, and that ever-present touch of gold.",
    date: "February 28, 2026",
    tag: "Aesthetic",
    rotate: "rotate-2",
  },
  {
    id: 5,
    img: IMG_1,
    title: "Posing with Intention: Movement & Stillness",
    excerpt: "How mindful movement transforms a photograph from a snapshot into a visual story worth exploring.",
    date: "February 20, 2026",
    tag: "Posing",
    rotate: "-rotate-2",
  },
  {
    id: 6,
    img: IMG_2,
    title: "The Edit: Post-Production as Art",
    excerpt: "My post-production workflow and why I believe editing is just as creative as the shoot itself.",
    date: "February 10, 2026",
    tag: "Photography",
    rotate: "rotate-1",
  },
];

export default function Blog() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);
  const [openPost, setOpenPost] = useState<Post | null>(null);

  function openArticle(post: Post) {
    if (!post.content) return;
    setOpenPost(post);
    window.scrollTo({ top: 0 });
    if (post.seoTitle) document.title = post.seoTitle;
  }

  function closeArticle() {
    setOpenPost(null);
    document.title = "Mia Rey – Exclusive Model Gallery & Premium Content";
  }

  if (openPost) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* SEO meta (динамически через DOM) */}

        {/* Nav */}
        <nav className="sticky top-0 z-50 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-background/80 border-b border-border">
          <button
            onClick={closeArticle}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span className="font-golos text-xs tracking-widest uppercase">Back to Blog</span>
          </button>
          <span className="font-cormorant text-xl font-light tracking-[0.2em] text-gold-gradient">
            Mia Rey · Blog
          </span>
          <div className="w-28" />
        </nav>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-6 py-16">
          {/* Tag + date */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-primary/10 text-primary font-golos">
              {openPost.tag}
            </span>
            <span className="text-xs text-muted-foreground font-golos">{openPost.date}</span>
          </div>

          {/* Title */}
          <h1 className="font-cormorant text-4xl md:text-6xl font-light text-foreground leading-tight mb-6">
            {openPost.title}
          </h1>
          <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent mb-10" />

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden mb-12 aspect-[16/9]">
            <img src={openPost.img} alt={openPost.title} className="w-full h-full object-cover object-top" />
          </div>

          {/* Content */}
          {openPost.content}

          {/* Keywords (hidden SEO) */}
          {openPost.keywords && (
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {openPost.keywords.split(",").map((kw) => (
                  <span key={kw} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-golos">
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">
      {/* Background */}
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
            <article
              key={post.id}
              className={`group cursor-pointer transition-all duration-500 ${post.rotate} ${
                hovered === post.id ? "rotate-0 scale-105 z-20" : "hover:rotate-0 hover:scale-105 z-10"
              }`}
              style={{ position: "relative" }}
              onMouseEnter={() => setHovered(post.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => openArticle(post)}
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
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 opacity-60"
                style={{
                  background: "linear-gradient(135deg, rgba(255,220,180,0.8) 0%, rgba(255,200,150,0.6) 100%)",
                  transform: "translateX(-50%) rotate(-1deg)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
              <div className="absolute inset-x-0 -bottom-2 translate-y-full pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none px-1">
                <p className="font-golos text-xs text-muted-foreground leading-relaxed text-center line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </article>
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
