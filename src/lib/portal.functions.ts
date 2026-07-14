import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAIL = "grcdtech@gmail.com";
const SITE_NAME = "aexorastudio";
const SENDER_DOMAIN = "notify.aexorastudio.com";
const FROM_DOMAIN = "aexorastudio.com";
const PUBLIC_URL = "https://aexorastudio.com";

async function enqueueSimpleEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
  .inputValidator((input: { clientEmail: string; clientName: string; projectName: string; description?: string }) =>
    z
      .object({
        clientEmail: z.string().email(),
        clientName: z.string().min(1).max(200),
        projectName: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
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

    // Create project (stages are auto-seeded by trigger)
    const { data: project, error: projErr } = await supabaseAdmin
      .from("projects")
      .insert({
        client_id: userId,
        name: data.projectName,
        description: data.description || null,
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
    await supabaseAdmin.rpc as unknown;
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

    // Notify admin
    try {
      const { data: clientProfile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", context.userId)
        .maybeSingle();

      const projectName = (stage as any).projects?.name || "";
      await enqueueSimpleEmail({
        to: ADMIN_EMAIL,
        subject: `✅ Étape validée : ${stage.title} — ${projectName}`,
        label: "stage-validated",
        html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2e2e2e;">
          <h1 style="font-family:'Bodoni Moda',Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;">Étape validée par le client</h1>
          <p><strong>Projet :</strong> ${projectName}</p>
          <p><strong>Étape :</strong> ${stage.title}</p>
          <p><strong>Client :</strong> ${clientProfile?.full_name || ""} (${clientProfile?.email || ""})</p>
          <p style="margin-top:24px;"><a href="${PUBLIC_URL}/admin/projets/${stage.project_id}" style="display:inline-block;padding:12px 20px;background:#2e2e2e;color:#f6f6f6;text-decoration:none;font-family:monospace;font-size:12px;letter-spacing:0.1em;">VOIR LE PROJET</a></p>
        </div>`,
        text: `Étape validée par le client\n\nProjet: ${projectName}\nÉtape: ${stage.title}\nClient: ${clientProfile?.full_name} (${clientProfile?.email})\n\n${PUBLIC_URL}/admin/projets/${stage.project_id}`,
      });
    } catch (e) {
      console.error("Notify admin failed", e);
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
