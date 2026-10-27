import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const PROMO_IMG = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/adddfb04-150d-4974-8017-2e71fca735a3.jpg";
const PROMO_URL = "https://getruvada.com/?promo=fea49d76-145e-4e1d-8bb0-85a2bfbd8ca4&target=register";
const STORAGE_KEY = "promo_popup_last_shown";
const DAY_MS = 24 * 60 * 60 * 1000;

export default function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (Date.now() - last > DAY_MS) {
      const t = setTimeout(() => {
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-xl overflow-hidden border border-primary/40 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 text-foreground hover:text-primary transition-colors"
        >
          <Icon name="X" size={18} />
        </button>

        <a href={PROMO_URL} target="_blank" rel="sponsored nofollow noopener noreferrer" className="block">
          <img src={PROMO_IMG} alt="Welcome bonus" className="w-full aspect-video object-cover" />
        </a>

        <div className="p-6 text-center">
          <h3 className="font-cormorant text-3xl md:text-4xl mb-2">
            <span className="text-gold-gradient">Claim 100 Free Spins</span>
          </h3>
          <p className="font-cormorant text-xl text-foreground/90 mb-5">
            + $1000 bonus for registration — right now!
          </p>
          <a
            href={PROMO_URL}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-block w-full px-6 py-3 bg-primary text-primary-foreground text-sm tracking-widest uppercase font-golos hover:bg-primary/90 transition-colors rounded"
          >
            Get my bonus
          </a>
          <p className="mt-4 font-golos text-[10px] tracking-widest uppercase text-muted-foreground/60">
            Ad · 18+ · Play responsibly
          </p>
        </div>
      </div>
    </div>
  );
}
