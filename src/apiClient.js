/**
 * Cliente de API Casa Vellumine — Cloudflare D1 Backend
 */

export async function apiFetch(path, { method = "GET", body, accessToken } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const cleanPath = path.startsWith("/") ? path : `/api/${path}`;
  const res = await fetch(cleanPath, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data.error || data.message)) || "Erro de conexão com o servidor.");
  }
  return data;
}

export async function apiSignIn(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "E-mail ou senha incorretos.");
  }
  return data;
}
