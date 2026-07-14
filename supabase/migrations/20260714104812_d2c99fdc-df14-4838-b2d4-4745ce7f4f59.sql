
-- Storage RLS: files are keyed by "<project_id>/<stage_id>/<filename>"
CREATE POLICY "admins manage project files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'project-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'project-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "clients read own project files" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = split_part(name, '/', 1)
      AND p.client_id = auth.uid()
    )
  );
