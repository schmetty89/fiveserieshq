// composeArticleBody.ts
// Turns the structured `details` object into a Markdown `body` string so your
// existing article display keeps rendering with zero changes. The structured
// data is still preserved verbatim in the `details` JSONB column.
// Suggested location: src/lib/articles/composeArticleBody.ts

import { ARTICLE_CONFIGS, ArticleType, RepeaterColumn } from "./articleConfig";

type Details = Record<string, unknown>;
type StepRow = { text?: string; image_url?: string };

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEmpty);
  if (typeof v === "object") return Object.values(v as object).every(isEmpty);
  return false;
}

function repeaterTable(cols: RepeaterColumn[], rows: Record<string, string>[]): string {
  const filled = rows.filter((r) => !isEmpty(r));
  if (filled.length === 0) return "";
  const header = `| ${cols.map((c) => c.label).join(" | ")} |`;
  const sep = `| ${cols.map(() => "---").join(" | ")} |`;
  const body = filled
    .map(
      (r) =>
        `| ${cols
          .map((c) => (r[c.key] ?? "").toString().trim() || "—")
          .join(" | ")} |`
    )
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

/**
 * @param type   the article type
 * @param details structured field values keyed by FieldDef.key
 * @param coverImageUrl optional cover image prepended to the article
 */
export function composeArticleBody(
  type: ArticleType,
  details: Details,
  coverImageUrl?: string | null
): string {
  const cfg = ARTICLE_CONFIGS[type];
  const out: string[] = [];

  if (coverImageUrl) out.push(`![Cover image](${coverImageUrl})`);

  for (const f of cfg.fields) {
    // Respect conditional visibility (e.g. coding fields only when coding required)
    if (f.showIf && (details[f.showIf.key] as unknown) !== f.showIf.equals) continue;

    const v = details[f.key];

    if (f.type === "toggle") {
      out.push(`### ${f.label}\n${v ? "Yes" : "No"}`);
      continue;
    }

    if (isEmpty(v)) continue;

    switch (f.type) {
      case "stringlist": {
        const items = (v as string[]).filter((s) => s && s.trim());
        out.push(`### ${f.label}\n${items.map((s) => `- ${s.trim()}`).join("\n")}`);
        break;
      }
      case "multiselect": {
        out.push(`### ${f.label}\n${(v as string[]).join(", ")}`);
        break;
      }
      case "repeater": {
        const table = repeaterTable(f.columns ?? [], v as Record<string, string>[]);
        if (table) out.push(`### ${f.label}\n${table}`);
        break;
      }
      case "steps": {
        const steps = (v as StepRow[]).filter((s) => s && s.text && s.text.trim());
        if (steps.length === 0) break;
        const lines = steps.map((s, i) => {
          let line = `${i + 1}. ${s.text!.trim()}`;
          if (s.image_url) line += `\n\n   ![Step ${i + 1}](${s.image_url})`;
          return line;
        });
        out.push(`### ${f.label}\n${lines.join("\n")}`);
        break;
      }
      case "file": {
        out.push(`### ${f.label}\n[Download PDF](${v as string})`);
        break;
      }
      default: {
        // text, textarea, select
        out.push(`### ${f.label}\n${(v as string).toString().trim()}`);
      }
    }
  }

  return out.join("\n\n");
}

