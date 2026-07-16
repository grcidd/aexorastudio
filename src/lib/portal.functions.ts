import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "grcdtech@gmail.com";
const SITE_NAME = "aexorastudio";
const SENDER_DOMAIN = "notify.aexorastudio.com";
const FROM_DOMAIN = "aexorastudio.com";
const PUBLIC_URL = "https://aexorastudio.com";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getOrCreateUnsubscribeToken(supabaseAdmin: any, email: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", email)
    .maybeSingle();
  if (existing && !existing.used_at) return existing.token;
  if (existing && existing.used_at) throw new Error("Recipient unsubscribed");
  const token = generateToken();
  await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .upsert({ token, email }, { onConflict: "email", ignoreDuplicates: true });
  const { data: stored } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  return stored?.token || token;
}

async function enqueueSimpleEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const recipient = opts.to.toLowerCase();

  const { data: suppressed } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", recipient)
    .maybeSingle();
  if (suppressed) throw new Error("Recipient suppressed");

  const unsubscribeToken = await getOrCreateUnsubscribeToken(supabaseAdmin, recipient);

  const messageId = crypto.randomUUID();
  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: opts.to,
    status: "pending",
  });
  await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: opts.to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      purpose: "transactional",
      label: opts.label,
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
}


async function requireAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

// -----------------------------------------------------------------------------
// Role lookup
// -----------------------------------------------------------------------------
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data, userId: context.userId };
  });

// -----------------------------------------------------------------------------
// Admin: create a client + project + send invite email
// -----------------------------------------------------------------------------
export const createClientProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { clientEmail: string; clientName: string; projectName: string; description?: string; serviceType: string }) =>
    z
      .object({
        clientEmail: z.string().email(),
        clientName: z.string().min(1).max(200),
        projectName: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        serviceType: z.enum(["web-luxe", "visual-ia", "acquisition", "automation-ia"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.clientEmail.toLowerCase().trim();

    // Find or create the auth user
    let userId: string | null = null;
    let tempPassword: string | null = null;

    // Try to find existing user
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      userId = existing.id;
    } else {
      // Generate temp password
      const bytes = new Uint8Array(9);
      crypto.getRandomValues(bytes);
      tempPassword = Array.from(bytes)
        .map((b) => b.toString(36).padStart(2, "0"))
        .join("")
        .slice(0, 12);

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: data.clientName },
      });
      if (createErr || !created.user) throw new Error(createErr?.message || "User creation failed");
      userId = created.user.id;

      // Ensure profile has the name
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, email, full_name: data.clientName }, { onConflict: "id" });
    }

    // Create project (stages are auto-seeded by trigger based on service_type)
    const { data: project, error: projErr } = await supabaseAdmin
      .from("projects")
      .insert({
        client_id: userId,
        name: data.projectName,
        description: data.description || null,
        service_type: data.serviceType,
      })
      .select()
      .single();
    if (projErr) throw projErr;

    // Send invite email
    const loginUrl = `${PUBLIC_URL}/login`;
    const credentialsBlock = tempPassword
      ? `<p style="margin:16px 0;padding:12px 16px;background:#f6f6f6;border:1px solid #2e2e2e;font-family:monospace;font-size:14px;">
           Email : ${email}<br>Mot de passe : ${tempPassword}
         </p>
         <p style="font-size:13px;color:#6b6b6b;">Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>`
      : `<p>Utilisez votre mot de passe habituel pour vous connecter.</p>`;

    try {
      await enqueueSimpleEmail({
        to: email,
        subject: `Votre espace client Aexora — ${data.projectName}`,
        label: "client-invite",
        html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2e2e2e;">
          <h1 style="font-family:'Bodoni Moda',Georgia,serif;font-size:28px;font-weight:400;margin:0 0 8px;">Bienvenue chez Aexora Studio</h1>
          <p style="font-size:15px;line-height:1.6;">Bonjour ${data.clientName},</p>
          <p style="font-size:15px;line-height:1.6;">Votre espace client dédié au projet <strong>${data.projectName}</strong> est prêt.</p>
          <p style="font-size:15px;line-height:1.6;">Vous pourrez y suivre l'avancement, télécharger les livrables, échanger avec nous et valider chaque étape.</p>
          ${credentialsBlock}
          <p style="margin:24px 0;">
            <a href="${loginUrl}" style="display:inline-block;padding:14px 24px;background:#2e2e2e;color:#f6f6f6;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:0.1em;">ACCÉDER À MON ESPACE</a>
          </p>
          <p style="font-size:13px;color:#6b6b6b;">À très vite,<br>L'équipe Aexora Studio</p>
        </div>`,
        text: `Bienvenue chez Aexora Studio\n\nBonjour ${data.clientName},\n\nVotre espace client pour le projet "${data.projectName}" est prêt.\n\n${
          tempPassword ? `Email: ${email}\nMot de passe: ${tempPassword}\n\n` : ""
        }Connexion: ${loginUrl}\n\nÀ très vite,\nL'équipe Aexora Studio`,
      });
    } catch (e) {
      console.error("Invite email failed", e);
    }

    return { projectId: project.id, tempPassword };
  });

