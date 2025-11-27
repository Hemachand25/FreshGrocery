import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/')
    } else {
      fetchUsers()
    }
  }, [role])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/all')
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to block this user account?')) {
      try {
        await api.delete(`/users/${userId}`)
        setMsg('User account has been blocked')
        setTimeout(() => setMsg(''), 3000)
        fetchUsers()
      } catch (error) {
        setMsg('Error blocking user')
        setTimeout(() => setMsg(''), 3000)
      }
    }
  }

  const unblockUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/unblock`)
      setMsg('User account has been unblocked')
      setTimeout(() => setMsg(''), 3000)
      fetchUsers()
    } catch (error) {
      setMsg('Error unblocking user')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const viewUserOrders = (userId) => {
    navigate(`/orders/user/${userId}`)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-green-700">User Management</h2>
      
      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white shadow rounded p-6">
        <h3 className="text-xl font-semibold mb-4">All Users</h3>
        {users.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className={user.deleted ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'ROLE_ADMIN' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'ROLE_VENDOR' ? 'bg-purple-100 text-purple-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'ROLE_ADMIN' ? 'Admin' : 
                         user.role === 'ROLE_VENDOR' ? 'Vendor' : 
                         'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.deleted ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewUserOrders(user.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Orders
                      </button>
                      {user.deleted ? (
                        <button
                          onClick={() => unblockUser(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Block
                        </button>
                      )}
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
