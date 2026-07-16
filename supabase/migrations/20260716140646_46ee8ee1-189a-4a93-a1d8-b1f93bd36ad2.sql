
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'web-luxe'
  CHECK (service_type IN ('web-luxe','visual-ia','acquisition','automation-ia'));

CREATE OR REPLACE FUNCTION public.seed_project_stages()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.service_type = 'web-luxe' THEN
    INSERT INTO public.project_stages (project_id, stage_key, stage_order, title, status) VALUES
      (NEW.id, 'brief',       1, 'Brief & stratégie',                    'in_progress'),
      (NEW.id, 'direction',   2, 'Direction artistique & moodboard',     'pending'),
      (NEW.id, 'dev',         3, 'Développement & intégration',          'pending'),
      (NEW.id, 'tests',       4, 'Tests & révisions',                    'pending'),
      (NEW.id, 'launch',      5, 'Mise en ligne & transfert',            'pending');
  ELSIF NEW.service_type = 'visual-ia' THEN
    INSERT INTO public.project_stages (project_id, stage_key, stage_order, title, status) VALUES
      (NEW.id, 'brief',       1, 'Brief créatif & références',           'in_progress'),
      (NEW.id, 'direction',   2, 'Direction artistique & moodboard',     'pending'),
      (NEW.id, 'generation',  3, 'Génération & sélection des visuels',   'pending'),
      (NEW.id, 'retouches',   4, 'Retouches & validation',               'pending'),
      (NEW.id, 'delivery',    5, 'Livraison des fichiers HD',            'pending');
  ELSIF NEW.service_type = 'acquisition' THEN
    INSERT INTO public.project_stages (project_id, stage_key, stage_order, title, status) VALUES
      (NEW.id, 'audit',       1, 'Audit & analyse existante',            'in_progress'),
      (NEW.id, 'strategy',    2, 'Stratégie & plan d''action',           'pending'),
      (NEW.id, 'setup',       3, 'Setup tracking & campagnes',           'pending'),
      (NEW.id, 'optim',       4, 'Optimisation & tests',                 'pending'),
      (NEW.id, 'report',      5, 'Reporting & bilan',                    'pending');
  ELSIF NEW.service_type = 'automation-ia' THEN
    INSERT INTO public.project_stages (project_id, stage_key, stage_order, title, status) VALUES
      (NEW.id, 'brief',       1, 'Brief & cartographie des besoins',     'in_progress'),
      (NEW.id, 'architecture',2, 'Architecture des agents',              'pending'),
      (NEW.id, 'dev',         3, 'Développement & intégration',          'pending'),
      (NEW.id, 'tests',       4, 'Tests & validation',                   'pending'),
      (NEW.id, 'deploy',      5, 'Déploiement & formation client',       'pending');
  END IF;
  RETURN NEW;
END; $$;
