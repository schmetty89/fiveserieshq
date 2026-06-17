"use client";

// ArticleSubmitForm.tsx
// Technical article submission form for FiveSeriesHQ.
// - Tier 2 gated (Tier 1 sees an explainer instead)
// - Article type picker drives dynamic, structured fields from articleConfig
// - Structured repeaters + per-step image upload + cover image
// - On submit: uploads images, composes a Markdown body, inserts into
//   tech_articles with verified=false (lands in your existing admin queue)
//
// Suggested location: src/components/technical/ArticleSubmitForm.tsx
//
// INTEGRATION POINTS (search for "ADJUST"):
//  - Supabase browser client import path
//  - Storage bucket name for images (default "article-images")
//  - PDF bucket (default "tech-documents", your existing public bucket)
//  - Redirect target after a successful submit
//  - Tailwind classes are intentionally neutral — restyle to match your forms.

import { useEffect, useMemo, useState } from "react";
// ADJUST: match your project's Supabase browser client helper.
import { createClient } from "@/lib/supabase";
import {
  ARTICLE_CONFIGS,
  ARTICLE_TYPE_ORDER,
  ArticleType,
  FieldDef,
  GENERATIONS,
  Generation,
} from "@/lib/articles/articleConfig";
import { composeArticleBody } from "@/lib/articles/composeArticleBody";

// ADJUST: bucket names if you prefer different ones (see migration.sql).
const IMAGE_BUCKET = "article-images";
const PDF_BUCKET = "tech-documents";

type StepRow = { text: string; image_url?: string };
type RepeaterRow = Record<string, string>;
type DetailValue =
  | string
  | boolean
  | string[]
  | RepeaterRow[]
  | StepRow[]
  | undefined;
type Details = Record<string, DetailValue>;

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-blue-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-200";
const btnGhost =
  "rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800 disabled:opacity-50";

