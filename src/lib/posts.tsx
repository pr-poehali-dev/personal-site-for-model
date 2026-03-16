const IMG_1 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2a3de33c-b05b-4601-920b-5a7396c0b13f.jpg";
const IMG_2 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/8c29e61e-79ab-4828-9cca-4d1338afb7a3.jpg";
const IMG_3 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/files/2b5eac32-ce1c-404e-94cc-4a15436f038e.jpg";
const IMG_POST1 = "https://cdn.poehali.dev/projects/cbd01a0e-f632-42ca-a22c-0a22e14519b4/bucket/803768b9-9a5c-472a-9e6f-4deb2e53b935.jpg";

export interface Post {
  id: number;
  slug: string;
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

export const posts: Post[] = [
  {
    id: 1,
    slug: "welcome-to-my-website",
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
        <p>This website is the official home of my work.</p>
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
    slug: "cinematic-light-shooting-techniques",
    img: IMG_1,
    title: "Cinematic Light: My Favourite Shooting Techniques",
    excerpt: "How I use golden hour light and controlled shadows to create that signature moody aesthetic in every session.",
    date: "March 12, 2026",
    tag: "Photography",
    rotate: "rotate-1",
  },
  {
    id: 3,
    slug: "behind-the-scenes-studio-sessions",
    img: IMG_2,
    title: "Behind the Scenes: Studio Sessions",
    excerpt: "A peek into what actually happens during a studio day — from setup to final selection of the best shots.",
    date: "March 5, 2026",
    tag: "Behind the Scenes",
    rotate: "-rotate-1",
  },
  {
    id: 4,
    slug: "building-an-aesthetic-colour-mood",
    img: IMG_3,
    title: "Building an Aesthetic: Colour & Mood",
    excerpt: "The palette I return to again and again — deep burgundies, warm neutrals, and that ever-present touch of gold.",
    date: "February 28, 2026",
    tag: "Aesthetic",
    rotate: "rotate-2",
  },
  {
    id: 5,
    slug: "posing-with-intention",
    img: IMG_1,
    title: "Posing with Intention: Movement & Stillness",
    excerpt: "How mindful movement transforms a photograph from a snapshot into a visual story worth exploring.",
    date: "February 20, 2026",
    tag: "Posing",
    rotate: "-rotate-2",
  },
  {
    id: 6,
    slug: "the-edit-post-production-as-art",
    img: IMG_2,
    title: "The Edit: Post-Production as Art",
    excerpt: "My post-production workflow and why I believe editing is just as creative as the shoot itself.",
    date: "February 10, 2026",
    tag: "Photography",
    rotate: "rotate-1",
  },
];
