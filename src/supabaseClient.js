/**
 * Cliente Supabase REST e Autenticação
 * Casa Vellumine — Sistema de Reservas
 */

export const SUPABASE_URL = "https://xecslcroytlzovcokkgx.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8tWFYHqTpDvLZhavsYA5VA_9hAyRkJ6";

export async function supabaseRest(path, { method = "GET", body, accessToken } = {}) {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_PUBLISHABLE_KEY}`,
    "Content-Type": "application/json",
  };
  if (method !== "GET") headers["Prefer"] = "return=representation";

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data.message || data.error_description)) || "Erro de conexão com o banco de dados.");
  }
  return data;
}

export async function supabaseSignIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || "E-mail ou senha incorretos.");
  }
  return data;
}
