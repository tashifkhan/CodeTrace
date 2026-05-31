# Running the Stats APIs locally + wiring the demo

This demo aggregates six independent stats services (in `../Stat APIs/`). Each
exposes the unified `GET /{username}/card` endpoint the demo consumes. This doc
covers how to install, run, and port-configure each backend, and how to point
this frontend at them.

## The six services at a glance

All six are managed with [**uv**](https://docs.astral.sh/uv/) (`pyproject.toml` +
`uv.lock`). `requirements.txt` is kept as a generated export of the lock for the
`@vercel/python` deploys — regenerate it after any dependency change with
`uv export --no-hashes --no-dev --no-emit-project -o requirements.txt`.

All six are **FastAPI** (ASGI) apps.

| Platform   | Dir (`../Stat APIs/`) | ASGI/app module | Built-in default port | Required env |
| ---------- | --------------------- | --------------- | --------------------- | ------------ |
| GitHub     | `GitHub`              | `main:app`      | `8989` (`PORT` env)   | **`GITHUB_TOKEN`** |
| LeetCode   | `LeetCode`            | `app:app`       | `58352` (`PORT` env)  | – |
| Codeforces | `CodeForces`          | `app:app`       | `8000`¹               | – |
| GFG        | `GFG`                 | `app:app`       | `58353`               | – |
| CodeChef   | `CodeChef`            | `main:app`      | `8000`²               | – |
| HackerRank | `HackerRank`          | `main:app`      | `58352`               | – |

¹ Codeforces `python app.py` serves `8000` in production mode (`58353` only when
`Config.ENV == "development"`). ² CodeChef has no `__main__`, so `python main.py`
does nothing — it must be started with uvicorn.

> The built-in ports collide (LeetCode & HackerRank both `58352`; Codeforces &
> GFG both `58353`). **Don't rely on the defaults** — assign explicit ports as
> below.

## One-time setup

`uv sync` creates the `.venv` and installs the locked dependencies for any repo:

```bash
cd "../Stat APIs/<Repo>"   # any of the six
uv sync
```

GitHub also needs a token — create `../Stat APIs/GitHub/.env`:

```
GITHUB_TOKEN=ghp_your_personal_access_token
```

## Configuring ports — the uniform way

Every service is FastAPI, so launch each with `uv run uvicorn <module>:app --port`
(this bypasses the inconsistent built-in port logic).

Recommended local port map (collision-free): **8001–8006**.

```bash
# GitHub  →  8001   (needs GITHUB_TOKEN in .env)
cd "../Stat APIs/GitHub"      && uv run python -m uvicorn main:app --reload --port 8001

# LeetCode → 8002
cd "../Stat APIs/LeetCode"    && uv run python -m uvicorn app:app --reload --port 8002

# Codeforces → 8003
cd "../Stat APIs/CodeForces"  && uv run python -m uvicorn app:app --reload --port 8003

# GFG → 8004
cd "../Stat APIs/GFG"         && uv run python -m uvicorn app:app --reload --port 8004

# CodeChef → 8005
cd "../Stat APIs/CodeChef"    && uv run python -m uvicorn main:app --reload --port 8005

# HackerRank → 8006
cd "../Stat APIs/HackerRank"  && uv run python -m uvicorn main:app --reload --port 8006
```

Each command runs one service in the foreground; open six terminals, or append
`&` to background them. `--host 0.0.0.0` if you need LAN access.

Verify any one is serving the unified card:

```bash
curl -s http://localhost:8002/neal_wu/card | python -m json.tool | head
# → envelope: { status, message, platform, username, cached, data: { ...UnifiedCard } }
```

## Environment variables reference

| Service    | Var | Purpose | Default |
| ---------- | --- | ------- | ------- |
| GitHub     | `GITHUB_TOKEN` | **required** — GitHub API auth | – |
| GitHub     | `PORT`, `HOST` | `python main.py` bind | `8989`, `0.0.0.0` |
| LeetCode   | `PORT`, `HOST` | `python app.py` bind | `58352`, `0.0.0.0` |
| CodeChef   | `CODECHEF_*` | pydantic-settings overrides, e.g. `CODECHEF_REQUEST_TIMEOUT`, `CODECHEF_RATE_LIMIT_REQUESTS`, `CODECHEF_CACHE_TTL_SECONDS` | see `core/config.py` |

All other services need no env vars. Port for the FastAPI ones is controlled by
the uvicorn `--port` flag, not an env var.

## Wiring this demo to local backends

The demo's card base URLs are env-overridable (see `src/api/cards.ts`). Create
`.env.local` in this project (Vite auto-loads it; `VITE_`-prefixed only):

```dotenv
# .env.local  — point the unified /card calls at local backends
VITE_GITHUB_API=http://localhost:8001
VITE_LEETCODE_API=http://localhost:8002
VITE_CODEFORCES_API=http://localhost:8003
VITE_GFG_API=http://localhost:8004
VITE_CODECHEF_API=http://localhost:8005
VITE_HACKERRANK_API=http://localhost:8006
```

Then:

```bash
npm install
npm run dev          # http://localhost:5173
```

The aggregated **Profile** page (`/profile?leetcode=...&github=...`) calls one
`/card` per platform through these bases.

### Note on the per-platform detail pages

The legacy per-platform fetchers (`src/api/codeforces.ts`, `src/api/codechef.ts`)
hit the dev proxy paths `/api/codeforces` and `/api/codechef` defined in
`vite.config.ts`. To run the **detail** pages against local backends too, point
those proxy targets at your local ports:

```ts
// vite.config.ts → server.proxy
'/api/codeforces': { target: 'http://localhost:8003', changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/codeforces/, '') },
'/api/codechef':   { target: 'http://localhost:8005', changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/codechef/, '') },
```

The other detail pages (GitHub, LeetCode, GFG, HackerRank) call their hosted
domains directly in `src/api/*.ts`; without redeploying, only the unified
`/card` flow (Profile page) follows the `VITE_*_API` overrides.

## CORS

Every backend enables permissive CORS (`allow_origins=["*"]`), so the browser can
call them directly from `localhost:5173` — the `/api/*` proxy entries exist only
for the two services historically fronted that way and to keep dev origins tidy.
