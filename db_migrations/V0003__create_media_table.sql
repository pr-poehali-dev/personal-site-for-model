CREATE TABLE t_p19413006_personal_site_for_mo.media (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'photo',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    tier TEXT NOT NULL DEFAULT 'free',
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);