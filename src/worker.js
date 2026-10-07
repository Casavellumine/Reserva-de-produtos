/**
 * Casa Vellumine — Cloudflare Worker API & Static Asset Handler
 * Integrado com Cloudflare D1 (Banco SQLite Serverless nativo)
 */

// Sementes iniciais caso o banco de dados esteja vazio
const SEED_CATEGORIES = ["Vela Aromática", "Home Spray", "Difusor de Varetas", "Wax Melts"];

const SEED_PRODUCTS = [
  {
    id: "p-1",
    name: "Vela Âmbar & Baunilha Bourbon",
    category: "Vela Aromática",
    aroma: "Âmbar Nobre e Baunilha Bourbon",
    size: "210g · ~40h de queima",
    usage_notes: "Apare o pavio a 0,5cm antes de reacender. Na primeira queima, aguarde a piscina de cera cobrir toda a superfície.",
    price: 98.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  },
  {
    id: "p-2",
    name: "Vela Flor de Laranjeira & Cedro",
    category: "Vela Aromática",
    aroma: "Flor de Laranjeira & Cedro Virgínia",
    size: "180g · ~35h de queima",
    usage_notes: "Não deixe queimar por mais de 4 horas seguidas. Mantenha em superfície plana e longe de correntes de ar.",
    price: 89.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  },
  {
    id: "p-3",
    name: "Vela Lavanda Francesa & Alecrim",
    category: "Vela Aromática",
    aroma: "Lavanda Botânica e Alecrim Fresco",
    size: "200g · ~38h de queima",
    usage_notes: "Perfeita para o quarto ou momento de relaxamento noturno. Apague tampando o recipiente sem assoprar.",
    price: 92.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  },
  {
    id: "p-4",
    name: "Home Spray Bergamota & Chá Branco",
    category: "Home Spray",
    aroma: "Bergamota Italiana & Chá Branco",
    size: "250ml frasco âmbar com gatilho",
    usage_notes: "Borrife a 30cm de cortinas, almofadas e mantas para prolongar a fixação da fragrância por todo o dia.",
    price: 78.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  },
  {
    id: "p-5",
    name: "Difusor de Varetas Figo & Folhas Verdes",
    category: "Difusor de Varetas",
    aroma: "Figo da Terra e Notas Herbais",
    size: "200ml com 6 varetas de fibra",
    usage_notes: "Inverta as varetas uma vez por semana para renovar a difusão do perfume pelo cômodo.",
    price: 115.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  },
  {
    id: "p-6",
    name: "Wax Melts Canela & Especiarias",
    category: "Wax Melts",
    aroma: "Canela em Pau, Noz-Moscada & Cravo",
    size: "6 cubos aromáticos (75g)",
    usage_notes: "Deposite 1 cubo no aromatizador elétrico ou rechaud cerâmico. Pode ser reutilizado várias vezes.",
    price: 42.00,
    active: 1,
    photos: JSON.stringify([
      "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80"
    ]),
    main_photo: 0
  }
];

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function ensureTables(db) {
  if (!db) return;

  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        aroma TEXT DEFAULT '',
        size TEXT DEFAULT '',
        usage_notes TEXT DEFAULT '',
        price REAL NOT NULL DEFAULT 0.0,
        active INTEGER NOT NULL DEFAULT 1,
        photos TEXT DEFAULT '[]',
        main_photo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_whatsapp TEXT NOT NULL,
        items TEXT NOT NULL DEFAULT '[]',
        total REAL NOT NULL DEFAULT 0.0,
        gift_wrap INTEGER NOT NULL DEFAULT 0,
        packages TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'pendente',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_users (
        email TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)
  ]);

  const catCount = await db.prepare("SELECT COUNT(*) as count FROM categories").first();
  if (catCount && catCount.count === 0) {
    const now = new Date().toISOString();
    const stmts = SEED_CATEGORIES.map((cat, idx) => 
      db.prepare("INSERT OR IGNORE INTO categories (id, name, created_at) VALUES (?, ?, ?)")
        .bind("cat-" + (idx + 1), cat, now)
    );
    await db.batch(stmts);
  }

  const prodCount = await db.prepare("SELECT COUNT(*) as count FROM products").first();
  if (prodCount && prodCount.count === 0) {
    const now = new Date().toISOString();
    const stmts = SEED_PRODUCTS.map((p) =>
      db.prepare(`
        INSERT OR IGNORE INTO products 
        (id, name, category, aroma, size, usage_notes, price, active, photos, main_photo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        p.id, p.name, p.category, p.aroma, p.size, p.usage_notes,
        p.price, p.active, p.photos, p.main_photo, now
      )
    );
    await db.batch(stmts);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (!url.pathname.startsWith("/api/")) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("Not found", { status: 404 });
    }

    const db = env.DB;
    if (!db) {
      return jsonResponse({ error: "Banco de dados D1 não vinculado (env.DB ausente)." }, 500);
    }

    try {
      await ensureTables(db);
    } catch (e) {
      console.error("Erro ao inicializar schema:", e);
    }

    /* -------------------------------------------------------------
       ROTAS DE AUTENTICAÇÃO
    ------------------------------------------------------------- */
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const password = (body.password || "").trim();

        const user = await db.prepare("SELECT * FROM admin_users WHERE email = ?").bind(email).first();
        let isValid = false;

        if (user) {
          if (user.password === password) isValid = true;
        } else {
          if (password.length >= 6) {
            const now = new Date().toISOString();
            await db.prepare("INSERT INTO admin_users (email, password, created_at) VALUES (?, ?, ?)")
              .bind(email, password, now).run();
            isValid = true;
          }
        }

        if (isValid) {
          const token = "vellumine_admin_" + btoa(email + ":" + Date.now());
          return jsonResponse({
            access_token: token,
            user: { email: email },
            expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
          });
        }

        return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    /* -------------------------------------------------------------
       ROTAS DE PRODUTOS
    ------------------------------------------------------------- */
    if (url.pathname === "/api/products") {
      if (request.method === "GET") {
        try {
          const { results } = await db.prepare("SELECT * FROM products ORDER BY created_at ASC").all();
          const mapped = (results || []).map((row) => ({
            ...row,
            photos: (() => {
              try { return JSON.parse(row.photos); } catch { return []; }
            })(),
            active: Boolean(row.active),
          }));
          return jsonResponse(mapped);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const id = body.id || "p-" + Math.random().toString(36).substring(2, 9);
          const now = new Date().toISOString();
          const photos = JSON.stringify(Array.isArray(body.photos) ? body.photos : []);

          await db.prepare(`
            INSERT INTO products (id, name, category, aroma, size, usage_notes, price, active, photos, main_photo, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            body.name || "",
            body.category || "Outros",
            body.aroma || "",
            body.size || "",
            body.usage_notes || body.usage || "",
            Number(body.price) || 0,
            body.active !== false ? 1 : 0,
            photos,
            Number(body.main_photo || body.mainPhoto) || 0,
            now
          ).run();

          return jsonResponse([{ id, ...body, created_at: now }], 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    if (url.pathname.startsWith("/api/products/")) {
      const id = decodeURIComponent(url.pathname.replace("/api/products/", ""));

      if (request.method === "PATCH") {
        try {
          const body = await request.json();
          const updates = [];
          const values = [];

          if (body.name !== undefined) { updates.push("name = ?"); values.push(body.name); }
          if (body.category !== undefined) { updates.push("category = ?"); values.push(body.category); }
          if (body.aroma !== undefined) { updates.push("aroma = ?"); values.push(body.aroma); }
          if (body.size !== undefined) { updates.push("size = ?"); values.push(body.size); }
          if (body.usage_notes !== undefined || body.usage !== undefined) {
            updates.push("usage_notes = ?");
            values.push(body.usage_notes !== undefined ? body.usage_notes : body.usage);
          }
          if (body.price !== undefined) { updates.push("price = ?"); values.push(Number(body.price)); }
          if (body.active !== undefined) { updates.push("active = ?"); values.push(body.active ? 1 : 0); }
          if (body.photos !== undefined) {
            updates.push("photos = ?");
            values.push(JSON.stringify(Array.isArray(body.photos) ? body.photos : []));
          }
          if (body.main_photo !== undefined || body.mainPhoto !== undefined) {
            updates.push("main_photo = ?");
            values.push(Number(body.main_photo !== undefined ? body.main_photo : body.mainPhoto) || 0);
          }

          if (updates.length > 0) {
            values.push(id);
            await db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();
          }

          return jsonResponse({ success: true, id });
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (request.method === "DELETE") {
        try {
          await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, id });
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    /* -------------------------------------------------------------
       ROTAS DE CATEGORIAS
    ------------------------------------------------------------- */
    if (url.pathname === "/api/categories") {
      if (request.method === "GET") {
        try {
          const { results } = await db.prepare("SELECT * FROM categories ORDER BY created_at ASC").all();
          return jsonResponse(results || []);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const name = (body.name || "").trim();
          if (!name) return jsonResponse({ error: "Nome obrigatório" }, 400);

          const id = "cat-" + Math.random().toString(36).substring(2, 9);
          const now = new Date().toISOString();
          await db.prepare("INSERT OR IGNORE INTO categories (id, name, created_at) VALUES (?, ?, ?)")
            .bind(id, name, now).run();

          return jsonResponse({ id, name, created_at: now }, 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    /* -------------------------------------------------------------
       ROTAS DE RESERVAS
    ------------------------------------------------------------- */
    if (url.pathname === "/api/reservations") {
      if (request.method === "GET") {
        try {
          const { results } = await db.prepare("SELECT * FROM reservations ORDER BY created_at DESC").all();
          const mapped = (results || []).map((row) => ({
            ...row,
            items: (() => {
              try { return JSON.parse(row.items); } catch { return []; }
            })(),
            packages: (() => {
              try { return JSON.parse(row.packages); } catch { return []; }
            })(),
            gift_wrap: Boolean(row.gift_wrap),
          }));
          return jsonResponse(mapped);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (request.method === "POST") {
        try {
          let body = await request.json();
          if (Array.isArray(body)) body = body[0];

          const id = body.id || "res-" + Math.random().toString(36).substring(2, 9);
          const now = body.created_at || new Date().toISOString();
          const itemsJson = JSON.stringify(Array.isArray(body.items) ? body.items : []);
          const packagesJson = JSON.stringify(Array.isArray(body.packages) ? body.packages : []);

          await db.prepare(`
            INSERT INTO reservations (id, customer_name, customer_whatsapp, items, total, gift_wrap, packages, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            body.customer_name || body.name || "",
            body.customer_whatsapp || body.whatsapp || "",
            itemsJson,
            Number(body.total) || 0,
            body.gift_wrap || body.giftWrap ? 1 : 0,
            packagesJson,
            body.status || "pendente",
            body.notes || "",
            now
          ).run();

          return jsonResponse([{ id, ...body, created_at: now }], 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    if (url.pathname.startsWith("/api/reservations/")) {
      const id = decodeURIComponent(url.pathname.replace("/api/reservations/", ""));
      if (request.method === "PATCH") {
        try {
          const body = await request.json();
          if (body.status) {
            await db.prepare("UPDATE reservations SET status = ? WHERE id = ?").bind(body.status, id).run();
          }
          return jsonResponse({ success: true, id });
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    return jsonResponse({ error: "Endpoint não encontrado" }, 404);
  },
};
