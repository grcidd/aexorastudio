ALTER TABLE public.project_documents ADD COLUMN link_url TEXT;
ALTER TABLE public.project_documents ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE public.project_documents ADD CONSTRAINT project_documents_file_or_link CHECK (storage_path IS NOT NULL OR link_url IS NOT NULL);