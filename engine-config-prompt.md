# FiveSeriesHQ — add ENGINES_BY_GENERATION config

Read `CLAUDE.md` first. **Do NOT touch the database, do NOT change section values / table
names / function names, do NOT commit or push.** This is a config-file addition only.
This session has no git push auth — make the edit and stop. The user commits/pushes via
GitHub Desktop. Do NOT run `npm run build` (the "My Drive" path breaks it).

## Change — add an engine-code mapping to `src/lib/technical-config.ts`

Append the following to the END of `src/lib/technical-config.ts` (do not modify any
existing exports in the file). This is static US-market reference data: engines grouped by
model within each generation, each entry carrying short code, full code, model, and years.

```typescript

// ─────────────────────────────────────────────────────────────
// Engine codes by generation (US-market gas engines, incl. M-cars)
// Verified reference data. Used by the guide submit form: maintenance
// guides show only the selected generation's engines; the future
// Mods & Retrofits section can show the full cross-generation list.
// ─────────────────────────────────────────────────────────────

export interface EngineEntry {
  short: string   // family code shown by default, e.g. 'N52'
  full: string    // full code, e.g. 'N52B30'
  model: string   // model badge, e.g. '530i'
  years: string   // production years for this engine in this model
}

export const ENGINES_BY_GENERATION: Record<string, EngineEntry[]> = {
  E39: [
    { short: 'M54',    full: 'M54B25',    model: '525i', years: '2001–2003' },
    { short: 'M52',    full: 'M52B28',    model: '528i', years: '1995–1998' },
    { short: 'M52TU',  full: 'M52TUB28',  model: '528i', years: '1998–2001' },
    { short: 'M54',    full: 'M54B30',    model: '530i', years: '2001–2003' },
    { short: 'M62',    full: 'M62B44',    model: '540i', years: '1997–1998' },
    { short: 'M62TU',  full: 'M62TUB44',  model: '540i', years: '1999–2003' },
    { short: 'S62',    full: 'S62B50',    model: 'M5',   years: '2000–2003' },
  ],
  E60: [
    { short: 'M54',    full: 'M54B25',    model: '525i', years: '2004' },
    { short: 'N52',    full: 'N52B30',    model: '525i', years: '2005–2007' },
    { short: 'N52',    full: 'N52B30',    model: '528i', years: '2008–2010' },
    { short: 'M54',    full: 'M54B30',    model: '530i', years: '2004–2005' },
    { short: 'N52',    full: 'N52B30',    model: '530i', years: '2006–2007' },
    { short: 'N54',    full: 'N54B30',    model: '535i', years: '2008–2010' },
    { short: 'N62',    full: 'N62B44',    model: '545i', years: '2004–2005' },
    { short: 'N62',    full: 'N62B48',    model: '550i', years: '2006–2010' },
    { short: 'S85',    full: 'S85B50',    model: 'M5',   years: '2006–2010' },
  ],
  F10: [
    { short: 'N52',    full: 'N52B30',    model: '528i', years: '2011' },
    { short: 'N20',    full: 'N20B20',    model: '528i', years: '2012–2016' },
    { short: 'N55',    full: 'N55B30',    model: '535i', years: '2011–2016' },
    { short: 'N63',    full: 'N63B44',    model: '550i', years: '2011–2016' },
    { short: 'S63',    full: 'S63B44',    model: 'M5',   years: '2013–2016' },
  ],
  G30: [
    { short: 'B48',    full: 'B48B20',    model: '530i', years: '2017–2023' },
    { short: 'B58',    full: 'B58B30',    model: '540i', years: '2017–2023' },
    { short: 'N63',    full: 'N63B44',    model: '550i', years: '2017–2019' },
    { short: 'S63',    full: 'S63B44',    model: 'M5',   years: '2018–2023' },
  ],
}

// All engines across every generation, for cross-generation use
// (e.g. swap/retrofit guides in the future Mods & Retrofits section).
export const ALL_ENGINES: EngineEntry[] = Object.values(ENGINES_BY_GENERATION).flat()
```

## When done
Make the edit and STOP. Do not commit, push, or run the build. Report what you changed.
Note: this only ADDS exports; it must not alter anything already in the file.
