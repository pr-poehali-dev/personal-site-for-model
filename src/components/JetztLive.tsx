import { useEffect, useState } from "react";

interface LiveModel {
  uniqueModelId?: string;
  performerId?: string;
  displayName: string;
  chatRoomUrl: string;
  profilePictureUrl: {
    size896x504?: string;
    [key: string]: string | undefined;
  };
  bannedCountries?: string[];
}

const API_URL =
  "https://atwmcd.com/api/model/feed?siteId=jasmin&psId=Grinxxx&psTool=213_1&psProgram=revs&campaignId=136134&category=girl&limit=8&imageSizes=896x504&imageType=any&showOffline=0&onlyFreeStatus=1&extendedDetails=0&responseFormat=json&performerId=&subAffId=&accessKey=3a373b84697fc09247198c307c46f10d&legacyRedirect=1&customOrder=most_popular";

export default function JetztLive() {
  const [models, setModels] = useState<LiveModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list: LiveModel[] = Array.isArray(data)
          ? data
          : data?.data?.models || data?.models || data?.data || data?.items || [];
        const filtered = list
          .filter((m) => !(m.bannedCountries || []).includes("DE"))
          .filter((m) => m.profilePictureUrl?.size896x504 && m.chatRoomUrl)
          .slice(0, 4);
        setModels(filtered);
      })
      .catch(() => {
        if (!cancelled) setModels([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || models.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-cormorant text-4xl md:text-6xl font-light tracking-wide mb-3">
            <span className="text-gold-gradient">JETZT LIVE</span>
          </h2>
          <p className="font-cormorant italic text-base md:text-xl text-foreground/70 mb-4">
            Entdecke Models, die gerade online sind
          </p>
          <p className="font-golos text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50">
            Anzeige · Partnerangebot
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {models.map((model) => (
            <a
              key={model.uniqueModelId || model.performerId || model.displayName}
              href={model.chatRoomUrl}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/60 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={model.profilePictureUrl.size896x504}
                  alt={model.displayName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] tracking-widest uppercase font-golos text-foreground">
                    Live
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="font-cormorant text-lg md:text-xl text-foreground mb-2 truncate">
                    {model.displayName}
                  </p>
                  <span className="inline-block w-full text-center px-3 py-2 bg-primary/90 text-primary-foreground text-[11px] md:text-xs tracking-widest uppercase font-golos group-hover:bg-primary transition-colors duration-300 rounded">
                    Live-Chat ansehen
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}