// -----------------------------------------------------------------------------
// Client validates a stage → notify admin
// -----------------------------------------------------------------------------
export const validateStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { stageId: string }) => z.object({ stageId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    // Fetch stage + project via user-scoped client (RLS ensures ownership)
    const { data: stage, error } = await context.supabase
      .from("project_stages")
      .select("id, title, project_id, projects(name, client_id)")
      .eq("id", data.stageId)
      .single();
    if (error || !stage) throw new Error("Stage not found");

    const { error: updErr } = await context.supabase
      .from("project_stages")
      .update({ status: "validated", validated_at: new Date().toISOString() })
      .eq("id", data.stageId);
    if (updErr) throw updErr;

    // Advance next stage to in_progress
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: stages } = await supabaseAdmin
      .from("project_stages")
      .select("id, stage_order, status")
      .eq("project_id", stage.project_id)
      .order("stage_order");
    if (stages) {
      const next = stages.find((s) => s.status === "pending");
      if (next) {
        await supabaseAdmin
          .from("project_stages")
          .update({ status: "in_progress" })
          .eq("id", next.id);
      }
    }

    // Notify client
    try {
      const projectName = (stage as any).projects?.name || "";
      const clientId = (stage as any).projects?.client_id as string | undefined;

      let clientEmail: string | null = null;
      if (clientId) {
        const { data: clientProfile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", clientId)
          .maybeSingle();
        clientEmail = clientProfile?.email ?? null;
      }

      const recipient = clientEmail || ADMIN_EMAIL;
      const ctaUrl = `${PUBLIC_URL}/espace-client`;

      await enqueueSimpleEmail({
        to: recipient,
        subject: `✅ Étape validée : ${stage.title} — ${projectName}`,
        label: "stage-validated",
        html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2e2e2e;">
          <h1 style="font-family:'Bodoni Moda',Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;">Étape validée</h1>
          <p><strong>Projet :</strong> ${projectName}</p>
          <p><strong>Étape :</strong> ${stage.title}</p>
          <p><strong>Validée par :</strong> AEXORA STUDIO</p>
          <p style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;padding:12px 20px;background:#2e2e2e;color:#f6f6f6;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:0.1em;">VOIR MON PROJET</a></p>
        </div>`,
        text: `Étape validée\n\nProjet: ${projectName}\nÉtape: ${stage.title}\nValidée par: AEXORA STUDIO\n\n${ctaUrl}`,
      });
    } catch (e) {
      console.error("Notify client failed", e);
    }

    return { ok: true };
  });

// -----------------------------------------------------------------------------
// Add comment
// -----------------------------------------------------------------------------
export const addStageComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { stageId: string; content: string }) =>
    z.object({ stageId: z.string().uuid(), content: z.string().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("stage_comments")
      .insert({ stage_id: data.stageId, author_id: context.userId, content: data.content });
    if (error) throw error;
    return { ok: true };
  });

// -----------------------------------------------------------------------------
// Get signed URL for a stored file
// -----------------------------------------------------------------------------
export const getFileUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => z.object({ path: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    // RLS on storage.objects gates access; use user client
    const { data: signed, error } = await context.supabase.storage
      .from("project-files")
      .createSignedUrl(data.path, 3600);
    if (error || !signed) throw new Error(error?.message || "Signed URL failed");
    return { url: signed.signedUrl };
  });

// -----------------------------------------------------------------------------
// Project documents (livrables / contrats / devis / autres)
// -----------------------------------------------------------------------------
const DOC_CATEGORIES = ["livrable", "contrat", "devis", "autre"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  livrable: "Livrables",
  contrat: "Contrat",
  devis: "Devis",
  autre: "Autre",
};

const MAX_INLINE_BYTES = 10 * 1024 * 1024;      // 10 Mo/file → attach
const MAX_TOTAL_ATTACH_BYTES = 25 * 1024 * 1024; // 25 Mo total → fallback to link
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;         // 7 days
const RESEND_FROM = "AEXORA Studio <notifications@aexorastudio.com>";

function categoryOfMime(mime: string | null | undefined): "image" | "video" | "pdf" | "other" {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m === "application/pdf") return "pdf";
  return "other";
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
  }
  return btoa(binary);
}

async function notifyClientDocumentAvailable(docId: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY missing");
      return { notified: false };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: doc } = await supabaseAdmin
      .from("project_documents")
      .select("id, file_name, category, mime_type, file_size, storage_path, link_url, project_id, projects(name, client_id, profiles!projects_client_id_profiles_fkey(email, full_name))")
      .eq("id", docId)
      .maybeSingle();
    if (!doc) return { notified: false };
    const project: any = (doc as any).projects;
    const client: any = project?.profiles;
    const recipient: string | undefined = client?.email;
    if (!recipient) return { notified: false };

    const { data: suppressed } = await supabaseAdmin
      .from("suppressed_emails")
      .select("id")
      .eq("email", recipient.toLowerCase())
      .maybeSingle();
    if (suppressed) return { notified: false };

    const firstName = (client?.full_name || "").split(" ")[0] || "";
    const projectName = project?.name || "";
    const fileName: string = (doc as any).file_name;
    const catKey: string = (doc as any).category;
    const catLabel = CATEGORY_LABELS[catKey] || "Document";
    const mime: string | null = (doc as any).mime_type;
    const fileSize: number | null = (doc as any).file_size;
    const storagePath: string | null = (doc as any).storage_path;
    const linkUrl: string | null = (doc as any).link_url;
    const kind = categoryOfMime(mime);
    const dateStr = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const ctaUrl = `${PUBLIC_URL}/espace-client`;

    let attachments: Array<{ filename: string; content: string; content_type?: string; content_id?: string; disposition?: string }> = [];
    let inlineImageCid: string | null = null;
    let signedUrl: string | null = null;
    let attachedInline = false;

    const shouldTryAttach =
      !!storagePath &&
      (catKey === "contrat" || catKey === "devis" ||
       (catKey === "livrable" && (fileSize == null || fileSize < MAX_INLINE_BYTES)));

    if (shouldTryAttach && storagePath) {
      try {
        const { data: blob, error: dlErr } = await supabaseAdmin.storage
          .from("project-files")
          .download(storagePath);
        if (!dlErr && blob) {
          const buf = await blob.arrayBuffer();
          if (buf.byteLength <= MAX_TOTAL_ATTACH_BYTES) {
            const b64 = arrayBufferToBase64(buf);
            const cid = `doc-${docId}`;
            const isInlineImage = kind === "image";
            attachments.push({
              filename: fileName,
              content: b64,
              content_type: mime || "application/octet-stream",
              ...(isInlineImage ? { content_id: cid, disposition: "inline" } : {}),
            });
            if (isInlineImage) inlineImageCid = cid;
            attachedInline = true;
          }
        }
      } catch (e) {
        console.error("attach download failed", e);
      }
    }

    if (!attachedInline && storagePath) {
      const { data: sig } = await supabaseAdmin.storage
        .from("project-files")
        .createSignedUrl(storagePath, SIGNED_URL_TTL, { download: fileName });
      signedUrl = sig?.signedUrl || null;
    }

    let previewHtml = "";
    if (attachedInline && inlineImageCid) {
      previewHtml = `<div style="margin:20px 0;text-align:center;">
        <img src="cid:${inlineImageCid}" alt="${fileName}" style="max-width:100%;height:auto;border:1px solid #e5e0d8;" />
      </div>`;
    } else if (kind === "video") {
      previewHtml = `<div style="margin:20px 0;text-align:center;">
        <a href="${ctaUrl}" style="display:inline-block;text-decoration:none;">
          <div style="width:100%;max-width:420px;background:#2e1f26;color:#f4ece0;padding:60px 20px;font-family:'Bodoni Moda',Georgia,serif;font-size:16px;">▶ &nbsp;Voir la vidéo</div>
        </a>
      </div>`;
    } else if (kind === "pdf") {
      previewHtml = `<div style="margin:20px 0;padding:20px;background:#f4ece0;color:#2e1f26;font-family:Georgia,serif;font-size:13px;text-align:center;border:1px solid #e5e0d8;">📄 Document PDF — ${fileName}</div>`;
    }

    const downloadBtn = signedUrl
      ? `<p style="margin:20px 0;text-align:center;">
          <a href="${signedUrl}" style="display:inline-block;padding:14px 28px;background:#2e1f26;color:#f4ece0;text-decoration:none;font-family:'Jura',monospace;font-size:11px;letter-spacing:0.15em;">TÉLÉCHARGER LE FICHIER</a>
          <br /><span style="font-family:'Jura',monospace;font-size:10px;color:#8a7a70;letter-spacing:0.1em;">LIEN VALABLE 7 JOURS</span>
        </p>`
      : "";

    const attachedNote = attachedInline
      ? `<p style="font-size:14px;color:#4a3a3a;text-align:center;margin:16px 0;">📎 Fichier joint à ce mail.</p>`
      : "";

    const linkOnlyBlock = linkUrl && !storagePath
      ? `<p style="margin:20px 0;text-align:center;">
          <a href="${linkUrl}" style="display:inline-block;padding:14px 28px;background:#2e1f26;color:#f4ece0;text-decoration:none;font-family:'Jura',monospace;font-size:11px;letter-spacing:0.15em;">VISITER LE SITE</a>
        </p>`
      : "";

    const subject = `📄 ${fileName} est disponible — ${projectName}`;

    const html = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#2e1f26;background:#faf6ef;">
      <h1 style="font-family:'Bodoni Moda',Georgia,serif;font-size:26px;font-weight:400;margin:0 0 24px;text-align:center;">Votre document est prêt</h1>
      <p style="font-size:15px;line-height:1.6;">Bonjour ${firstName || ""},</p>
      <p style="font-size:15px;line-height:1.6;">Votre document est prêt.</p>
      <div style="margin:24px 0;padding:20px;background:#ffffff;border:1px solid #e5e0d8;">
        <p style="margin:4px 0;font-size:14px;"><strong>${fileName}</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#6b5a55;">Catégorie : ${catLabel}</p>
        <p style="margin:4px 0;font-size:13px;color:#6b5a55;">Date : ${dateStr}</p>
      </div>
      ${previewHtml}
      ${attachedNote}
      ${downloadBtn}
      ${linkOnlyBlock}
      <p style="font-size:13px;color:#6b5a55;text-align:center;margin-top:24px;">
        ${attachedInline ? "Si la pièce jointe ne s'affiche pas correctement :" : "Retrouvez ce document dans votre espace :"}
      </p>
      <p style="margin:12px 0 32px;text-align:center;">
        <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:transparent;color:#2e1f26;text-decoration:none;font-family:'Jura',monospace;font-size:11px;letter-spacing:0.15em;border:1px solid #2e1f26;">ACCÉDER À MON ESPACE</a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e0d8;margin:32px 0 20px;" />
      <p style="font-family:'Bodoni Moda',Georgia,serif;font-style:italic;font-size:15px;color:#6b5a55;text-align:center;margin:0;">Beauty, engineered.</p>
      <p style="font-family:'Jura',monospace;font-size:11px;color:#8a7a70;text-align:center;margin:8px 0 0;letter-spacing:0.15em;">AEXORA STUDIO</p>
      <p style="font-size:12px;color:#8a7a70;text-align:center;margin:6px 0 0;">contact@aexorastudio.com</p>
    </div>`;

    const text = `Bonjour ${firstName},\n\nVotre document est prêt.\n\n${fileName}\nCatégorie : ${catLabel}\nDate : ${dateStr}\n\n${attachedInline ? "Fichier joint à ce mail.\n" : ""}${signedUrl ? `Téléchargement direct (valable 7 jours) : ${signedUrl}\n` : ""}${linkUrl && !storagePath ? `Lien : ${linkUrl}\n` : ""}\nAccéder à votre espace : ${ctaUrl}\n\nBeauty, engineered.\nAEXORA Studio\ncontact@aexorastudio.com`;

    const messageId = crypto.randomUUID();
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: "document-available",
      recipient_email: recipient,
      status: "pending",
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [recipient],
        subject,
        html,
        text,
        ...(attachments.length ? { attachments } : {}),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Resend send failed [${res.status}]: ${errBody}`);
      await supabaseAdmin
        .from("email_send_log")
        .update({ status: "failed", error_message: `Resend ${res.status}: ${errBody}`.slice(0, 500) })
        .eq("message_id", messageId);
      return { notified: false };
    }

    await supabaseAdmin
      .from("email_send_log")
      .update({ status: "sent" })
      .eq("message_id", messageId);

    return { notified: true, recipient };
  } catch (e) {
    console.error("notifyClientDocumentAvailable failed", e);
    return { notified: false };
  }
}

export const listProjectDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])

  .inputValidator((input: { projectId: string }) =>
    z.object({ projectId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // RLS handles filtering: admin sees all, client sees only visible ones on own projects
    const { data: docs, error } = await context.supabase
      .from("project_documents")
      .select("*")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return docs;
  });

export const createProjectDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    projectId: string;
    category: string;
    fileName: string;
    storagePath?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    linkUrl?: string | null;
    status?: string;
    amount?: number | null;
    description?: string | null;
    visibleToClient?: boolean;
  }) =>
    z.object({
      projectId: z.string().uuid(),
      category: z.enum(DOC_CATEGORIES),
      fileName: z.string().min(1).max(300),
      storagePath: z.string().min(1).max(500).nullable().optional(),
      fileSize: z.number().int().nonnegative().nullable().optional(),
      mimeType: z.string().max(200).nullable().optional(),
      linkUrl: z.string().url().max(2000).nullable().optional(),
      status: z.string().max(50).optional(),
      amount: z.number().nullable().optional(),
      description: z.string().max(1000).nullable().optional(),
      visibleToClient: z.boolean().optional(),
    }).refine((v) => !!v.storagePath || !!v.linkUrl, {
      message: "storagePath ou linkUrl requis",
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const defaultStatus =
      data.category === "livrable" ? "draft" :
      data.category === "contrat" ? "pending_signature" :
      data.category === "devis" ? "pending" : "available";
    const { data: row, error } = await context.supabase
      .from("project_documents")
      .insert({
        project_id: data.projectId,
        category: data.category,
        file_name: data.fileName,
        storage_path: data.storagePath ?? null,
        file_size: data.fileSize ?? null,
        mime_type: data.mimeType ?? null,
        link_url: data.linkUrl ?? null,
        status: data.status || defaultStatus,
        amount: data.amount ?? null,
        description: data.description ?? null,
        visible_to_client: data.visibleToClient ?? false,
        uploaded_by: context.userId,
      })
      .select()
      .single();
    if (error) throw error;
    let notified = false;
    if (row.visible_to_client) {
      const r = await notifyClientDocumentAvailable(row.id);
      notified = !!r.notified;
    }
    return { ...row, notified };
  });



export const updateProjectDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    id: string;
    fileName?: string;
    status?: string;
    amount?: number | null;
    description?: string | null;
    linkUrl?: string | null;
    visibleToClient?: boolean;
  }) =>
    z.object({
      id: z.string().uuid(),
      fileName: z.string().min(1).max(300).optional(),
      status: z.string().max(50).optional(),
      amount: z.number().nullable().optional(),
      description: z.string().max(1000).nullable().optional(),
      linkUrl: z.string().url().max(2000).nullable().optional(),
      visibleToClient: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    // Fetch previous visibility to detect false→true transition
    const { data: prev } = await context.supabase
      .from("project_documents")
      .select("visible_to_client")
      .eq("id", data.id)
      .maybeSingle();
    const patch: any = {};
    if (data.fileName !== undefined) patch.file_name = data.fileName;
    if (data.status !== undefined) patch.status = data.status;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.description !== undefined) patch.description = data.description;
    if (data.linkUrl !== undefined) patch.link_url = data.linkUrl;
    if (data.visibleToClient !== undefined) patch.visible_to_client = data.visibleToClient;

    if (data.visibleToClient === true && !prev?.visible_to_client) {
      // Reset seen state so client sees it as new
      patch.seen_by_client_at = null;
    }
    const { error } = await context.supabase
      .from("project_documents")
      .update(patch)
      .eq("id", data.id);
    if (error) throw error;
    let notified = false;
    if (data.visibleToClient === true && !prev?.visible_to_client) {
      const r = await notifyClientDocumentAvailable(data.id);
      notified = !!r.notified;
    }
    return { ok: true, notified };
  });


export const deleteProjectDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Fetch storage path
    const { data: doc } = await supabaseAdmin
      .from("project_documents")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (doc?.storage_path) {
      await supabaseAdmin.storage.from("project-files").remove([doc.storage_path]);
    }
    const { error } = await supabaseAdmin.from("project_documents").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const markDocumentsSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { projectId: string; category: string }) =>
    z.object({
      projectId: z.string().uuid(),
      category: z.enum(DOC_CATEGORIES),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const now = new Date().toISOString();
    // RLS: client can only update visible docs on own project
    await context.supabase
      .from("project_documents")
      .update({ seen_by_client_at: now })
      .eq("project_id", data.projectId)
      .eq("category", data.category)
      .is("seen_by_client_at", null);
    return { ok: true };
  });
