CREATE TABLE t_p19413006_personal_site_for_mo.blog_posts (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  img_url TEXT,
  tag TEXT DEFAULT 'General',
  seo_title TEXT,
  seo_description TEXT,
  keywords TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);