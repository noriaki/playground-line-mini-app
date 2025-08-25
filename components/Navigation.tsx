import Link from 'next/link'
import { ApiCategory } from '@/types'

interface NavigationProps {
  categories: ApiCategory[]
}

export default function Navigation({ categories }: NavigationProps) {
  return (
    <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {category.name}
          </h2>
          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
          <div className="space-y-2">
            {category.apiTests.map((test) => (
              <Link
                key={test.id}
                href={`/api-tests/${test.id}`}
                className="block text-sm text-line-blue hover:text-line-green transition-colors"
              >
                → {test.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}