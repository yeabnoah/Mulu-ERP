import { getTranslations } from "next-intl/server";
import { LayoutDashboard, MapPin, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tLogin = await getTranslations("login");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-semibold text-foreground hover:text-foreground/90"
          >
            Mulu ERP
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "default" })
            )}
          >
            {t("ctaSignIn")}
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/80 bg-muted/30 px-4 py-16 sm:px-6 sm:py-24">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="mt-10">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "text-sm"
                )}
              >
                {t("ctaSignIn")}
              </Link>
            </div>
          </div>
        </section>

        {/* What this platform offers */}
        <section className="px-4 py-16 sm:px-6 sm:py-24">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("whatWeOffer")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              {tLogin("heroSubtitle")}
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <li className="flex flex-col rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {tLogin("dashboardAdmin")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tLogin("dashboardAdminDesc")}
                </p>
              </li>
              <li className="flex flex-col rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {tLogin("dashboardPastor")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tLogin("dashboardPastorDesc")}
                </p>
              </li>
              <li className="flex flex-col rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {tLogin("dashboardMyMinistry")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tLogin("dashboardMyMinistryDesc")}
                </p>
              </li>
            </ul>
            <div className="mt-12 text-center">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-sm"
                )}
              >
                {t("ctaSignIn")}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/80 bg-muted/20 px-4 py-8 sm:px-6">
          <div className="container mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm"
              )}
            >
              {t("ctaSignIn")}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
