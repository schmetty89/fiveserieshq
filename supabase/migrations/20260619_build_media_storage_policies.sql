-- Build Showcase: storage policies for the public build-media bucket.
-- Reads are open (public bucket). Writes (insert/update/delete) are restricted to the
-- owner of the build, scoped by the {build_id}/... path convention, and blocked once the
-- build is verified (locked). The bucket itself ('build-media', public) was created via
-- the Supabase dashboard.
-- Applied to production 2026-06-19 (migration: build_media_storage_policies).

create policy "build_media_insert_owner" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'build-media'
    and exists (
      select 1 from public.builds b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
        and b.moderation_status <> 'verified'
    )
  );

create policy "build_media_update_owner" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'build-media'
    and exists (
      select 1 from public.builds b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
        and b.moderation_status <> 'verified'
    )
  );

create policy "build_media_delete_owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'build-media'
    and exists (
      select 1 from public.builds b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
        and b.moderation_status <> 'verified'
    )
  );
