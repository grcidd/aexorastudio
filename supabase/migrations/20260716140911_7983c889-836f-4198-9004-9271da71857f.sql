
-- 1) Fix storage policy: verify via stage_files linkage, not project name string
DROP POLICY IF EXISTS "clients read own project files" ON storage.objects;

CREATE POLICY "clients read own project files" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1
      FROM public.stage_files sf
      JOIN public.project_stages ps ON ps.id = sf.stage_id
      JOIN public.projects p ON p.id = ps.project_id
      WHERE sf.storage_path = storage.objects.name
        AND p.client_id = auth.uid()
    )
  );

-- 2) Revoke EXECUTE from anon/authenticated on SECURITY DEFINER functions
--    that must not be callable via the API. Keep has_role callable by
--    authenticated because the server middleware invokes it via RPC.

REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_project_stages()               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at()                    FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
