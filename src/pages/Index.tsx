import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import AuthModal from "@/components/AuthModal";
import { getToken, getMe, clearToken, hasTier, User } from "@/lib/auth";

const IMG_HERO = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/bccf737b-8f5b-42a2-9a41-331473009369.jpg";
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



export default function Index() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [lightbox, setLightbox] = useState<{ imgs: string[]; idx: number } | null>(null);
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

  const handleBlogClick = () => navigate("/blog");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between backdrop-blur-md bg-background/70 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="font-cormorant text-2xl font-light tracking-[0.2em] text-gold-gradient">Mia Rey</span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground" title="Verified">
            <Icon name="Check" size={11} />
          </span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-8">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button onClick={() => scrollTo(l.id)} className={`nav-link text-sm tracking-widest uppercase font-golos transition-colors duration-200 ${activeSection === l.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {l.label}
              </button>
            </li>
          ))}
          <li><button onClick={handleBlogClick} className="nav-link text-sm tracking-widest uppercase font-golos transition-colors duration-200 text-muted-foreground hover:text-foreground">Blog</button></li>
          <li><button onClick={() => navigate("/feed")} className="nav-link text-sm tracking-widest uppercase font-golos transition-colors duration-200 text-muted-foreground hover:text-foreground">Feed</button></li>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Auth desktop */}
          {user ? (
            <div className="relative hidden md:block">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 text-xs font-golos tracking-wider text-foreground/70 hover:text-foreground transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Icon name="User" size={13} className="text-primary" />
                </div>
                <span>{user.name || user.email.split("@")[0]}</span>
                <Icon name="ChevronDown" size={13} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-golos text-foreground/80 truncate">{user.email}</p>
                    {user.subscription ? <span className="text-[10px] text-primary font-golos uppercase tracking-wider">{user.subscription.tier === "vip" ? "Full Access" : "Photo Access"}</span> : <span className="text-[10px] text-muted-foreground font-golos">No active subscription</span>}
                  </div>
                  {!user.subscription && (
                    <button onClick={() => { setUserMenuOpen(false); scrollTo("subscribe"); }} className="w-full text-left px-4 py-2.5 text-xs font-golos text-primary hover:bg-primary/10 transition-colors flex items-center gap-2">
                      <Icon name="Star" size={13} /> Get subscription
                    </button>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-golos text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2">
                    <Icon name="LogOut" size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => openAuth("login")} className="text-xs tracking-wider font-golos text-muted-foreground hover:text-foreground transition-colors">Sign In</button>
              <button onClick={() => openAuth("register")} className="text-xs tracking-[0.2em] uppercase px-5 py-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-golos">Subscribe</button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors">
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[57px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex flex-col py-3">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => { scrollTo(l.id); setMobileMenuOpen(false); }} className="px-6 py-3 text-sm tracking-widest uppercase font-golos text-left text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                {l.label}
              </button>
            ))}
            <button onClick={() => { handleBlogClick(); setMobileMenuOpen(false); }} className="px-6 py-3 text-sm tracking-widest uppercase font-golos text-left text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">Blog</button>
            <button onClick={() => { navigate("/feed"); setMobileMenuOpen(false); }} className="px-6 py-3 text-sm tracking-widest uppercase font-golos text-left text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">Feed</button>
            <div className="h-px bg-border mx-6 my-2" />
            {user ? (
              <>
                <div className="px-6 py-2 text-xs font-golos text-muted-foreground truncate">{user.email}</div>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="px-6 py-3 text-sm font-golos text-left text-muted-foreground hover:text-foreground transition-colors">Sign out</button>
              </>
            ) : (
              <div className="flex gap-3 px-6 py-3">
                <button onClick={() => { openAuth("login"); setMobileMenuOpen(false); }} className="flex-1 py-2.5 text-xs tracking-wider font-golos border border-border text-foreground/70 rounded-lg">Sign In</button>
                <button onClick={() => { openAuth("register"); setMobileMenuOpen(false); }} className="flex-1 py-2.5 text-xs tracking-wider uppercase font-golos bg-primary text-primary-foreground rounded-lg">Subscribe</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex flex-col md:flex-row items-center overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-float delay-300" />

        {/* Фото — на мобильном сверху, на десктопе справа */}
        <div className="relative z-10 w-full md:hidden h-[70vw] min-h-[320px] flex-shrink-0 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <img src={IMG_HERO} alt="Mia Rey" className="h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        {/* Текст */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-24 py-8 md:py-24">
          <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-4 md:mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Welcome to my world
          </p>
          <h1 className="font-cormorant text-6xl md:text-9xl font-light tracking-wide mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            <span className="text-gold-gradient">MIA</span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mb-4 md:mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }} />
          <p className="font-cormorant italic text-lg md:text-2xl text-foreground/70 mb-8 md:mb-10 font-light opacity-0 animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>Official Website</p>
          <div className="flex gap-3 md:gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
            <button onClick={() => scrollTo("feed")} className="px-6 md:px-8 py-3 bg-primary text-primary-foreground text-xs md:text-sm tracking-widest uppercase font-golos hover:bg-primary/90 transition-all duration-300 animate-glow-pulse">
              View Feed
            </button>
            <button onClick={() => scrollTo("subscribe")} className="px-6 md:px-8 py-3 border border-foreground/20 text-foreground/70 text-xs md:text-sm tracking-widest uppercase font-golos hover:border-primary hover:text-primary transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>

        {/* Фото справа — только десктоп */}
        <div className="relative z-10 h-screen w-[45vw] flex-shrink-0 hidden md:block opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <img
            src={IMG_HERO}
            alt="Mia Rey"
            className="h-full w-full object-cover object-center"
            style={{ transform: `translateY(${mousePos.y * 0.01}px)`, transition: "transform 0.1s linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-muted-foreground/50">
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
          <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-4 mb-6" />
          <button
            onClick={() => navigate("/feed")}
            className="text-xs font-golos tracking-widest uppercase px-6 py-2.5 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Open full feed →
          </button>
        </div>

        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {feedItems.map((item, i) => {
            const unlocked = !item.locked || hasTier(user, "photo");
            const feedImgs = feedItems.filter(f => !f.locked || hasTier(user, "photo")).map(f => f.img);
            return (
            <div
              key={item.id}
              className="break-inside-avoid relative group card-lift rounded-lg overflow-hidden scroll-reveal cursor-pointer"
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => unlocked ? navigate(`/feed/${item.id}`) : scrollTo("subscribe")}
            >
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
                    <span className="text-xs font-golos text-primary tracking-wider">Subscribe to unlock</span>
                  </div>
                )}
                {unlocked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} className="flex items-center gap-1.5 text-xs font-golos text-foreground/80">
                      <Icon name="Heart" size={14} className={likedPosts.includes(item.id) ? "text-accent fill-accent" : "text-foreground/60"} />
                      <span>{item.likes + (likedPosts.includes(item.id) ? 1 : 0)}</span>
                    </button>
                    <Icon name="Expand" size={14} className="text-foreground/60" />
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <div className="relative">
              <img src="https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/e679c7ed-c2cc-4639-bd7e-ee506913a348.jpg" alt="About" className="w-full rounded-lg object-cover" style={{ aspectRatio: "3/4" }} />
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
              Hi, I'm <span className="text-gold-gradient">Mia</span>
            </h2>
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent mb-8" />
            <p className="font-golos text-foreground/70 leading-relaxed mb-6 text-sm">
              I'm an artist of my body and my image. Every shot is a story, every frame — a work of art. I believe in beauty without compromise and freedom of self-expression.
            </p>
            <p className="font-golos text-foreground/50 leading-relaxed mb-10 text-sm">
              Here I share exclusive content you won't find anywhere else. Subscribe and become part of my world.
            </p>
            <div className="flex gap-6 flex-wrap">
              {[
                { label: "Instagram", icon: "📸", href: "https://www.instagram.com/" },
                { label: "Twitter / X", icon: "𝕏", href: "https://twitter.com/" },
                { label: "Telegram", icon: "✈️", href: "https://t.me/" },
                { label: "TikTok", icon: "🎵", href: "https://www.tiktok.com/" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-golos tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200 nav-link pb-1">
                  <span>{s.icon}</span>{s.label}
                </a>
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
          <div className="text-center mb-10 scroll-reveal">
            <p className="font-golos text-xs tracking-[0.5em] uppercase text-muted-foreground mb-3">Content access</p>
            <h2 className="font-cormorant text-5xl md:text-6xl font-light text-gold-gradient">Subscribe</h2>
            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mt-4 mb-5" />
            <p className="font-golos text-sm text-foreground/70 max-w-lg mx-auto leading-relaxed">
              Exclusive 18+ content — photos, personal shots and more. From <span className="text-primary font-medium">$3.99/month</span>
            </p>
          </div>

          <div className="max-w-sm mx-auto scroll-reveal">
            <div className="tier-card tier-featured rounded-xl p-8 border-gold-glow bg-card border-primary/40 relative text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-[10px] tracking-[0.25em] uppercase font-golos px-5 py-1.5 bg-primary text-primary-foreground rounded-full shadow-lg">
                  FULL ACCESS
                </span>
              </div>

              <div className="flex items-baseline gap-1 justify-center mb-2 mt-2">
                <span className="font-cormorant text-6xl text-foreground">$3.99</span>
                <span className="text-xs font-golos text-muted-foreground">/month</span>
              </div>

              <div className="h-px bg-border mb-6" />

              <ul className="space-y-3 mb-8 text-left">
                {[
                  "Uncensored 18+ photo sets",
                  "Weekly exclusive photos",
                  "Personal & lifestyle shots",
                  "Access to full content library",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-golos text-foreground/70">
                    <Icon name="Check" size={14} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3">
                <a
                  href="https://www.fanvue.com/miarey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 text-sm tracking-widest uppercase font-golos transition-all duration-300 rounded bg-primary text-primary-foreground hover:bg-primary/90 animate-glow-pulse flex items-center justify-center gap-2"
                >
                  <Icon name="ExternalLink" size={14} />
                  Subscribe on Fanvue
                </a>
                <a
                  href="https://boosty.to/miarey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 text-sm tracking-widest uppercase font-golos transition-all duration-300 rounded border border-border text-foreground/60 hover:border-primary hover:text-primary flex items-center justify-center gap-2"
                >
                  <Icon name="ExternalLink" size={14} />
                  Subscribe on Boosty
                </a>
              </div>
            </div>
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
          <div className="col-span-8 relative group overflow-hidden rounded-lg card-lift cursor-pointer" onClick={() => setLightbox({ imgs: [IMG_HERO, IMG_ABOUT], idx: 0 })}>
            <img src={IMG_HERO} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ aspectRatio: "4/3" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
              <span className="font-cormorant italic text-xl text-foreground/90">Editorial Series</span>
              <Icon name="Expand" size={16} className="text-foreground/60" />
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
          <div className="col-span-4 relative group overflow-hidden rounded-lg card-lift cursor-pointer" onClick={() => setLightbox({ imgs: [IMG_ABOUT, IMG_HERO], idx: 0 })}>
            <img src={IMG_ABOUT} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ aspectRatio: "1/1" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
              <span className="font-cormorant italic text-sm text-foreground/90">Moody Portrait</span>
              <Icon name="Expand" size={14} className="text-foreground/60" />
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



      {/* ── SEO TEXT SECTION ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Block 1 */}
          <div className="scroll-reveal space-y-4">
            <h1 className="font-cormorant text-4xl md:text-5xl font-light tracking-wide text-gold-gradient leading-tight">
              Mia Rey – Exclusive Model Gallery
            </h1>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Welcome to the official home of Mia Rey, where artistic vision meets premium visual storytelling. This is more than a portfolio—it's a curated collection of aesthetic portrait photography that captures the essence of contemporary beauty and creative expression.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 2 */}
          <div className="scroll-reveal space-y-4">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide text-foreground/90 leading-tight">
              Discover Mia Rey: Model, Artist, Creative Vision
            </h2>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Mia Rey is a model and content creator known for her distinctive approach to artistic portrait photography. Her work transcends traditional modeling, blending cinematic lighting, carefully composed aesthetics, and a refined visual language that resonates with audiences seeking authentic, high-quality imagery.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              As a Mia Rey model and creative professional, she specializes in producing exclusive visual content that explores themes of beauty, lifestyle, and artistic expression. Each photograph is intentionally crafted to deliver a premium aesthetic experience—from intimate portrait studies to dynamic lifestyle imagery that tells a story.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The Mia Rey official website serves as the central hub for her most compelling work, offering visitors direct access to her evolving portfolio and exclusive behind-the-scenes content. Whether you're here to appreciate fine portrait photography or discover new perspectives on aesthetic visual art, you'll find carefully curated collections that showcase her unique creative direction.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 3 */}
          <div className="scroll-reveal space-y-4">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide text-foreground/90 leading-tight">
              Explore the Gallery: Premium Visual Collections
            </h2>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The heart of this site is the Mia Rey gallery—a comprehensive showcase of artistic portraits and aesthetic photography spanning multiple collections. Here, you'll discover the depth and range of her work across different themes, moods, and visual styles.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Mia Rey photos in the gallery represent months of creative collaboration, professional photography sessions, and meticulous post-production work. Each image is selected for its artistic merit, technical excellence, and emotional impact. The collections range from intimate black-and-white portrait studies to vibrant lifestyle imagery, all unified by a consistent aesthetic vision.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The exclusive model gallery features work that you won't find anywhere else online. These are original compositions created specifically for this platform, representing the most refined selections from her portfolio. Whether you're interested in portrait photography or seeking inspiration from contemporary aesthetic visual art, the gallery offers something for every discerning viewer.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Browse through carefully organized collections that showcase different facets of her artistry. Each section reveals new dimensions of her creative practice, from cinematic portrait photography to lifestyle and beauty imagery. The gallery is designed for exploration—take your time discovering the visual narratives that resonate with you.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 4 */}
          <div className="scroll-reveal space-y-4">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide text-foreground/90 leading-tight">
              Access Exclusive Content: Premium and Private Collections
            </h2>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Beyond the public gallery lies a world of Mia Rey exclusive content reserved for subscribers and VIP members. This is where the most intimate, experimental, and premium material lives—content created for an audience that appreciates the full scope of her artistic vision.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Mia Rey premium content includes private photo galleries, behind-the-scenes documentation, exclusive video content, and limited-edition collections that showcase her work in its most refined form. These aren't just additional photos; they represent a deeper engagement with her creative process and artistic evolution.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Mia Rey private photos are available through subscription, offering subscribers access to content that captures unfiltered moments, experimental shoots, and exclusive collaborations. This tier of access is designed for those who want to support her work directly while gaining insight into her creative practice.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The VIP content experience includes early access to new collections, exclusive announcements, and direct communication with Mia Rey herself. Subscribers become part of an intimate community that values artistic excellence and creative authenticity.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 5 */}
          <div className="scroll-reveal space-y-4">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide text-foreground/90 leading-tight">
              The Aesthetic: Cinematic Vision and Artistic Direction
            </h2>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              What sets Mia Rey apart is her distinctive visual language—a carefully developed aesthetic that combines technical mastery with artistic intuition. Her work is characterized by thoughtful composition, sophisticated color grading, and an understanding of how light shapes emotion and narrative.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Artistic portrait photography forms the foundation of her practice. Each portrait is more than a documentation of appearance; it's an exploration of presence, mood, and the subtle interplay between subject and environment. Her approach to portrait photography emphasizes authenticity while maintaining a polished, professional aesthetic.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The aesthetic portrait model style she's developed draws inspiration from contemporary fine art, cinema, and editorial fashion photography. Dark aesthetic photography plays a significant role in her visual vocabulary—moody lighting, rich shadows, and carefully controlled contrast create images that feel both intimate and cinematic.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The visual aesthetic extends beyond individual images to encompass entire collections and series. Each body of work tells a story, explores a theme, or investigates a particular aspect of visual storytelling. This cohesive approach transforms the gallery from a simple collection of photos into a meaningful artistic statement.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 6 */}
          <div className="scroll-reveal space-y-4">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light tracking-wide text-foreground/90 leading-tight">
              Your Gateway to Exclusive Visual Art
            </h2>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              This website is structured to guide you through different layers of engagement with Mia Rey's work. Start by exploring the Gallery section, where you can browse through public collections and get a sense of her artistic direction and visual style.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The Feed section keeps you updated with the latest releases, new collections, and behind-the-scenes moments. Follow along to stay connected with her creative journey and be among the first to discover new work as it's released.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              For those ready to deepen their engagement, the Subscribe section offers access to Mia Rey exclusive content and premium material. Subscription unlocks private photo galleries, exclusive collections, and VIP benefits that provide a more intimate connection to her work and creative process.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 7 */}
          <div className="scroll-reveal space-y-4">
            <h3 className="font-cormorant text-2xl md:text-3xl font-light tracking-wide text-foreground/80 leading-tight">
              Why Choose Mia Rey
            </h3>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              In a landscape saturated with generic content, Mia Rey stands out through commitment to artistic excellence and authentic creative expression. Her work isn't about following trends—it's about establishing them, pushing boundaries, and creating visual art that endures.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              Every photograph, every collection, and every piece of content on this site reflects a dedication to quality, intentionality, and artistic vision. Whether you're a photography enthusiast, an art collector, or simply someone who appreciates beautiful, well-crafted imagery, you'll find value in exploring her portfolio.
            </p>
            <p className="font-golos text-muted-foreground text-base leading-relaxed">
              The Mia Rey official website represents the most direct, unfiltered access to her work. No intermediaries, no compromises—just pure artistic expression delivered directly to you.
            </p>
          </div>

          <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Block 8 — CTA */}
          <div className="scroll-reveal space-y-4 text-center">
            <h3 className="font-cormorant text-2xl md:text-3xl font-light tracking-wide text-foreground/80 leading-tight">
              Begin Your Journey
            </h3>
            <p className="font-golos text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
              Your exploration of Mia Rey's artistic world starts here. Browse the gallery to discover the range and depth of her work. Follow the feed to stay connected with new releases and creative developments. And when you're ready to access the full spectrum of her exclusive content, subscribe to unlock premium collections and VIP experiences.
            </p>
            <p className="font-golos text-muted-foreground/60 text-sm leading-relaxed max-w-2xl mx-auto italic">
              This is more than a model portfolio—it's an invitation into a carefully curated world of aesthetic visual art, premium content, and authentic creative expression. Welcome to the official home of Mia Rey.
            </p>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="font-cormorant text-2xl tracking-[0.4em] text-gold-gradient mb-2">Mia Rey</p>
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

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setLightbox(null)}
          >
            <Icon name="X" size={18} />
          </button>
          {lightbox.imgs.length > 1 && (
            <>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(lb => lb && { ...lb, idx: (lb.idx - 1 + lb.imgs.length) % lb.imgs.length }); }}
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox(lb => lb && { ...lb, idx: (lb.idx + 1) % lb.imgs.length }); }}
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}
          <img
            src={lightbox.imgs[lightbox.idx]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.imgs.length > 1 && (
            <div className="absolute bottom-5 flex gap-2">
              {lightbox.imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(lb => lb && { ...lb, idx: i }); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === lightbox.idx ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}