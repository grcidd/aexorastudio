
-- Table for project documents (livrables, contrats, devis, autres)
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('livrable','contrat','devis','autre')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  amount NUMERIC(12,2),
  description TEXT,
  visible_to_client BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  seen_by_client_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_documents_project ON public.project_documents(project_id, category);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_documents TO authenticated;
GRANT ALL ON public.project_documents TO service_role;

ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admins manage project documents" ON public.project_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients: read only own project documents that are visible
CREATE POLICY "clients read visible own documents" ON public.project_documents
  FOR SELECT TO authenticated
  USING (
    visible_to_client = true
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_documents.project_id AND p.client_id = auth.uid()
    )
  );

-- Clients can update seen_by_client_at on their own visible docs (mark as seen)
CREATE POLICY "clients mark own documents seen" ON public.project_documents
  FOR UPDATE TO authenticated
  USING (
    visible_to_client = true
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_documents.project_id AND p.client_id = auth.uid()
    )
  )
  WITH CHECK (
    visible_to_client = true
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_documents.project_id AND p.client_id = auth.uid()
    )
  );

CREATE TRIGGER trg_project_documents_updated_at
  BEFORE UPDATE ON public.project_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage RLS: extend client SELECT to include project_documents (visible only)
-- Files are stored under path "docs/<project_id>/<doc_id>-<filename>"
CREATE POLICY "clients read visible project documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND EXISTS (
      SELECT 1 FROM public.project_documents d
      JOIN public.projects p ON p.id = d.project_id
      WHERE d.storage_path = storage.objects.name
        AND d.visible_to_client = true
        AND p.client_id = auth.uid()
    )
  );
