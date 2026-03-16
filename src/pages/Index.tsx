import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import AuthModal from "@/components/AuthModal";
import { getToken, getMe, clearToken, hasTier, User } from "@/lib/auth";

const IMG_HERO = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2a3de33c-b05b-4601-920b-5a7396c0b13f.jpg";
const IMG_ABOUT = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/8c29e61e-79ab-4828-9cca-4d1338afb7a3.jpg";
const IMG_TEXTURE = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2b5eac32-ce1c-404e-94cc-4a15436f038e.jpg";

const feedItems = [
  { id: 1, img: IMG_HERO, likes: 1284, locked: false, tag: "Art" },
  { id: 2, img: IMG_TEXTURE, likes: 2091, locked: false, tag: "Photo" },
  { id: 3, img: IMG_ABOUT, likes: 3540, locked: true, tag: "18+" },
  { id: 4, img: IMG_HERO, likes: 892, locked: true, tag: "Private" },
  { id: 5, img: IMG_TEXTURE, likes: 1750, locked: false, tag: "Art" },
  { id: 6, img: IMG_ABOUT, likes: 4120, locked: true, tag: "18+" },
  { id: 7, img: IMG_HERO, likes: 660, locked: false, tag: "Photo" },
  { id: 8, img: IMG_TEXTURE, likes: 3300, locked: true, tag: "Private" },
  { id: 9, img: IMG_ABOUT, likes: 2870, locked: false, tag: "Art" },
];

