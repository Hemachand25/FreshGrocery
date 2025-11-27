import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminSearch() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [results, setResults] = useState({ vendors: [], users: [] })
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem('role')
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/')
      return
    }
    if (q) {
      fetchResults()
    } else {
      setResults({ vendors: [], users: [] })
      setLoading(false)
    }
  }, [q, role])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users/admin/search', { params: { q } })
      setResults({
        vendors: res.data.vendors || [],
        users: res.data.users || []
      })
    } catch (error) {
      console.error('Error searching:', error)
      setResults({ vendors: [], users: [] })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6">
        <div className="text-center text-gray-600">Searching...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-green-700">
        Search Results {q && <span className="text-gray-500 text-xl">for "{q}"</span>}
      </h2>

      <div className="space-y-6">
        {/* Vendors Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Vendors ({results.vendors.length})</h3>
          {results.vendors.length === 0 ? (
            <div className="bg-gray-50 border rounded p-4 text-center text-gray-600">No vendors found</div>
          ) : (
            <div className="bg-white shadow rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.vendors.map(v => (
                    <tr key={v.id} className={v.deleted ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{v.fullName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{v.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${v.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {v.deleted ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/vendor/${v.id}`} className="text-blue-600 hover:text-blue-900">View Store</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Customers ({results.users.length})</h3>
          {results.users.length === 0 ? (
            <div className="bg-gray-50 border rounded p-4 text-center text-gray-600">No customers found</div>
          ) : (
            <div className="bg-white shadow rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.users.map(u => (
                    <tr key={u.id} className={u.deleted ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">{u.fullName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {u.deleted ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/orders/user/${u.id}`} className="text-blue-600 hover:text-blue-900">View Orders</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

