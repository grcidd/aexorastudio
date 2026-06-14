import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  company?: string
  website?: string
  looking?: string
  project?: string
  budget?: string
  startWhen?: string
}

const Row = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <Section style={row}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </Section>
  ) : null

const Email = ({
  name,
  email,
  company,
  website,
  looking,
  project,
  budget,
  startWhen,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouvelle demande de {name || 'un visiteur'} — Aexora Studio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouvelle demande de contact</Heading>
        <Text style={intro}>
          Une nouvelle demande vient d'arriver depuis aexorastudio.com.
        </Text>
        <Hr style={hr} />
        <Row label="Nom" value={name} />
        <Row label="Email" value={email} />
        <Row label="Entreprise" value={company} />
        <Row label="Site web" value={website} />
        <Row label="Recherche" value={looking} />
        <Row label="Budget" value={budget} />
        <Row label="Démarrage" value={startWhen} />
        {project ? (
          <Section style={row}>
            <Text style={labelStyle}>Projet</Text>
            <Text style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{project}</Text>
          </Section>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>Aexora Studio — formulaire de contact</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Nouvelle demande — ${data?.name || 'visiteur'}${data?.company ? ' (' + data.company + ')' : ''}`,
  displayName: 'Contact form notification',
  to: 'grcdtech@gmail.com',
  previewData: {
    name: 'Jeanne Dupont',
    email: 'jeanne@maisonx.com',
    company: 'Maison X',
    website: 'https://maisonx.com',
    looking: 'BRANDING',
    project: 'Refonte complète de notre identité visuelle pour 2026.',
    budget: '15 — 30K',
    startWhen: '1 MOIS',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }
const intro = { fontSize: '14px', color: '#555', margin: '0 0 16px' }
const hr = { borderColor: '#eee', margin: '20px 0' }
const row = { margin: '0 0 12px' }
const labelStyle = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#888',
  margin: '0 0 4px',
}
const valueStyle = { fontSize: '15px', color: '#1a1a1a', margin: 0 }
const footer = { fontSize: '11px', color: '#aaa', margin: '0' }
