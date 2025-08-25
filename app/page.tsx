'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Navigation from '@/components/Navigation'
import { apiCategories } from '@/data/api-categories'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = apiCategories.map((category) => ({
    ...category,
    apiTests: category.apiTests.filter(
      (test) =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.apiTests.length > 0)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            JavaScript API Tester
          </h1>
          <p className="text-gray-600">
            Test JavaScript standard APIs in the LINE Mini App environment
          </p>
        </div>

        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search for APIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-line-blue focus:border-transparent"
          />
        </div>

        {filteredCategories.length > 0 ? (
          <Navigation categories={filteredCategories} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No APIs found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </Layout>
  )
}