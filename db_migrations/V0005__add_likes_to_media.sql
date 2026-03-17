ALTER TABLE t_p19413006_personal_site_for_mo.media ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS t_p19413006_personal_site_for_mo.media_likes (
  id serial PRIMARY KEY,
  media_id integer NOT NULL,
  user_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(media_id, user_id)
);