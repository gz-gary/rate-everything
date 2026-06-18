/// <reference types="@cloudflare/workers-types" />

// ---------- Types ----------

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

import type { Rating, CreateRatingInput, UpdateRatingInput } from './types';
export type { Rating, CreateRatingInput, UpdateRatingInput };

// ---------- Response helpers ----------

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ---------- Route matching ----------

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: (params: Record<string, string>, request: Request, env: Env) => Promise<Response>;
}

function route(
  method: string,
  path: string,
  handler: Route['handler'],
): Route {
  const paramNames: string[] = [];
  const regexStr = path.replace(/:([a-zA-Z_]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  return { method, pattern: new RegExp(`^${regexStr}$`), paramNames, handler };
}

// ---------- Request validation ----------

function validateCreate(input: unknown): input is CreateRatingInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  return (
    typeof obj.item === 'string' &&
    obj.item.length > 0 &&
    typeof obj.rating === 'number' &&
    Number.isInteger(obj.rating) &&
    obj.rating >= 1 &&
    obj.rating <= 5
  );
}

function validateUpdate(input: unknown): input is UpdateRatingInput {
  if (typeof input !== 'object' || input === null) return false;
  const obj = input as Record<string, unknown>;
  if (obj.rating !== undefined) {
    if (typeof obj.rating !== 'number' || !Number.isInteger(obj.rating) || obj.rating < 1 || obj.rating > 5) {
      return false;
    }
  }
  if (obj.comment !== undefined && obj.comment !== null && typeof obj.comment !== 'string') {
    return false;
  }
  return obj.rating !== undefined || obj.comment !== undefined;
}

// ---------- API routes ----------

const routes: Route[] = [
  // GET /api/ratings — list all
  route('GET', '/api/ratings', async (_params, _req, env) => {
    const { results } = await env.DB
      .prepare('SELECT * FROM ratings ORDER BY created_at DESC')
      .all<Rating>();
    return json(results);
  }),

  // GET /api/ratings/:id — get one
  route('GET', '/api/ratings/:id', async (params, _req, env) => {
    const rating = await env.DB
      .prepare('SELECT * FROM ratings WHERE id = ?')
      .bind(Number(params.id))
      .first<Rating>();
    if (!rating) return json({ error: 'Not found' }, 404);
    return json(rating);
  }),

  // POST /api/ratings — create
  route('POST', '/api/ratings', async (_params, req, env) => {
    const raw: unknown = await req.json();
    if (!validateCreate(raw)) {
      return json({ error: 'Invalid input. item (string) and rating (1-5 integer) are required.' }, 400);
    }
    const { item, category, rating, comment } = raw;
    const result = await env.DB
      .prepare(
        'INSERT INTO ratings (item, category, rating, comment) VALUES (?, ?, ?, ?)',
      )
      .bind(item, category ?? '', rating, comment ?? null)
      .run();
    return json({ id: result.meta.last_row_id }, 201);
  }),

  // PUT /api/ratings/:id — update
  route('PUT', '/api/ratings/:id', async (params, req, env) => {
    const raw: unknown = await req.json();
    if (!validateUpdate(raw)) {
      return json({ error: 'Invalid input. Provide rating (1-5) and/or comment.' }, 400);
    }
    const { rating, comment } = raw;
    const sets: string[] = [];
    const binds: (string | number | null)[] = [];
    if (rating !== undefined) {
      sets.push('rating = ?');
      binds.push(rating);
    }
    if (comment !== undefined) {
      sets.push('comment = ?');
      binds.push(comment);
    }
    binds.push(Number(params.id));
    await env.DB
      .prepare(`UPDATE ratings SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...binds)
      .run();
    return json({ success: true });
  }),

  // DELETE /api/ratings/:id — delete
  route('DELETE', '/api/ratings/:id', async (params, _req, env) => {
    await env.DB
      .prepare('DELETE FROM ratings WHERE id = ?')
      .bind(Number(params.id))
      .run();
    return json({ success: true });
  }),
];

// ---------- Schema auto-init ----------

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS ratings (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    item      TEXT    NOT NULL,
    category  TEXT    NOT NULL DEFAULT '',
    rating    INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment   TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`;

let schemaReady = false;

async function ensureSchema(env: Env) {
  if (schemaReady) return;
  await env.DB.prepare(SCHEMA_SQL).run();
  schemaReady = true;
}

// ---------- Worker entry ----------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    await ensureSchema(env);

    const url = new URL(request.url);

    // ── API routes under /api/ ──
    if (url.pathname.startsWith('/api/')) {
      for (const r of routes) {
        if (request.method !== r.method) continue;
        const match = url.pathname.match(r.pattern);
        if (!match) continue;
        const params: Record<string, string> = {};
        r.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        try {
          return await r.handler(params, request, env);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return json({ error: message }, 500);
        }
      }
      return json({ error: 'Not found' }, 404);
    }

    // ── Static assets / SPA ──
    // ASSETS 在生产环境自动注入；本地 dev 下 wrangler 直接托管静态文件，请求不会走到这里
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);

      if (response.status === 404) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
      }

      return response;
    }

    return json({ error: 'Not found' }, 404);
  },
};
