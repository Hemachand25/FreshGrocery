import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()

  const q = searchParams.get('q') || ''

  useEffect(() => {
    const run = async () => {
      try {
        let res
        if (q) {
          res = await api.get('/users/vendors/search', { params: { q } })
        } else {
          res = await api.get('/users/vendors')
        }
        setVendors(res.data)
      } catch (e) {
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [q])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6">
        <div className="text-center text-gray-600">Loading vendors...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-700">Browse Vendors {q && (<span className="text-gray-500 text-xl">for "{q}"</span>)}</h2>
      {vendors.length === 0 ? (
        <div className="bg-white shadow rounded p-8 text-center text-gray-600">No vendors found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendors.map(v => (
            <div key={v.id} className="bg-white shadow rounded p-5">
              <div className="text-lg font-semibold">{v.fullName || v.email}</div>
              <div className="text-gray-600 text-sm">{v.email}</div>
              <div className="mt-3 flex gap-2">
                <Link className="text-orange-700 underline" to={`/vendor/${v.id}`}>View Store</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


