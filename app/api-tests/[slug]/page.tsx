'use client'

import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import FullscreenTest from '@/components/tests/FullscreenTest'

interface PageProps {
  params: {
    slug: string
  }
}

const testComponents: Record<string, React.ComponentType> = {
  fullscreen: FullscreenTest,
}

export default function ApiTestPage({ params }: PageProps) {
  const TestComponent = testComponents[params.slug]

  if (!TestComponent) {
    notFound()
  }

  return (
    <Layout>
      <TestComponent />
    </Layout>
  )
}