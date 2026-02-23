import { getTranslations } from "next-intl/server";
import {
  LayoutDashboard,
  MapPin,
  Users,
} from "lucide-react";

import SignInForm from "@/components/sign-in-form";

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: app overview & dashboards */}
      <aside className="relative flex flex-col justify-center px-10 py-12 lg:px-14 lg:py-16 bg-muted/50 border-r border-border/80">
        <div className="mx-auto w-full max-w-md space-y-10">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Mulu ERP
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("heroTitle")}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {t("whatYouGet")}
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-4 rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-foreground">
                    {t("dashboardAdmin")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboardAdminDesc")}
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-foreground">
                    {t("dashboardPastor")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboardPastorDesc")}
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium text-foreground">
                    {t("dashboardMyMinistry")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboardMyMinistryDesc")}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Right: sign-in form */}
      <main className="flex flex-col items-center justify-center px-6 py-12 lg:px-12 lg:py-16 bg-background">
        <div className="w-full max-w-sm">
          <SignInForm />
        </div>
      </main>
    </div>
  );
}
