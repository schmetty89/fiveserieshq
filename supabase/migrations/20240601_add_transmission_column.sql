-- ─────────────────────────────────────────────────────────────
-- FiveSeriesHQ: add transmission column to forum_threads
-- Mirrors the existing engine column — used by the Drivetrain
-- subforum's nested Manual/Automatic transmission groups.
-- ─────────────────────────────────────────────────────────────

alter table public.forum_threads add column if not exists transmission text;
