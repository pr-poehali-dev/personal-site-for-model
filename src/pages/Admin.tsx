import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import RichTextEditor from "@/components/ui/RichTextEditor";

const AUTH_URL = "https://functions.poehali.dev/0f69b8f2-267a-4d9e-b597-2ba21b26ce35";

type Tab = "stats" | "users" | "subscriptions" | "media" | "blog";

interface Stats {
  total_users: number;
  active_subscriptions: number;
  total_media: number;
}

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  subscription: { tier: string; status: string; expires_at: string } | null;
}

interface Subscription {
  id: number;
  user_id: number;
  email: string;
  name: string | null;
  tier: string;
  status: string;
  started_at: string;
  expires_at: string;
  created_at: string;
}

interface MediaItem {
  id: number;
  title: string | null;
  description: string | null;
  type: string;
  subtype: string;
  url: string;
  thumbnail_url: string | null;
  tier: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  img_url: string | null;
  tag: string;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

function apiCall(action: string, method = "GET", body?: object, extra = "") {
  const token = localStorage.getItem("token");
  return fetch(`${AUTH_URL}?action=${action}${extra}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

function formatDate(s: string) {
  if (!s || s === "None") return "—";
  return new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${AUTH_URL}?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());
    setLoading(false);
    if (res.token) {
      if (res.user.role !== "admin") {
        toast.error("Нет доступа к админке");
        return;
      }
      localStorage.setItem("token", res.token);
      onLogin();
    } else {
      toast.error(res.error || "Ошибка входа");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-border bg-card">
        <h1 className="font-cormorant text-3xl text-foreground mb-2 text-center">Админ-панель</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">Только для администраторов</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder="Логин"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-sm"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogEditing, setBlogEditing] = useState<BlogPost | null>(null);
  const [blogEditorOpen, setBlogEditorOpen] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", content: "", tag: "General", seo_title: "", seo_description: "", keywords: "", is_published: true, sort_order: 0, img_url: "" });
  const [blogUploading, setBlogUploading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const blogImgRef = useRef<HTMLInputElement>(null);
  const [uploadTier, setUploadTier] = useState<"free" | "photo" | "vip">("free");
  const [uploadSubtype, setUploadSubtype] = useState<"post" | "reel">("post");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setChecking(false); return; }
    fetch(`${AUTH_URL}?action=me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.role === "admin") setAuthed(true);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "stats") loadStats();
    if (tab === "users") loadUsers();
    if (tab === "subscriptions") loadSubscriptions();
    if (tab === "media") loadMedia();
    if (tab === "blog") loadBlogPosts();
  }, [authed, tab]);

  async function loadStats() {
    const d = await apiCall("admin_stats");
    if (d.total_users !== undefined) setStats(d);
  }
  async function loadUsers() {
    const d = await apiCall("admin_users");
    if (d.users) setUsers(d.users);
  }
  async function loadSubscriptions() {
    const d = await apiCall("admin_subscriptions");
    if (d.subscriptions) setSubscriptions(d.subscriptions);
  }
  async function loadMedia() {
    const d = await apiCall("admin_media");
    if (d.media) setMedia(d.media);
  }

  async function loadBlogPosts() {
    const d = await apiCall("admin_blog_list");
    if (d.posts) setBlogPosts(d.posts);
  }

  function openBlogNew() {
    setBlogEditing(null);
    setBlogEditorOpen(true);
    setBlogForm({ title: "", excerpt: "", content: "", tag: "General", seo_title: "", seo_description: "", keywords: "", is_published: true, sort_order: 0, img_url: "" });
  }

  function openBlogEdit(post: BlogPost) {
    setBlogEditing(post);
    setBlogEditorOpen(true);
    setBlogForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      tag: post.tag,
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      keywords: post.keywords || "",
      is_published: post.is_published,
      sort_order: post.sort_order,
      img_url: post.img_url || "",
    });
  }

  async function saveBlogPost() {
    if (!blogForm.title.trim()) { toast.error("Укажи заголовок"); return; }
    setBlogSaving(true);
    try {
      if (blogEditing) {
        await apiCall("admin_blog_update", "PUT", { id: blogEditing.id, ...blogForm });
        toast.success("Статья обновлена");
      } else {
        const res = await apiCall("admin_blog_create", "POST", blogForm);
        if (res.error) { toast.error(res.error); return; }
        toast.success("Статья создана");
      }
      setBlogEditorOpen(false);
      setBlogEditing(null);
      loadBlogPosts();
    } finally {
      setBlogSaving(false);
    }
  }

  async function deleteBlogPost(id: number) {
    if (!confirm("Удалить статью?")) return;
    await apiCall("admin_blog_delete", "DELETE", undefined, `&id=${id}`);
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Удалено");
  }

  async function handleBlogImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBlogUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const res = await apiCall("admin_blog_upload_img", "POST", {
        file: base64,
        filename: file.name,
        content_type: file.type,
      });
      setBlogUploading(false);
      if (res.url) {
        setBlogForm((f) => ({ ...f, img_url: res.url }));
        toast.success("Фото загружено");
      } else {
        toast.error(res.error || "Ошибка загрузки");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Файл слишком большой. Максимум 50 МБ для видео.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    const isVideo = file.type.startsWith("video/");

    if (isVideo) {
      // Для видео — загрузка чанками по 800КБ через бэкенд
      try {
        const token = localStorage.getItem("token");
        const CHUNK = 800 * 1024;
        const totalChunks = Math.ceil(file.size / CHUNK);
        let uploadId = "";
        let cdnUrl = "";

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK;
          const end = Math.min(start + CHUNK, file.size);
          const blob = file.slice(start, end);
          const base64 = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve((r.result as string).split(",")[1]);
            r.readAsDataURL(blob);
          });

          const res = await fetch(`${AUTH_URL}?action=admin_media_chunk`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              chunk: base64,
              chunk_index: i,
              total_chunks: totalChunks,
              upload_id: uploadId,
              filename: file.name,
              content_type: file.type,
              type: "video",
              subtype: uploadSubtype,
              tier: uploadTier,
              title: uploadTitle || null,
              description: uploadDescription || null,
            }),
          });
          const data = await res.json();
          if (data.error) { toast.error(data.error); setUploading(false); return; }
          if (data.upload_id) uploadId = data.upload_id;
          if (data.cdn_url) cdnUrl = data.cdn_url;
        }

        setUploading(false);
        if (cdnUrl) {
          toast.success("Видео загружено");
          setUploadTitle(""); setUploadDescription(""); setUploadSubtype("post");
          loadMedia();
        } else {
          toast.error("Ошибка загрузки видео");
        }
      } catch (err) {
        setUploading(false);
        toast.error(`Ошибка: ${err instanceof Error ? err.message : "неизвестная ошибка"}`);
      }
      return;
    }

    // Для фото — base64 через бэкенд
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${AUTH_URL}?action=admin_media_upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            content_type: file.type,
            type: "photo",
            subtype: uploadSubtype,
            tier: uploadTier,
            title: uploadTitle || null,
            description: uploadDescription || null,
          }),
        });
        if (!response.ok) {
          setUploading(false);
          toast.error(`Ошибка сервера: ${response.status}`);
          return;
        }
        const res = await response.json();
        setUploading(false);
        if (res.id) {
          toast.success("Файл загружен");
          setUploadTitle("");
          setUploadDescription("");
          setUploadSubtype("post");
          loadMedia();
        } else {
          toast.error(res.error || "Ошибка загрузки");
        }
      } catch (err) {
        setUploading(false);
        toast.error(`Ошибка: ${err instanceof Error ? err.message : "неизвестная ошибка"}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function deleteMedia(id: number) {
    if (!confirm("Удалить файл?")) return;
    await apiCall("admin_media_delete", "DELETE", undefined, `&id=${id}`);
    setMedia((prev) => prev.filter((m) => m.id !== id));
    toast.success("Удалено");
  }

  async function togglePublished(item: MediaItem) {
    await apiCall("admin_media_update", "PUT", { ...item, is_published: !item.is_published });
    setMedia((prev) => prev.map((m) => m.id === item.id ? { ...m, is_published: !m.is_published } : m));
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthed(false);
  }

  if (checking) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "stats", label: "Обзор", icon: "BarChart3" },
    { key: "users", label: "Пользователи", icon: "Users" },
    { key: "subscriptions", label: "Подписки", icon: "CreditCard" },
    { key: "media", label: "Медиа", icon: "Image" },
    { key: "blog", label: "Блог", icon: "BookOpen" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <span className="font-cormorant text-xl text-foreground">Mia Rey · Admin</span>
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors">
          <Icon name="LogOut" size={16} />
          Выйти
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 min-h-[calc(100vh-61px)] border-r border-border p-4 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">

          {/* STATS */}
          {tab === "stats" && (
            <div>
              <h2 className="font-cormorant text-2xl text-foreground mb-6">Обзор</h2>
              {stats ? (
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Пользователей", value: stats.total_users, icon: "Users" },
                    { label: "Активных подписок", value: stats.active_subscriptions, icon: "CreditCard" },
                    { label: "Медиафайлов", value: stats.total_media, icon: "Image" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon name={s.icon} size={18} className="text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm">{s.label}</span>
                      </div>
                      <span className="font-cormorant text-4xl text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">Загрузка...</div>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === "users" && (
            <div>
              <h2 className="font-cormorant text-2xl text-foreground mb-6">
                Пользователи <span className="text-muted-foreground text-lg">({users.length})</span>
              </h2>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Имя</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Роль</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Подписка</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.subscription ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-accent/20 text-accent">
                              {u.subscription.tier}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">нет</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Нет пользователей</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS */}
          {tab === "subscriptions" && (
            <div>
              <h2 className="font-cormorant text-2xl text-foreground mb-6">
                Подписки <span className="text-muted-foreground text-lg">({subscriptions.length})</span>
              </h2>
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Тариф</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Статус</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Начало</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Истекает</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-foreground">{s.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{s.tier}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === "active" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(s.started_at)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(s.expires_at)}</td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Нет подписок</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MEDIA */}
          {tab === "media" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-cormorant text-2xl text-foreground">
                  Медиа <span className="text-muted-foreground text-lg">({media.length})</span>
                </h2>
              </div>

              {/* Upload panel */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Загрузить фото / видео</p>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Название (необязательно)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <select
                    value={uploadTier}
                    onChange={(e) => setUploadTier(e.target.value as "free" | "photo" | "vip")}
                    className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="free">🌐 Бесплатно (всем)</option>
                    <option value="photo">🔒 Подписчики ($3.99)</option>
                    <option value="vip">⭐ VIP</option>
                  </select>
                  <select
                    value={uploadSubtype}
                    onChange={(e) => setUploadSubtype(e.target.value as "post" | "reel")}
                    className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="post">🖼 Пост</option>
                    <option value="reel">🎬 Рилс</option>
                  </select>
                </div>
                <textarea
                  placeholder="Описание / подпись к фото (необязательно)"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none mb-3"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Icon name="Upload" size={16} />
                  {uploading ? "Загружаю..." : "Выбрать файл"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              {media.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
                  <Icon name="Image" size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Загрузи первое фото или видео</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="group relative bg-card border border-border rounded-xl overflow-hidden">
                      {item.type === "video" ? (
                        <div className="aspect-square bg-muted flex items-center justify-center relative">
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Icon name="Play" size={28} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <img src={item.url} alt={item.title || ""} className="aspect-square object-cover w-full" />
                      )}
                      <div className="p-3">
                        <p className="text-xs text-foreground truncate font-medium">{item.title || "Без названия"}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.tier === "free" ? "bg-green-500/20 text-green-400" :
                            item.tier === "vip" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-primary/20 text-primary"
                          }`}>
                            {item.tier === "free" ? "Бесплатно" : item.tier === "vip" ? "VIP" : "Платно"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.subtype === "reel" ? "bg-pink-500/20 text-pink-400" : item.type === "video" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                            {item.subtype === "reel" ? "🎬 рилс" : item.type === "video" ? "видео" : "фото"}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePublished(item)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${item.is_published ? "bg-green-500/80 text-white" : "bg-muted/80 text-muted-foreground"}`}
                          title={item.is_published ? "Скрыть" : "Опубликовать"}
                        >
                          <Icon name={item.is_published ? "Eye" : "EyeOff"} size={13} />
                        </button>
                        <button
                          onClick={() => deleteMedia(item.id)}
                          className="w-7 h-7 rounded-lg bg-destructive/80 text-white flex items-center justify-center"
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={13} />
                        </button>
                      </div>
                      {/* Tier badge top-left */}
                      {item.tier !== "free" && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-primary font-medium">
                            {item.tier === "vip" ? "VIP" : "🔒"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BLOG */}
          {tab === "blog" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-cormorant text-2xl text-foreground">
                  Блог <span className="text-muted-foreground text-lg">({blogPosts.length})</span>
                </h2>
                <button
                  onClick={openBlogNew}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90"
                >
                  <Icon name="Plus" size={16} />
                  Новая статья
                </button>
              </div>

              {/* Editor */}
              {blogEditorOpen && (
                <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{blogEditing ? "Редактировать статью" : "Новая статья"}</p>
                    <button onClick={() => { setBlogEditorOpen(false); setBlogEditing(null); }} className="text-muted-foreground hover:text-foreground">
                      <Icon name="X" size={16} />
                    </button>
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Заголовок *"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />

                  {/* Tag + published */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Тег (напр. Photography)"
                      value={blogForm.tag}
                      onChange={(e) => setBlogForm((f) => ({ ...f, tag: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogForm.is_published}
                        onChange={(e) => setBlogForm((f) => ({ ...f, is_published: e.target.checked }))}
                        className="rounded"
                      />
                      Опубликовано
                    </label>
                  </div>

                  {/* Excerpt */}
                  <textarea
                    placeholder="Краткое описание (для превью)"
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />

                  {/* Content */}
                  <RichTextEditor
                    value={blogForm.content}
                    onChange={(html) => setBlogForm((f) => ({ ...f, content: html }))}
                    placeholder="Текст статьи..."
                  />

                  {/* Image upload */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Обложка статьи</p>
                    <div className="flex gap-3 items-start">
                      {blogForm.img_url && (
                        <img src={blogForm.img_url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                      )}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => blogImgRef.current?.click()}
                          disabled={blogUploading}
                          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-50"
                        >
                          <Icon name="Upload" size={14} />
                          {blogUploading ? "Загружаю..." : "Загрузить фото"}
                        </button>
                        {blogForm.img_url && (
                          <button onClick={() => setBlogForm((f) => ({ ...f, img_url: "" }))} className="text-xs text-destructive hover:underline text-left">
                            Удалить фото
                          </button>
                        )}
                      </div>
                    </div>
                    <input ref={blogImgRef} type="file" accept="image/*" className="hidden" onChange={handleBlogImgUpload} />
                  </div>

                  {/* SEO */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SEO</p>
                    <input
                      type="text"
                      placeholder="SEO Title (title страницы)"
                      value={blogForm.seo_title}
                      onChange={(e) => setBlogForm((f) => ({ ...f, seo_title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <textarea
                      placeholder="Meta Description"
                      value={blogForm.seo_description}
                      onChange={(e) => setBlogForm((f) => ({ ...f, seo_description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Ключевые слова (через запятую)"
                      value={blogForm.keywords}
                      onChange={(e) => setBlogForm((f) => ({ ...f, keywords: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Save */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => { setBlogEditorOpen(false); setBlogEditing(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                      Отмена
                    </button>
                    <button
                      onClick={saveBlogPost}
                      disabled={blogSaving}
                      className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      <Icon name="Save" size={15} />
                      {blogSaving ? "Сохраняю..." : "Сохранить"}
                    </button>
                  </div>
                </div>
              )}

              {/* Posts list */}
              {blogPosts.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
                  <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Создай первую статью</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                      {post.img_url ? (
                        <img src={post.img_url} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon name="Image" size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{post.tag}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${post.is_published ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                            {post.is_published ? "Опубликовано" : "Скрыто"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/blog/{post.slug}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openBlogEdit(post)}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button
                          onClick={() => deleteBlogPost(post.id)}
                          className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}