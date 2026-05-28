# Supabase setup for CourseMap AI

Course maps, user accounts, and subscription access are stored in **Supabase Postgres**. Your app talks to Supabase from the server using the **service role** key (never expose it in the browser).

## 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project** → pick a name, database password, and region (choose one close to your users / Vercel region).
3. Wait until the project finishes provisioning.

## 2. Run the database schema

1. In the dashboard: **SQL** → **New query**.
2. Open `supabase/migrations/001_initial_schema.sql` in this repo, copy the full file, paste into the SQL editor, and **Run**.
3. Confirm under **Table Editor** you see: `users`, `user_access`, `course_maps`.

## 3. Add API keys to `.env.local`

**Project Settings** → **API**:

| Variable | Where to copy |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (secret) |

Add to `.env.local` (and later **Vercel → Settings → Environment Variables**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Keep existing vars (`OPENAI_*`, `AUTH_SECRET`, Stripe, etc.).

Restart the dev server after saving.

## 4. (Optional) Import existing `.data/` files

If you already generated maps locally under `.data/`:

```bash
node scripts/import-data-to-supabase.mjs
```

Requires Supabase env vars in `.env.local`. Safe to run more than once (upserts users/access, inserts maps).

## 5. Verify

```bash
npm run dev
```

Sign up, generate a map, and check **Table Editor** in Supabase — rows should appear in `users`, `course_maps`, and `user_access`.

For API tests (with dev server running):

```powershell
$env:E2E_BASE_URL="http://localhost:3001"
npm run test:e2e
```

## Vercel deploy

Add the same Supabase variables to Vercel for **Production** (and Preview if you use it). Redeploy after saving.

## Security notes

- **Never** commit `SUPABASE_SERVICE_ROLE_KEY` or put it in client-side code.
- `NEXT_PUBLIC_SUPABASE_URL` is fine to be public; RLS is enabled with no public policies, so anon access cannot read tables without policies.
- All app DB access goes through Next.js API routes using the service role on the server.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Supabase is not configured` | Add both env vars and restart `npm run dev` |
| `relation "users" does not exist` | Run `001_initial_schema.sql` in SQL Editor |
| Sign up fails with DB error | Check Supabase logs; confirm schema ran successfully |
| Maps empty after deploy | Import script or create new maps; old `.data/` on Vercel is not used |