export default function ArticleSubmitForm() {
  const supabase = useMemo(() => createClient(), []);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tier, setTier] = useState<number | null>(null);

  const [articleType, setArticleType] = useState<ArticleType>("maintenance");
  const [title, setTitle] = useState("");
  const [generation, setGeneration] = useState<Generation | "">("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [details, setDetails] = useState<Details>({});

  const [uploads, setUploads] = useState(0); // in-flight uploads
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cfg = ARTICLE_CONFIGS[articleType];

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();
      if (!active) return;
      setTier(profile?.tier ?? 1);
      setLoadingProfile(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  // Reset type-specific details when switching article type.
  function changeType(next: ArticleType) {
    setArticleType(next);
    setDetails({});
    setError(null);
  }

  function setDetail(key: string, value: DetailValue) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  async function uploadToBucket(bucket: string, file: File): Promise<string> {
    if (!userId) throw new Error("Not signed in");
    const ext = file.name.split(".").pop() ?? "bin";
    const safe = Math.random().toString(36).slice(2);
    const path = `${userId}/${Date.now()}-${safe}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleImage(
    file: File | undefined,
    onUrl: (url: string) => void
  ) {
    if (!file) return;
    setUploads((n) => n + 1);
    setError(null);
    try {
      const url = await uploadToBucket(IMAGE_BUCKET, file);
      onUrl(url);
    } catch (e) {
      setError(`Image upload failed: ${(e as Error).message}`);
    } finally {
      setUploads((n) => n - 1);
    }
  }

  async function handlePdf(file: File | undefined, key: string) {
    if (!file) return;
    setUploads((n) => n + 1);
    setError(null);
    try {
      const url = await uploadToBucket(PDF_BUCKET, file);
      setDetail(key, url);
    } catch (e) {
      setError(`PDF upload failed: ${(e as Error).message}`);
    } finally {
      setUploads((n) => n - 1);
    }
  }

  function visible(f: FieldDef): boolean {
    if (!f.showIf) return true;
    return (details[f.showIf.key] as unknown) === f.showIf.equals;
  }

  function validate(): string | null {
    if (!title.trim()) return "Add a title.";
    if (!generation) return "Pick a generation.";
    for (const f of cfg.fields) {
      if (!f.required || !visible(f)) continue;
      const v = details[f.key];
      if (f.type === "stringlist") {
        if (!Array.isArray(v) || !(v as string[]).some((s) => s && s.trim()))
          return `Add at least one: ${f.label}.`;
      } else if (f.type === "repeater") {
        if (!Array.isArray(v) || (v as RepeaterRow[]).length === 0)
          return `Add at least one row: ${f.label}.`;
      } else if (f.type === "steps") {
        if (!Array.isArray(v) || !(v as StepRow[]).some((s) => s.text && s.text.trim()))
          return `Add at least one step: ${f.label}.`;
      } else if (typeof v !== "string" || !v.trim()) {
        return `Fill in: ${f.label}.`;
      }
    }
    return null;
  }

  async function handleSubmit() {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!userId) {
      setError("You need to be signed in.");
      return;
    }
    setSubmitting(true);
    try {
      const body = composeArticleBody(articleType, details, coverImageUrl || null);
      const systemValue = (details[cfg.systemFromKey] as string) ?? null;
      const pdfUrl = (details["pdf"] as string) || null;

      const { error: insErr } = await supabase.from("tech_articles").insert({
        title: title.trim(),
        generation,
        section: articleType, // maintenance | fault-diagnosis | modifications
        system: systemValue,
        content_type: "guide",
        body,
        details, // JSONB
        cover_image_url: coverImageUrl || null,
        file_url: pdfUrl,
        author_id: userId,
        verified: false, // lands in the admin review queue
      });
      if (insErr) throw insErr;
      setSuccess(true);
    } catch (e) {
      setError(`Could not submit: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- gates ----------
  if (loadingProfile) {
    return <p className="text-sm text-neutral-400">Loading…</p>;
  }
  if (!userId) {
    return (
      <p className="text-sm text-neutral-300">
        Please log in to submit a technical article.
      </p>
    );
  }
  if (tier !== 2) {
    return (
      <div className="rounded-lg border border-neutral-700 p-4 text-sm text-neutral-300">
        <p className="font-medium text-neutral-100">Tier 2 members only</p>
        <p className="mt-1">
          Technical article submissions are open to approved Tier 2 members. An
          admin can approve your account from Admin → Members.
        </p>
      </div>
    );
  }
  if (success) {
    return (
      <div className="rounded-lg border border-green-700 bg-green-950/40 p-4 text-sm text-neutral-100">
        <p className="font-medium">Submitted for review</p>
        <p className="mt-1 text-neutral-300">
          Your article is in the moderation queue. An admin will verify it
          before it goes live in the Technical section.
        </p>
        <button
          className={`${btnGhost} mt-3`}
          onClick={() => {
            setSuccess(false);
            setTitle("");
            setGeneration("");
            setCoverImageUrl("");
            setDetails({});
          }}
        >
          Submit another
        </button>
      </div>
    );
  }

  // ---------- field renderer ----------
  function renderField(f: FieldDef) {
    if (!visible(f)) return null;

    switch (f.type) {
      case "text":
        return (
          <input
            className={inputClass}
            placeholder={f.placeholder}
            value={(details[f.key] as string) ?? ""}
            onChange={(e) => setDetail(f.key, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            className={`${inputClass} min-h-[96px]`}
            placeholder={f.placeholder}
            value={(details[f.key] as string) ?? ""}
            onChange={(e) => setDetail(f.key, e.target.value)}
          />
        );

      case "select":
        return (
          <select
            className={inputClass}
            value={(details[f.key] as string) ?? ""}
            onChange={(e) => setDetail(f.key, e.target.value)}
          >
            <option value="">Select…</option>
            {f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );

      case "toggle":
        return (
          <label className="inline-flex items-center gap-2 text-sm text-neutral-200">
            <input
              type="checkbox"
              checked={Boolean(details[f.key])}
              onChange={(e) => setDetail(f.key, e.target.checked)}
            />
            Yes
          </label>
        );

      case "multiselect": {
        const selected = (details[f.key] as string[]) ?? [];
        return (
          <div className="flex flex-wrap gap-2">
            {f.options?.map((o) => {
              const on = selected.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() =>
                    setDetail(
                      f.key,
                      on ? selected.filter((x) => x !== o) : [...selected, o]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs ${
                    on
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        );
      }

      case "stringlist": {
        const items = (details[f.key] as string[]) ?? [""];
        const list = items.length ? items : [""];
        const update = (next: string[]) =>
          setDetail(f.key, next.filter((s, i) => s.trim() || i === next.length - 1));
        return (
          <div className="space-y-2">
            {list.map((val, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder={f.placeholder}
                  value={val}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = e.target.value;
                    setDetail(f.key, next);
                  }}
                />
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => update(list.filter((_, idx) => idx !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className={btnGhost}
              onClick={() => setDetail(f.key, [...list, ""])}
            >
              + Add
            </button>
          </div>
        );
      }

      case "repeater": {
        const rows = (details[f.key] as RepeaterRow[]) ?? [];
        const cols = f.columns ?? [];
        const blank = () =>
          Object.fromEntries(cols.map((c) => [c.key, ""])) as RepeaterRow;
        const current = rows.length ? rows : [blank()];
        return (
          <div className="space-y-2">
            {current.map((row, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {cols.map((c) => (
                  <input
                    key={c.key}
                    className={`${inputClass} flex-1 min-w-[120px]`}
                    placeholder={c.label + (c.required ? " *" : "")}
                    value={row[c.key] ?? ""}
                    onChange={(e) => {
                      const next = current.map((r, idx) =>
                        idx === i ? { ...r, [c.key]: e.target.value } : r
                      );
                      setDetail(f.key, next);
                    }}
                  />
                ))}
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() =>
                    setDetail(
                      f.key,
                      current.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className={btnGhost}
              onClick={() => setDetail(f.key, [...current, blank()])}
            >
              + Add row
            </button>
          </div>
        );
      }

      case "steps": {
        const steps = (details[f.key] as StepRow[]) ?? [];
        const current = steps.length ? steps : [{ text: "" }];
        const setSteps = (next: StepRow[]) => setDetail(f.key, next);
        return (
          <div className="space-y-3">
            {current.map((step, i) => (
              <div key={i} className="rounded-md border border-neutral-800 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">
                    Step {i + 1}
                  </span>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setSteps(current.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  placeholder="Describe this step"
                  value={step.text}
                  onChange={(e) =>
                    setSteps(
                      current.map((s, idx) =>
                        idx === i ? { ...s, text: e.target.value } : s
                      )
                    )
                  }
                />
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="text-xs text-neutral-400"
                    onChange={(e) =>
                      handleImage(e.target.files?.[0], (url) =>
                        setSteps(
                          current.map((s, idx) =>
                            idx === i ? { ...s, image_url: url } : s
                          )
                        )
                      )
                    }
                  />
                  {step.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.image_url}
                      alt={`Step ${i + 1}`}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className={btnGhost}
              onClick={() => setSteps([...current, { text: "" }])}
            >
              + Add step
            </button>
          </div>
        );
      }

      case "file":
        return (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              className="text-xs text-neutral-400"
              onChange={(e) => handlePdf(e.target.files?.[0], f.key)}
            />
            {details[f.key] && (
              <span className="text-xs text-green-400">PDF attached ✓</span>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Article type */}
      <div className="flex flex-wrap gap-2">
        {ARTICLE_TYPE_ORDER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => changeType(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              articleType === t
                ? "bg-blue-600 text-white"
                : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {ARTICLE_CONFIGS[t].label}
          </button>
        ))}
      </div>

      {/* Shared fields */}
      <div className="space-y-1">
        <label className={labelClass}>Title *</label>
        <input
          className={inputClass}
          placeholder="e.g. M62TU cooling system overhaul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Generation *</label>
        <select
          className={inputClass}
          value={generation}
          onChange={(e) => setGeneration(e.target.value as Generation)}
        >
          <option value="">Select…</option>
          {GENERATIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Cover image</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            className="text-xs text-neutral-400"
            onChange={(e) => handleImage(e.target.files?.[0], setCoverImageUrl)}
          />
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt="Cover"
              className="h-12 w-20 rounded object-cover"
            />
          )}
        </div>
      </div>

      {/* Type-specific fields */}
      {cfg.fields.map((f) => (
        <div key={f.key} className="space-y-1">
          <label className={labelClass}>
            {f.label}
            {f.required ? " *" : ""}
          </label>
          {f.help && <p className="text-xs text-neutral-500">{f.help}</p>}
          {renderField(f)}
        </div>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || uploads > 0}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {uploads > 0
          ? "Uploading images…"
          : submitting
          ? "Submitting…"
          : "Submit for review"}
      </button>
    </div>
  );
}

