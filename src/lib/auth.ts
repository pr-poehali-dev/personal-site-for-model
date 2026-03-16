const AUTH_URL = "https://functions.poehali.dev/0f69b8f2-267a-4d9e-b597-2ba21b26ce35";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  subscription: { tier: string; status: string; expires_at: string } | null;
}

export interface AuthResult {
  token: string;
  user: User;
}

export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/?action=register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/?action=login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function googleLogin(googleToken: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/?action=google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: googleToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Google login failed");
  return data;
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${AUTH_URL}/?action=me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unauthorized");
  return data;
}

export function saveToken(token: string) {
  localStorage.setItem("luna_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("luna_token");
}

export function clearToken() {
  localStorage.removeItem("luna_token");
}

export function hasTier(user: User | null, required: "photo" | "vip"): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const sub = user.subscription;
  if (!sub || sub.status !== "active") return false;
  if (required === "photo") return ["photo", "vip"].includes(sub.tier);
  if (required === "vip") return sub.tier === "vip";
  return false;
}