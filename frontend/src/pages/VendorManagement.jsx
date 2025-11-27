import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function VendorManagement() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [editing, setEditing] = useState(null)
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/')
    } else {
      fetchVendors()
    }
  }, [role])

  const fetchVendors = async () => {
    try {
      const res = await api.get('/admin/vendors')
      setVendors(res.data)
    } catch (e) {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ fullName: '', email: '', password: '' })
    setEditing(null)
  }

  const saveVendor = async () => {
    if (!form.email || (!editing && !form.password)) {
      setMsg('Email and password are required for new vendor')
      setTimeout(()=>setMsg(''), 3000)
      return
    }
    try {
      if (editing) {
        await api.put(`/admin/vendors/${editing.id}`, {
          fullName: form.fullName,
          email: form.email,
          password: form.password || undefined,
        })
      } else {
        await api.post('/admin/vendors', form)
      }
      resetForm()
      fetchVendors()
      setMsg('Vendor saved successfully')
      setTimeout(()=>setMsg(''), 3000)
    } catch (e) {
      setMsg('Error saving vendor')
      setTimeout(()=>setMsg(''), 3000)
    }
  }

  const editVendor = (v) => {
    setEditing(v)
    setForm({ fullName: v.fullName || '', email: v.email || '', password: '' })
  }

  const blockVendor = async (id) => {
    if (!window.confirm('Block this vendor?')) return
    try {
      await api.delete(`/admin/vendors/${id}`)
      setMsg('Vendor blocked')
      setTimeout(()=>setMsg(''), 3000)
      fetchVendors()
    } catch (e) {
      setMsg('Error blocking vendor')
      setTimeout(()=>setMsg(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6">
        <div className="text-center text-gray-600">Loading vendors...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-green-700">Vendor Management</h2>

      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white shadow rounded p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Vendor' : 'Add Vendor'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border rounded px-3 py-2" placeholder="Full Name" value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          <input className="border rounded px-3 py-2" type="password" placeholder={editing ? 'New Password (optional)' : 'Password'} value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
        </div>
        <div className="mt-4 flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={saveVendor}>{editing ? 'Update Vendor' : 'Add Vendor'}</button>
          {editing && <button className="border px-4 py-2 rounded" onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4">All Vendors</h3>
        {vendors.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No vendors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map(v => (
                  <tr key={v.id} className={v.deleted ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">{v.fullName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{v.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${v.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {v.deleted ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" onClick={()=>editVendor(v)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={()=>blockVendor(v.id)}>Block</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


