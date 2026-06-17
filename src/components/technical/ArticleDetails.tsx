// ArticleDetails.tsx
// Renders an article's structured `details` as rich JSX (tables, ordered steps
// with images, chips) instead of the auto-composed Markdown body. Driven by the
// same articleConfig, so it stays in sync with field edits.
//
// Use this on the public article page when you want nicer rendering than the
// Markdown body. The body remains a fine fallback for older rows without details.
//
// Suggested location: src/components/technical/ArticleDetails.tsx

import {
  ARTICLE_CONFIGS,
  ArticleType,
  FieldDef,
  RepeaterColumn,
} from "@/lib/articles/articleConfig";

type StepRow = { text?: string; image_url?: string };
type Details = Record<string, unknown>;

type Props = {
  type: ArticleType;
  title: string;
  details: Details | null | undefined;
  coverImageUrl?: string | null;
};

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmpty);
  if (typeof v === "object") return Object.values(v as object).every(isEmpty);
  return false;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-neutral-800 py-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </h2>
      <div className="text-neutral-200">{children}</div>
    </section>
  );
}

function RepeaterTable({
  cols,
  rows,
}: {
  cols: RepeaterColumn[];
  rows: Record<string, string>[];
}) {
  const filled = rows.filter((r) => !isEmpty(r));
  if (filled.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-neutral-400">
          {cols.map((c) => (
            <th key={c.key} className="pb-2 pr-4 font-medium">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filled.map((r, i) => (
          <tr key={i} className="border-t border-neutral-800">
            {cols.map((c) => (
              <td key={c.key} className="py-2 pr-4">
                {(r[c.key] ?? "").toString().trim() || "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ArticleDetails({ type, title, details, coverImageUrl }: Props) {
  const cfg = ARTICLE_CONFIGS[type];
  const d: Details = details ?? {};

  return (
    <article className="mx-auto max-w-3xl">
      {coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImageUrl}
          alt={title}
          className="mb-6 w-full rounded-lg object-cover"
        />
      )}
      <h1 className="text-2xl font-semibold text-neutral-100">{title}</h1>
      <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
        {cfg.label}
      </p>

      {cfg.fields.map((f: FieldDef) => {
        if (f.showIf && (d[f.showIf.key] as unknown) !== f.showIf.equals) return null;
        const v = d[f.key];

        if (f.type === "toggle") {
          return (
            <Section key={f.key} label={f.label}>
              {v ? "Yes" : "No"}
            </Section>
          );
        }
        if (isEmpty(v)) return null;

        switch (f.type) {
          case "stringlist":
            return (
              <Section key={f.key} label={f.label}>
                <ul className="list-disc space-y-1 pl-5">
                  {(v as string[])
                    .filter((s) => s && s.trim())
                    .map((s, i) => (
                      <li key={i}>{s.trim()}</li>
                    ))}
                </ul>
              </Section>
            );
          case "multiselect":
            return (
              <Section key={f.key} label={f.label}>
                <div className="flex flex-wrap gap-2">
                  {(v as string[]).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            );
          case "repeater":
            return (
              <Section key={f.key} label={f.label}>
                <RepeaterTable cols={f.columns ?? []} rows={v as Record<string, string>[]} />
              </Section>
            );
          case "steps": {
            const steps = (v as StepRow[]).filter((s) => s && s.text && s.text.trim());
            if (steps.length === 0) return null;
            return (
              <Section key={f.key} label={f.label}>
                <ol className="space-y-4">
                  {steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-300">
                        {i + 1}
                      </span>
                      <div className="space-y-2">
                        <p>{s.text!.trim()}</p>
                        {s.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.image_url}
                            alt={`Step ${i + 1}`}
                            className="max-h-80 rounded-md object-cover"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            );
          }
          case "file":
            return (
              <Section key={f.key} label={f.label}>
                <a className="text-blue-400 underline" href={v as string} target="_blank" rel="noreferrer">
                  Download PDF
                </a>
              </Section>
            );
          default:
            return (
              <Section key={f.key} label={f.label}>
                <p className="whitespace-pre-line">{(v as string).toString().trim()}</p>
              </Section>
            );
        }
      })}
    </article>
  );
}

