'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import FullscreenTest from '@/components/tests/FullscreenTest'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

const testComponents: Record<string, React.ComponentType> = {
  fullscreen: FullscreenTest,
}

export default function ApiTestPage({ params }: PageProps) {
  const { slug } = use(params)
  const TestComponent = testComponents[slug]

  if (!TestComponent) {
    notFound()
  }

  return (
    <Layout>
      <TestComponent />
    </Layout>
  )
}