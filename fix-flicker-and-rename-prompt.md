# FiveSeriesHQ — fix the technical-info section flicker + rename "article" → "guide"

Read `CLAUDE.md` first. Two **surgical** changes, on the existing
`feat/structured-guide-fields` branch (the one with the structured submit fields). Edit only
what's listed. Do NOT rewrite files or change unrelated behavior. We can't build locally
(the "My Drive" path breaks npm) — push the branch and I'll check the Vercel preview, then
I'll merge. Do not merge to main.

## Fix 1 — section/system expand flicker (`src/components/technical/TechnicalInfo.tsx`)
**Cause:** the reset effect lists `loadDocs`/`loadArticles` in its dependency array.
`loadArticles` is recreated whenever `activeSystem` changes, so clicking a system card
re-runs the reset effect, which calls `setActiveSystem(null)` and snaps the view back to the
grid — the flicker. Fix it by splitting reset from loading.

Find this block (the first two `useEffect`s in `TechnicalInfoInner`):

```tsx
  useEffect(() => {
    setActiveSystem(null)
    setActiveArticleId(null)
    setArticle(null)
    if (activeSection === 'documents') loadDocs()
    else loadArticles()
  }, [activeGen, activeSection, loadDocs, loadArticles])

  useEffect(() => {
    if (activeSystem !== null) loadArticles()
  }, [activeSystem, loadArticles])
```

Replace it with:

```tsx
  // Reset selections only when generation or section changes
  useEffect(() => {
    setActiveSystem(null)
    setActiveArticleId(null)
    setArticle(null)
  }, [activeGen, activeSection])

  // Load list data for the current generation / section / system
  useEffect(() => {
    if (activeSection === 'documents') loadDocs()
    else if (activeSection === 'maintenance' || activeSection === 'performance' || activeSection === 'diagnosis') loadArticles()
  }, [activeGen, activeSection, activeSystem, loadDocs, loadArticles])
```

Leave the third effect (`if (activeArticleId) loadArticle()`) exactly as it is. Change
nothing else in this file for Fix 1.

## Fix 2 — rename user-facing "article" → "guide" (display text ONLY)
Change only the words shown to users. Do **NOT** rename any code: keep the `TechArticle` /
`ArticleDetail` interfaces, all variable names (`articles`, `sysArticles`, `activeArticleId`,
`article`), function names (`getTechArticles`, `getTechArticle`, `loadArticles`,
`loadArticle`, `submitTechArticle`), the database table `tech_articles`, and the section
values (`maintenance`/`performance`/`diagnosis`) all exactly as they are.

In `src/components/technical/TechnicalInfo.tsx`, change these visible strings:
- The system-card count: `` `${sysArticles.length} article${sysArticles.length !== 1 ? 's' : ''}` `` → use `guide`/`guides`; and `'No articles yet'` → `'No guides yet'`.
- The empty state label `"No articles yet for this system"` → `"No guides yet for this system"`.
- `"This article is a PDF document."` → `"This guide is a PDF document."`

In `src/components/technical/TechSubmitModal.tsx`:
- The title label `'Article title'` → `'Guide title'` (the `form.section === 'documents' ? 'Document name' : 'Article title'` line).

If you spot the word "article(s)" in any other clearly user-facing string within these two
files, rename it to "guide(s)" too — but only display text, never identifiers.

## Verify and ship
- Do NOT run `npm run build` locally. Rely on the Vercel preview.
- Stay on `feat/structured-guide-fields`. Commit both fixes, then `git push`.
- Self-check before committing: `grep -n "No articles yet" src/components/technical/TechnicalInfo.tsx` should return nothing.
- End your final message with the Vercel preview URL and a one-line summary of what changed.
- Do not merge to main.
