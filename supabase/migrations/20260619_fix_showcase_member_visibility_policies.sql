-- Build Showcase: fix member-visibility SELECT policies.
-- Switches the in_progress_shared visibility check from auth.role() = 'authenticated'
-- to the sturdier auth.uid() is not null, so logged-in members reliably see shared
-- in-progress builds across all request contexts.
-- Applied to production 2026-06-19 (migration: fix_showcase_member_visibility_policies).

drop policy "builds_select_public_verified" on public.builds;
create policy "builds_select_public_verified" on public.builds
  for select using (
    moderation_status = 'verified'
    or (moderation_status = 'in_progress_shared' and auth.uid() is not null)
    or user_id = auth.uid()
    or exists (select 1 from public.profiles p
               where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

drop policy "components_select_via_build" on public.build_components;
create policy "components_select_via_build" on public.build_components
  for select using (exists (
    select 1 from public.builds b where b.id = build_id and (
      b.moderation_status = 'verified'
      or (b.moderation_status = 'in_progress_shared' and auth.uid() is not null)
      or b.user_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
    )));

drop policy "photos_select_via_build" on public.build_photos;
create policy "photos_select_via_build" on public.build_photos
  for select using (exists (
    select 1 from public.builds b where b.id = build_id and (
      b.moderation_status = 'verified'
      or (b.moderation_status = 'in_progress_shared' and auth.uid() is not null)
      or b.user_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
    )));
