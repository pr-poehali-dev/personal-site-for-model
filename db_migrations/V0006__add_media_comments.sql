CREATE TABLE IF NOT EXISTS t_p19413006_personal_site_for_mo.media_comments (
  id serial PRIMARY KEY,
  media_id integer NOT NULL,
  user_id integer NOT NULL,
  text text NOT NULL,
  rand_likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);