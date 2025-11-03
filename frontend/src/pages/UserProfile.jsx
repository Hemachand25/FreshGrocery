import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    } else {
      fetchUserProfile()
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
      setNewName(res.data.fullName)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setMsg('Error loading profile')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      await api.put('/auth/profile', { fullName: newName })
      setMsg('Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
      setEditingName(false)
      fetchUserProfile()
    } catch (error) {
      setMsg('Error updating profile')
      console.error('Error updating profile:', error)
    }
  }

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${user.id}`)
        setMsg('Your account has been deleted. You will be logged out.')
        setTimeout(() => {
          localStorage.clear()
          navigate('/')
        }, 3000)
      } catch (error) {
        setMsg('Error deleting account')
        setTimeout(() => setMsg(''), 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-700">My Profile</h2>
      
      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-800'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white shadow rounded p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            {editingName ? (
              <div className="mt-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-2 rounded text-sm flex-1"
                  placeholder="Enter new name"
                />
                <button
                  onClick={updateProfile}
                  className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(user.fullName)
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <p className="text-sm text-gray-900">{user.fullName}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.role === 'ROLE_ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Customer'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.deleted ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {user.deleted ? 'Blocked' : 'Active'}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
            >
              View My Orders
            </button>
            
            {role === 'ROLE_CUSTOMER' && (
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                View My Cart
              </button>
            )}
            
            {role === 'ROLE_CUSTOMER' && (
              <button
                onClick={deleteAccount}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete My Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
