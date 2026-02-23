# Localization (i18n)

This app uses [next-intl](https://next-intl.dev) with locale-based routing.

Locale detection and redirects run in `src/proxy.ts` (Next.js 16 uses the proxy file instead of `middleware.ts`).

## Supported locales

- **en** – English (default)
- **am** – Amharic (አማርኛ)

URLs: `/` and `/dashboard` use English; `/am` and `/am/dashboard` use Amharic.

## Adding translations

1. Edit `messages/en.json` and `messages/am.json` (or add a new file for another locale).
2. Use nested keys by feature, e.g. `"nav": { "dashboard": "Dashboard" }`.

## Using translations in components

**Client components** – use the `useTranslations` hook:

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("nav");
  return <span>{t("dashboard")}</span>;
}
```

**Server components (async)** – use `getTranslations`:

```tsx
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("dashboard");
  return <h1>{t("title")}</h1>;
}
```

## Navigation

Use the locale-aware APIs from `@/i18n/navigation` so links and redirects keep the current locale:

- `Link` – use instead of `next/link`
- `useRouter`, `usePathname` – use instead of `next/navigation`
- `redirect` – use for server redirects

## Adding a new locale

1. Add the locale to `src/i18n/routing.ts` in the `locales` array.
2. Add `messages/<locale>.json` with the same key structure as `en.json`.
