import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const IMG_1 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2a3de33c-b05b-4601-920b-5a7396c0b13f.jpg";
const IMG_2 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/8c29e61e-79ab-4828-9cca-4d1338afb7a3.jpg";
const IMG_3 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2b5eac32-ce1c-404e-94cc-4a15436f038e.jpg";

const posts = [
  {
    id: 1,
    img: IMG_1,
    title: "Cinematic Light: My Favourite Shooting Techniques",
    excerpt: "How I use golden hour light and controlled shadows to create that signature moody aesthetic in every session.",
    date: "March 12, 2026",
    tag: "Photography",
    rotate: "-rotate-2",
  },
  {
    id: 2,
    img: IMG_2,
    title: "Behind the Scenes: Studio Sessions",
    excerpt: "A peek into what actually happens during a studio day — from setup to final selection of the best shots.",
    date: "March 5, 2026",
    tag: "Behind the Scenes",
    rotate: "rotate-1",
  },
  {
    id: 3,
    img: IMG_3,
    title: "Building an Aesthetic: Colour & Mood",
    excerpt: "The palette I return to again and again — deep burgundies, warm neutrals, and that ever-present touch of gold.",
    date: "February 28, 2026",
    tag: "Aesthetic",
    rotate: "-rotate-1",
  },
  {
    id: 4,
    img: IMG_1,
    title: "Posing with Intention: Movement & Stillness",
    excerpt: "How mindful movement transforms a photograph from a snapshot into a visual story worth exploring.",
    date: "February 20, 2026",
    tag: "Posing",
    rotate: "rotate-2",
  },
  {
    id: 5,
    img: IMG_2,
    title: "The Edit: Post-Production as Art",
    excerpt: "My post-production workflow and why I believe editing is just as creative as the shoot itself.",
    date: "February 10, 2026",
    tag: "Photography",
    rotate: "-rotate-2",
  },
  {
    id: 6,
    img: IMG_3,
    title: "Wardrobe Stories: Styling for the Lens",
    excerpt: "Choosing pieces that speak to the camera — textures, silhouettes, and the power of a single well-chosen detail.",
    date: "January 30, 2026",
    tag: "Style",
    rotate: "rotate-1",
  },
];

export default function Blog() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative">

      {/* ── STRAWBERRY BACKGROUND ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ctext x='10' y='50' font-size='36' opacity='0.07'%3E🍓%3C/text%3E%3Ctext x='50' y='20' font-size='28' opacity='0.05'%3E🍓%3C/text%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
          backgroundColor: "hsl(var(--background))",
        }}
      />
      {/* Soft red vignette */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(350 40% 8% / 0.6) 100%)",
        }}
      />

      {/* ── NAV ── */}
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

      {/* ── HEADER ── */}
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

      {/* ── POLAROID GRID ── */}
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
            >
              {/* Polaroid frame */}
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
                {/* Photo */}
                <div className="overflow-hidden aspect-[3/4] w-full">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Polaroid text area */}
                <div className="pt-4 pb-1 px-1 text-center" style={{ fontFamily: "'Golos Text', sans-serif" }}>
                  <span
                    className="inline-block text-[10px] tracking-[0.2em] uppercase mb-2 px-2 py-0.5 rounded-full"
                    style={{
                      color: "hsl(350, 60%, 45%)",
                      backgroundColor: "hsl(350, 60%, 95%)",
                    }}
                  >
                    {post.tag}
                  </span>
                  <p
                    className="text-sm font-semibold leading-snug line-clamp-2"
                    style={{ color: "#1a1a1a" }}
                  >
                    {post.title}
                  </p>
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "#999" }}
                  >
                    {post.date}
                  </p>
                </div>
              </div>

              {/* Tape effect */}
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 opacity-60"
                style={{
                  background: "linear-gradient(135deg, rgba(255,220,180,0.8) 0%, rgba(255,200,150,0.6) 100%)",
                  transform: "translateX(-50%) rotate(-1deg)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />

              {/* Hover: excerpt tooltip */}
              <div
                className="absolute inset-x-0 -bottom-2 translate-y-full pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none px-1"
              >
                <p className="font-golos text-xs text-muted-foreground leading-relaxed text-center line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Coming soon */}
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
