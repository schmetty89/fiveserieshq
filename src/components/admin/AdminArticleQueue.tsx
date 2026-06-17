"use client";

// AdminArticleQueue.tsx
// Admin/moderator review queue for technical article submissions.
// Mirrors your videos/vendors moderation pattern, but on tech_articles'
// verified / rejected / rejection_reason columns.
//
// Suggested location: src/components/admin/AdminArticleQueue.tsx
// Mount it in your Admin → Technical area (e.g. a "Articles" tab).
//
// Relies on the existing "Admins can update tech articles" RLS policy
// (admin/moderator) for approve/reject, and the SELECT policy for reading
// pending rows via the admin's own session.
//
// ADJUST: Supabase browser client import path.

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { ARTICLE_CONFIGS, ArticleType } from "@/lib/articles/articleConfig";

type Article = {
  id: string;
  title: string;
  generation: string;
  section: ArticleType;
  system: string | null;
  created_at: string;
  rejection_reason: string | null;
  author: { username: string | null } | null;
};

const btn =
  "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50";

export default function AdminArticleQueue() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"pending" | "rejected">("pending");
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    let q = supabase
      .from("tech_articles")
      .select(
        "id,title,generation,section,system,created_at,rejection_reason,author:profiles!tech_articles_author_id_fkey(username)"
      )
      .order("created_at", { ascending: true });
    q = tab === "pending" ? q.eq("verified", false).eq("rejected", false) : q.eq("rejected", true);
    const { data, error: e } = await q;
    if (e) setError(e.message);
    setItems((data as unknown as Article[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function approve(id: string) {
    setBusyId(id);
    setError(null);
    const { error: e } = await supabase
      .from("tech_articles")
      .update({ verified: true, rejected: false, rejection_reason: null })
      .eq("id", id);
    if (e) setError(e.message);
    setBusyId(null);
    load();
  }

  async function reject(id: string) {
    if (!reason.trim()) {
      setError("Add a rejection reason so the author knows what to fix.");
      return;
    }
    setBusyId(id);
    setError(null);
    const { error: e } = await supabase
      .from("tech_articles")
      .update({ rejected: true, verified: false, rejection_reason: reason.trim() })
      .eq("id", id);
    if (e) setError(e.message);
    setRejectingId(null);
    setReason("");
    setBusyId(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${btn} ${
              tab === t
                ? "bg-blue-600 text-white"
                : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {t === "pending" ? "Pending review" : "Rejected"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && <p className="text-sm text-neutral-400">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-neutral-400">
          {tab === "pending" ? "Nothing waiting for review." : "No rejected articles."}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg border border-neutral-800 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-neutral-100">{a.title}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {ARTICLE_CONFIGS[a.section]?.label ?? a.section} · {a.generation}
                  {a.system ? ` · ${a.system}` : ""} ·{" "}
                  {a.author?.username ?? "unknown"} ·{" "}
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
                {tab === "rejected" && a.rejection_reason && (
                  <p className="mt-1 text-xs text-red-300">
                    Reason: {a.rejection_reason}
                  </p>
                )}
              </div>

              {tab === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approve(a.id)}
                    disabled={busyId === a.id}
                    className={`${btn} bg-green-700 text-white hover:bg-green-600`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(rejectingId === a.id ? null : a.id);
                      setReason("");
                      setError(null);
                    }}
                    disabled={busyId === a.id}
                    className={`${btn} border border-neutral-700 text-neutral-200 hover:bg-neutral-800`}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {rejectingId === a.id && (
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
                  placeholder="Reason for rejection (shown to the author)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button
                  onClick={() => reject(a.id)}
                  disabled={busyId === a.id}
                  className={`${btn} bg-red-700 text-white hover:bg-red-600`}
                >
                  Confirm
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