const tiers = [
  {
    name: "Photo Access",
    price: "$9",
    priceYear: "$90",
    savingYear: "Save 17%",
    accent: "hsl(var(--muted-foreground))",
    badge: null,
    promo: null,
    features: [
      "Uncensored 18+ photo sets",
      "Weekly exclusive photos",
      "Access to all public content",
      "Basic personal shots",
    ],
    featured: false,
    cta: "Get Photos",
  },
  {
    name: "Full Access",
    price: "$22",
    priceYear: "$220",
    savingYear: "Save 17%",
    accent: "hsl(var(--primary))",
    badge: "MOST POPULAR",
    promo: "🔥 First month — $15",
    features: [
      "Everything in Photo Access",
      "Full video content library",
      "Daily photo + video updates",
      "Priority DMs on Telegram & Instagram",
      "Exclusive private videos & sets",
      "Custom content on request",
    ],
    vipNote: "Want to connect personally? VIP members get priority replies on Telegram & Instagram — faster & closer 😈",
    featured: true,
    cta: "Get Full Access",
  },
];

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const ringPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      ringPosRef.current = {
        x: lerp(ringPosRef.current.x, mousePos.x, 0.1),
        y: lerp(ringPosRef.current.y, mousePos.y, 0.1),
      };
      setRingPos({ ...ringPosRef.current });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [mousePos]);

  useEffect(() => {
    const els = document.querySelectorAll(".scroll-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sections = ["home", "feed", "about", "subscribe", "gallery", "contact"];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3 }
    );
    sections.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Load user from saved token on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe(token).then(setUser).catch(() => clearToken());
  }, []);

  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setUserMenuOpen(false);
  };

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const toggleLike = (id: number) =>
    setLikedPosts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "feed", label: "Feed" },
    { id: "about", label: "About" },
    { id: "subscribe", label: "Subscribe" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Custom cursor */}
      <div className="cursor-dot" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="cursor-ring" style={{ left: ringPos.x, top: ringPos.y }} />

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background/70 border-b border-border">
        <div className="font-cormorant text-2xl font-light tracking-[0.3em] text-gold-gradient">LUNA</div>
        <ul className="hidden md:flex gap-8">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => scrollTo(l.id)}
                className={`nav-link text-sm tracking-widest uppercase font-golos transition-colors duration-200 ${
                  activeSection === l.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        {/* Auth controls */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 text-xs font-golos tracking-wider text-foreground/70 hover:text-foreground transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Icon name="User" size={13} className="text-primary" />
              </div>
              <span className="hidden md:block">{user.name || user.email.split("@")[0]}</span>
              <Icon name="ChevronDown" size={13} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-golos text-foreground/80 truncate">{user.email}</p>
                  {user.subscription ? (
                    <span className="text-[10px] text-primary font-golos uppercase tracking-wider">
                      {user.subscription.tier === "vip" ? "Full Access" : "Photo Access"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-golos">No active subscription</span>
                  )}
                </div>
                {!user.subscription && (
                  <button
                    onClick={() => { setUserMenuOpen(false); scrollTo("subscribe"); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-golos text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <Icon name="Star" size={13} />
                    Get subscription
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs font-golos text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <Icon name="LogOut" size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth("login")}
              className="text-xs tracking-wider font-golos text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth("register")}
              className="text-xs tracking-[0.2em] uppercase px-5 py-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-golos"
            >
              Subscribe
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${IMG_HERO})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(1.1) translateY(${mousePos.y * 0.015}px)`,
            transition: "transform 0.1s linear",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-float delay-300" />

        <div className="relative z-10 text-center px-6">
          <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Welcome to my world
          </p>
          <h1 className="font-cormorant text-7xl md:text-9xl font-light tracking-wide mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <span className="text-gold-gradient">LUNA</span>
          </h1>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }} />
          <p className="font-cormorant italic text-xl md:text-2xl text-foreground/70 mb-10 font-light opacity-0 animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            Art. Beauty. Desire.
          </p>
          <div className="flex gap-4 justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
            <button onClick={() => scrollTo("feed")} className="px-8 py-3 bg-primary text-primary-foreground text-sm tracking-widest uppercase font-golos hover:bg-primary/90 transition-all duration-300 animate-glow-pulse">
              View Feed
            </button>
            <button onClick={() => scrollTo("subscribe")} className="px-8 py-3 border border-foreground/20 text-foreground/70 text-sm tracking-widest uppercase font-golos hover:border-primary hover:text-primary transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs tracking-widest uppercase font-golos">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/30 to-transparent" />
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="overflow-hidden py-3 border-y border-border bg-muted/30">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="font-cormorant italic text-sm text-muted-foreground/60 mx-8 tracking-widest">
              ✦ Exclusive content &nbsp; ✦ Personal photos &nbsp; ✦ VIP subscription &nbsp; ✦ Private videos &nbsp; ✦ Daily updates &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── FEED ── */}
      <section id="feed" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3">Latest</p>
          <h2 className="font-cormorant text-5xl md:text-6xl font-light text-gold-gradient">Feed</h2>
          <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-4" />
        </div>

        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {feedItems.map((item, i) => (
            <div key={item.id} className="break-inside-avoid relative group card-lift rounded-lg overflow-hidden scroll-reveal" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="relative">
                <img
                  src={item.img}
                  alt=""
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${item.locked && !hasTier(user, "photo") ? "content-locked" : ""}`}
                  style={{ aspectRatio: i % 3 === 0 ? "3/4" : "4/5" }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] px-2 py-1 bg-background/80 backdrop-blur-sm text-muted-foreground tracking-widest uppercase font-golos rounded">
                    {item.tag}
                  </span>
                </div>
                {item.locked && !hasTier(user, "photo") && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center mb-2 bg-background/60">
                      <Icon name="Lock" size={16} className="text-primary" />
                    </div>
                    {user ? (
                      <button onClick={() => scrollTo("subscribe")} className="text-xs font-golos text-primary tracking-wider hover:text-primary/80 transition-colors">
                        Subscribe to unlock
                      </button>
                    ) : (
                      <button onClick={() => openAuth("register")} className="text-xs font-golos text-primary tracking-wider hover:text-primary/80 transition-colors">
                        Sign in to unlock
                      </button>
                    )}
                  </div>
                )}
                {!item.locked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button onClick={() => toggleLike(item.id)} className="flex items-center gap-1.5 text-xs font-golos text-foreground/80">
                      <Icon name="Heart" size={14} className={likedPosts.includes(item.id) ? "text-accent fill-accent" : "text-foreground/60"} />
                      <span>{item.likes + (likedPosts.includes(item.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="relative">
              <img src={IMG_ABOUT} alt="About" className="w-full rounded-lg object-cover" style={{ aspectRatio: "3/4" }} />
              <div className="absolute inset-0 rounded-lg border border-primary/20" />
              <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/10 rounded-lg" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-background/90 backdrop-blur-md border border-border rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-cormorant text-2xl text-gold-gradient">12K+</p>
                    <p className="text-[10px] font-golos text-muted-foreground uppercase tracking-wider">Followers</p>
                  </div>
                  <div className="border-x border-border">
                    <p className="font-cormorant text-2xl text-gold-gradient">340+</p>
                    <p className="text-[10px] font-golos text-muted-foreground uppercase tracking-wider">Photos</p>
                  </div>
                  <div>
                    <p className="font-cormorant text-2xl text-gold-gradient">4 yrs</p>
                    <p className="text-[10px] font-golos text-muted-foreground uppercase tracking-wider">Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="scroll-reveal delay-200">
            <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-4">About me</p>
            <h2 className="font-cormorant text-5xl md:text-6xl font-light mb-6">
              Hi, I'm <span className="text-gold-gradient">Luna</span>
            </h2>
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-8" />
            <p className="font-golos text-foreground/70 leading-relaxed mb-6 text-sm">
              I'm an artist of my body and my image. Every shot is a story, every frame — a work of art. I believe in beauty without compromise and freedom of self-expression.
            </p>
            <p className="font-golos text-foreground/50 leading-relaxed mb-10 text-sm">
              Here I share exclusive content you won't find anywhere else. Subscribe and become part of my world.
            </p>
            <div className="flex gap-6">
              {["Instagram", "Telegram", "OnlyFans"].map((s) => (
                <button key={s} className="text-xs font-golos tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200 nav-link pb-1">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIBE ── */}
      <section id="subscribe" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${IMG_TEXTURE})`, backgroundSize: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-6 scroll-reveal">
            <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3">Content access</p>
            <h2 className="font-cormorant text-5xl md:text-6xl font-light text-gold-gradient">Subscribe</h2>
            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-4 mb-5" />
            <p className="font-golos text-sm text-foreground/70 max-w-lg mx-auto leading-relaxed">
              Choose your level: photos for <span className="text-primary font-medium">$9</span> or full access with personal Telegram & Instagram DMs for <span className="text-primary font-medium">$22</span> 🔥
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-12 scroll-reveal">
            <button
              onClick={() => setBilling("monthly")}
              className={`text-sm font-golos tracking-wider transition-colors duration-200 ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              className="relative w-12 h-6 rounded-full border border-primary/40 bg-muted/50 transition-colors duration-200"
              style={{ background: billing === "yearly" ? "hsl(var(--primary) / 0.2)" : undefined }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-primary transition-all duration-300"
                style={{ left: billing === "yearly" ? "calc(100% - 1.375rem)" : "0.125rem" }}
              />
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`text-sm font-golos tracking-wider transition-colors duration-200 ${billing === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly
              <span className="ml-2 text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full tracking-wider">Save 17%</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`tier-card scroll-reveal rounded-xl p-8 border-gold-glow bg-card relative ${tier.featured ? "tier-featured border-primary/40 md:scale-105" : ""}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-golos px-5 py-1.5 bg-primary text-primary-foreground rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3 className="font-cormorant text-3xl font-light mb-1 mt-2" style={{ color: tier.accent }}>{tier.name}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-cormorant text-5xl text-foreground">
                    {billing === "yearly" ? tier.priceYear : tier.price}
                  </span>
                  <span className="text-xs font-golos text-muted-foreground">
                    {billing === "yearly" ? "/yr" : "/mo"}
                  </span>
                </div>

                {/* Promo */}
                {tier.promo && billing === "monthly" && (
                  <p className="text-xs font-golos text-accent mb-4 tracking-wide">{tier.promo}</p>
                )}
                {billing === "yearly" && (
                  <p className="text-xs font-golos text-primary/70 mb-4 tracking-wide">≈ {tier.name === "Photo Access" ? "$7.50" : "$18.33"}/mo — {tier.savingYear}</p>
                )}
                {!tier.promo && billing === "monthly" && <div className="mb-4" />}

                <div className="h-px bg-border mb-6" />

                <ul className="space-y-3 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-golos text-foreground/70">
                      <Icon name="Check" size={14} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* VIP note */}
                {"vipNote" in tier && tier.vipNote && (
                  <p className="text-xs font-golos text-muted-foreground/70 italic leading-relaxed mb-6 border-l-2 border-primary/30 pl-3">
                    {tier.vipNote}
                  </p>
                )}

                <button
                  className={`w-full py-3 text-sm tracking-widest uppercase font-golos transition-all duration-300 rounded ${
                    tier.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 animate-glow-pulse"
                      : "border border-border text-foreground/60 hover:border-primary hover:text-primary"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3">Collection</p>
          <h2 className="font-cormorant text-5xl md:text-6xl font-light text-gold-gradient">Gallery</h2>
          <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-4" />
        </div>

        <div className="grid grid-cols-12 gap-3 scroll-reveal">
          <div className="col-span-8 relative group overflow-hidden rounded-lg card-lift">
            <img src={IMG_HERO} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ aspectRatio: "4/3" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <span className="font-cormorant italic text-xl text-foreground/90">Editorial Series</span>
            </div>
          </div>
          <div className="col-span-4 relative group overflow-hidden rounded-lg card-lift">
            <img src={IMG_TEXTURE} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ aspectRatio: "1/1" }} />
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-center">
                <Icon name="Lock" size={18} className="text-primary mx-auto mb-1" />
                <span className="text-[10px] text-primary font-golos uppercase tracking-wider">VIP</span>
              </div>
            </div>
          </div>
          <div className="col-span-4 relative group overflow-hidden rounded-lg card-lift">
            <img src={IMG_ABOUT} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ aspectRatio: "1/1" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="font-cormorant italic text-sm text-foreground/90">Moody Portrait</span>
            </div>
          </div>
          <div className="col-span-8 relative group overflow-hidden rounded-lg card-lift flex items-center justify-center bg-card border border-border">
            <div className="text-center p-8">
              <p className="font-cormorant text-6xl text-gold-gradient mb-2">340+</p>
              <p className="font-golos text-xs uppercase tracking-widest text-muted-foreground">photos in archive</p>
              <div className="h-px w-12 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent my-4" />
              <button onClick={() => scrollTo("subscribe")} className="text-xs font-golos tracking-wider text-primary hover:text-primary/80 transition-colors duration-200 nav-link pb-0.5">
                Unlock access →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center scroll-reveal">
          <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3">Get in touch</p>
          <h2 className="font-cormorant text-5xl md:text-6xl font-light text-gold-gradient mb-4">Contact</h2>
          <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-12" />

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-left">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-golos uppercase tracking-widest text-muted-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded px-4 py-3 font-golos text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-golos uppercase tracking-widest text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded px-4 py-3 font-golos text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-golos uppercase tracking-widest text-muted-foreground mb-2">Message</label>
              <textarea
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded px-4 py-3 font-golos text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary transition-colors duration-200 resize-none"
                placeholder="Hey Luna..."
              />
            </div>
            <div className="text-center pt-4">
              <button type="submit" className="px-12 py-3 bg-primary text-primary-foreground text-sm tracking-widest uppercase font-golos hover:bg-primary/90 transition-all duration-300">
                Send Message
              </button>
            </div>
          </form>

          <div className="flex justify-center gap-8 mt-16 pt-8 border-t border-border">
            {[
              { label: "Telegram", icon: "Send" },
              { label: "Instagram", icon: "Camera" },
              { label: "OnlyFans", icon: "Star" },
            ].map((s) => (
              <button key={s.label} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200">
                <Icon name={s.icon} fallback="Star" size={18} />
                <span className="text-[10px] font-golos uppercase tracking-widest">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="font-cormorant text-2xl tracking-[0.4em] text-gold-gradient mb-2">LUNA</p>
        <p className="font-golos text-xs text-muted-foreground/40 tracking-wider">
          © 2026 · For adults 18+ only
        </p>
      </footer>

      {/* ── AUTH MODAL ── */}
      <AuthModal
        open={authOpen}
        defaultMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </div>
  );
}