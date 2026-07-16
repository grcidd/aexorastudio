SELECT public.enqueue_email('transactional_emails', jsonb_build_object(
  'message_id', gen_random_uuid()::text,
  'to', 'gracedoure1234@gmail.com',
  'from', 'aexorastudio <noreply@aexorastudio.com>',
  'sender_domain', 'notify.aexorastudio.com',
  'subject', '✅ Test — AEXORA STUDIO',
  'html', '<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2e2e2e;"><h1 style="font-family:Bodoni Moda,Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;">Étape validée</h1><p><strong>Projet :</strong> Test Projet</p><p><strong>Étape :</strong> Brief créatif &amp; références</p><p><strong>Validée par :</strong> AEXORA STUDIO</p><p style="margin-top:24px;"><a href="https://aexorastudio.com/espace-client" style="display:inline-block;padding:12px 20px;background:#2e2e2e;color:#f6f6f6;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:0.1em;">VOIR MON PROJET</a></p></div>',
  'text', E'Étape validée\n\nProjet: Test Projet\nÉtape: Brief créatif & références\nValidée par: AEXORA STUDIO\n\nhttps://aexorastudio.com/espace-client',
  'purpose', 'transactional',
  'label', 'stage-validated-test',
  'idempotency_key', 'test-' || gen_random_uuid()::text,
  'queued_at', now()
));