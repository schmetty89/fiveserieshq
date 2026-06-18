# FiveSeriesHQ — Lean structured fields for the article submit form

Read `CLAUDE.md` first. This is a small, **surgical** change. Work on a new branch off
`main`. Edit only what's listed below — **do not rewrite files or change any unrelated
behavior.** We can't build locally (the "My Drive" path with spaces breaks npm), so the
gate is the **Vercel preview build**: push the branch and I'll test the preview, then I'll
merge. Do **not** merge to main yourself.

## Goal
Replace the single freeform "Guide content" textarea in `TechSubmitModal` with structured,
per-section fields (maintenance / performance / diagnosis). On submit, compose those fields
into the existing `body` text that `submitTechArticle` already accepts. Nothing else
changes — same section buttons, system dropdowns, content-type toggle, documents flow, PDF
flow, admin review, and article display. The `body` column and how articles render stay
exactly as they are; the body just becomes nicely organized text.

## Real values — do NOT change these
- Section values are `maintenance` | `performance` | `diagnosis` (plus `documents`, handled
  separately). Don't rename or add section values.
- Supabase client import is `@/lib/supabase`; auth via `useAuth()`.
- The submit path is `submitTechArticle` in `src/lib/technical-data.ts` — leave its
  signature as-is; just pass it a composed `body` string.
- Do NOT touch the database, RLS policies, or storage buckets.

## Step 1 — create this new file verbatim
Create `src/lib/article-fields.ts`:

```ts
// Lean structured fields for the technical article submit form (guide content),
// keyed by section value. Composed into the existing `body` text on submit.

export type GuideSection = 'maintenance' | 'performance' | 'diagnosis'

export interface GuideField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  placeholder?: string
  /** textarea where each non-empty line becomes a bullet in the composed body */
  list?: boolean
}

export const GUIDE_FIELDS: Record<GuideSection, GuideField[]> = {
  maintenance: [
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'time', label: 'Estimated time', type: 'text', placeholder: 'e.g. 2 hours' },
    { key: 'tools', label: 'Tools needed', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'parts', label: 'Parts & part numbers', type: 'textarea', list: true, placeholder: 'One per line, e.g. Oil filter — 11427566327' },
    { key: 'procedure', label: 'Procedure', type: 'textarea', placeholder: 'Step-by-step instructions' },
    { key: 'tips', label: 'Tips & notes', type: 'textarea', placeholder: 'Optional' },
  ],
  performance: [
    { key: 'parts', label: 'Parts required', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'coding', label: 'Coding / programming', type: 'text', placeholder: 'e.g. Bimmercode — enable folding mirrors' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'cost', label: 'Estimated cost', type: 'text', placeholder: 'e.g. $1,200' },
    { key: 'procedure', label: 'Procedure', type: 'textarea', placeholder: 'Step-by-step instructions' },
    { key: 'notes', label: 'Notes & warnings', type: 'textarea', placeholder: 'Optional — warranty, emissions, reversibility' },
  ],
  diagnosis: [
    { key: 'symptoms', label: 'Symptoms', type: 'textarea', list: true, placeholder: 'One per line' },
    { key: 'codes', label: 'Fault codes / DTCs', type: 'textarea', list: true, placeholder: 'One per line, e.g. 2A82 — VANOS' },
    { key: 'steps', label: 'Diagnostic steps', type: 'textarea', placeholder: 'How to diagnose it' },
    { key: 'cause', label: 'Likely cause', type: 'textarea' },
    { key: 'fix', label: 'Fix / resolution', type: 'textarea' },
    { key: 'tools', label: 'Tools / software', type: 'text', placeholder: 'e.g. ISTA, Bimmercode, INPA' },
  ],
}

/** Compose the structured field values into a clean, readable plain-text body. */
export function composeGuideBody(section: GuideSection, values: Record<string, string>): string {
  const fields = GUIDE_FIELDS[section] ?? []
  const blocks: string[] = []
  for (const f of fields) {
    const raw = (values[f.key] ?? '').trim()
    if (!raw) continue
    if (f.list) {
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `- ${l}`)
      blocks.push(`${f.label}:\n${lines.join('\n')}`)
    } else {
      blocks.push(`${f.label}:\n${raw}`)
    }
  }
  return blocks.join('\n\n')
}
```

## Step 2 — edit `src/components/technical/TechSubmitModal.tsx` in place (minimal)
Make ONLY these changes. Do not rewrite the file or alter anything else:

1. Add an import:
   `import { GUIDE_FIELDS, composeGuideBody, type GuideSection } from '@/lib/article-fields'`
2. Add state for the structured values:
   `const [guide, setGuide] = useState<Record<string, string>>({})`
3. Wherever a section button sets `form.section`, also reset the structured values with
   `setGuide({})`, so switching sections clears stale input.
4. Replace the existing "Guide content" block — the part that renders the single
   `<textarea name="body" …>` when `form.section !== 'documents' && form.contentType === 'guide'`
   — with a loop over `GUIDE_FIELDS[form.section as GuideSection]` that renders each field as
   the matching control (`select` / text `input` / `textarea`), with
   `value={guide[field.key] ?? ''}` and
   `onChange={(e) => setGuide((g) => ({ ...g, [field.key]: e.target.value }))}`.
   Reuse the SAME Tailwind classes and label styling the existing inputs/selects/textareas in
   this modal already use, so it looks consistent. For `select` fields, add a placeholder
   "Select…" option.
5. In `handleSubmit`, in the article branch, change the body line from
   `body: form.contentType === 'guide' ? form.body.trim() : undefined`
   to
   `body: form.contentType === 'guide' ? composeGuideBody(form.section as GuideSection, guide) : undefined`.
6. For a guide article, if the composed body is empty, set an error
   ("Please fill in at least one field.") and stop instead of submitting an empty article.
7. Leave the now-unused `body` field in `form` state as-is; don't bother removing it.

Do NOT change: the section buttons themselves, the system dropdowns, the generation select,
the content-type toggle, the documents flow, the PDF upload flow, the `submitTechArticle` /
`submitTechDocument` calls (beyond the one body line), or any styling beyond reusing existing
classes for the new fields.

## Step 3 — verify and ship
- Do NOT run `npm run build` locally (the Drive path breaks it). Rely on the Vercel preview.
- Branch: `git checkout -b feat/structured-guide-fields`.
- Quick self-check before committing:
  `grep -n "composeGuideBody" src/components/technical/TechSubmitModal.tsx` should match, and
  the article body should no longer use `form.body`.
- Commit, then `git push -u origin feat/structured-guide-fields`. Do not merge to main.
- End your final message with: the Vercel **preview URL**, and a one-line summary (the new
  file added + that `TechSubmitModal.tsx` was edited).
