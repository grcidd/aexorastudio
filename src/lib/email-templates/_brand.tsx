import * as React from 'react'
import { Section, Text } from '@react-email/components'

export const BrandHeader = () => (
  <Section style={wrap}>
    <Text style={wordmark}>AEXORA</Text>
  </Section>
)

const wrap = {
  padding: '8px 0 24px',
  borderBottom: '1px solid #eeeeee',
  marginBottom: '24px',
}
const wordmark = {
  margin: 0,
  fontSize: '16px',
  fontWeight: 300 as const,
  letterSpacing: '0.4em',
  color: '#1a1a1a',
  fontFamily: 'Helvetica, Arial, sans-serif',
}
