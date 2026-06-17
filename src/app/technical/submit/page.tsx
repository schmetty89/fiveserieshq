// app/technical/submit/page.tsx
// Route that mounts the technical article submission form.
// The form itself handles auth + Tier 2 gating, so this page can stay thin.
//
// ADJUST:
//  - import path for ArticleSubmitForm to match where you placed it
//  - wrapper classes / layout to match your Technical section pages
//  - (optional) add a server-side login redirect — see note at bottom

import type { Metadata } from "next";
import ArticleSubmitForm from "@/components/technical/ArticleSubmitForm";

export const metadata: Metadata = {
  title: "Submit a Technical Article | FiveSeriesHQ",
  description:
    "Share a maintenance guide, fault diagnosis, or modification writeup with the BMW 5 Series community.",
};

export default function SubmitArticlePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Technical
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
          Submit a technical article
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Maintenance guides, fault diagnosis, and modifications &amp; retrofits.
          Every submission is reviewed by an admin before it goes live.
        </p>
      </header>

      <ArticleSubmitForm />
    </main>
  );
}

// Optional hard gate (recommended): redirect logged-out users before render.
// Requires your server-side Supabase helper. Example:
//
//   import { redirect } from "next/navigation";
//   import { createClient } from "@/lib/supabase/server";
//
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/login?next=/technical/submit");
//
// The form already shows a friendly login/Tier-2 message without this, so it's
// purely a UX nicety.

