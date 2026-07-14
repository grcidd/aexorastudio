import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TEMPLATES } from '@/lib/email-templates/registry'

const SITE_NAME = 'aexorastudio'
const SENDER_DOMAIN = 'notify.aexorastudio.com'
const FROM_DOMAIN = 'aexorastudio.com'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  website: z.string().trim().max(500).optional().or(z.literal('')),
  looking: z.string().trim().max(100).optional().or(z.literal('')),
  project: z.string().trim().max(5000).optional().or(z.literal('')),
  budget: z.string().trim().max(50).optional().or(z.literal('')),
  start: z.string().trim().max(50).optional().or(z.literal('')),
})

export const Route = createFileRoute('/api/public/contact/submit')({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json(
            { error: 'Server configuration error' },
            { status: 500, headers: corsHeaders },
          )
        }

        let parsed: z.infer<typeof schema>
        try {
          const body = await request.json()
          parsed = schema.parse(body)
        } catch (err) {
          return Response.json(
            { error: 'Invalid form data' },
            { status: 400, headers: corsHeaders },
          )
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Persist the submission
        const { error: insertError } = await supabase
          .from('contact_submissions')
          .insert({
            name: parsed.name,
            email: parsed.email,
            company: parsed.company || null,
            website: parsed.website || null,
            looking: parsed.looking || null,
            project: parsed.project || null,
            budget: parsed.budget || null,
            start_when: parsed.start || null,
          })

        if (insertError) {
          console.error('Contact insert failed', insertError)
          return Response.json(
            { error: 'Failed to save submission' },
            { status: 500, headers: corsHeaders },
          )
        }

        // 2. Render and enqueue the notification email (best-effort)
        try {
          const entry = TEMPLATES['contact-notification']
          if (!entry || !entry.to) throw new Error('Template missing')
          const recipientEmail = entry.to.toLowerCase()

          const { data: suppressed, error: suppressionError } = await supabase
            .from('suppressed_emails')
            .select('id')
            .eq('email', recipientEmail)
            .maybeSingle()

          if (suppressionError) throw suppressionError
          if (suppressed) throw new Error('Recipient is suppressed')

          let unsubscribeToken = generateToken()
          const { data: existingToken, error: tokenLookupError } = await supabase
            .from('email_unsubscribe_tokens')
            .select('token, used_at')
            .eq('email', recipientEmail)
            .maybeSingle()

          if (tokenLookupError) throw tokenLookupError

          if (existingToken && !existingToken.used_at) {
            unsubscribeToken = existingToken.token
          } else if (!existingToken) {
            const { error: tokenInsertError } = await supabase
              .from('email_unsubscribe_tokens')
              .upsert(
                { token: unsubscribeToken, email: recipientEmail },
                { onConflict: 'email', ignoreDuplicates: true },
              )
            if (tokenInsertError) throw tokenInsertError

            const { data: storedToken, error: storedTokenError } = await supabase
              .from('email_unsubscribe_tokens')
              .select('token')
              .eq('email', recipientEmail)
              .maybeSingle()
            if (storedTokenError || !storedToken) throw storedTokenError || new Error('Missing unsubscribe token')
            unsubscribeToken = storedToken.token
          } else {
            throw new Error('Recipient is unsubscribed')
          }

          const templateData = {
            name: parsed.name,
            email: parsed.email,
            company: parsed.company,
            website: parsed.website,
            looking: parsed.looking,
            project: parsed.project,
            budget: parsed.budget,
            startWhen: parsed.start,
          }

          const element = React.createElement(entry.component, templateData)
          const html = await render(element)
          const text = await render(element, { plainText: true })
          const subject =
            typeof entry.subject === 'function'
              ? entry.subject(templateData)
              : entry.subject

          const messageId = crypto.randomUUID()

          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: 'contact-notification',
            recipient_email: entry.to,
            status: 'pending',
          })

          const { error: enqueueError } = await supabase.rpc('enqueue_email', {
            queue_name: 'transactional_emails',
            payload: {
              message_id: messageId,
              to: entry.to,
              from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
              reply_to: parsed.email,
              sender_domain: SENDER_DOMAIN,
              subject,
              html,
              text,
              purpose: 'transactional',
              label: 'contact-notification',
              idempotency_key: messageId,
              unsubscribe_token: unsubscribeToken,
              queued_at: new Date().toISOString(),
            },
          })

          if (enqueueError) {
            console.error('Failed to enqueue contact email', enqueueError)
            await supabase.from('email_send_log').insert({
              message_id: messageId,
              template_name: 'contact-notification',
              recipient_email: entry.to,
              status: 'failed',
              error_message: 'Failed to enqueue email',
            })
          }
        } catch (err) {
          console.error('Contact email step failed', err)
        }

        return Response.json(
          { success: true },
          { status: 200, headers: corsHeaders },
        )
      },
    },
  },
})
