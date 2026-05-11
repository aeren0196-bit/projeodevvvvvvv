# Promake React Template

This template is the runtime target for `@promakeai/cli`. It includes a
multi-language, schema-driven database setup powered by `@promakeai/dbreact`.

## What You Get

- Vite + React + TypeScript
- Module-based architecture (`src/modules`)
- Built-in DB layer via `@/db` (dbreact hooks + schema)
- Multi-language content with translation fallback

## Database Layout

- Schema: `src/db/schema.json`
- Types: `src/db/types.ts`
- Provider: `src/db/provider.tsx`
- DB file: `public/data/database.db`

The app wraps your UI with `AppDbProvider` in `src/App.tsx` and syncs DB language
with i18n.

## Regenerate Database

```bash
# From schema.json
dbcli generate --schema ./src/db/schema.json \
  --database ./public/data/database.db \
  --output ./src/db
```

Or run the helper:

```bash
bun run init-db
```

## Using the DB in Modules

```tsx
import { useDbList } from "@/db";
import type { DbProduct } from "@/db";

const { data: products } = useDbList<DbProduct>("products", {
  where: { price: { $gt: 50 } },
  limit: 12,
});
```

## Language Behavior

- `defaultLanguage` is defined in `schema.json`.
- `DbProvider` uses `lang` + `fallbackLang` for translation resolution.
- Changing i18n language triggers refetch of db queries.
