"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="flex gap-1 rounded-md border p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={
            "rounded px-2 py-1 text-xs font-medium transition-colors " +
            (locale === loc
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted")
          }
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
