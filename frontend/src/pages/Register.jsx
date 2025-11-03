import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const navigate = useNavigate()

  

  const handleRegister = async () => {
    setError('')
    
    if (!fullName || !email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      await api.post('/auth/register', { email, fullName, password })
      alert('Registered successfully')
      navigate('/login')
    } catch (e) {
      setError('Error registering')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded" onKeyDown={(e) => { if (e.key === 'Enter') handleRegister() }}>
      <h2 className="text-2xl font-extrabold mb-4 text-green-700">Create Your Account</h2>
      
      <div className="mb-3">
        <input
          className="border p-2 w-full rounded"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          type="text"
          autoComplete="name"
        />
      </div>
      
      <div className="mb-3">
        <input
          className="border p-2 w-full rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          autoComplete="username"
        />
      </div>
      
      <div className="mb-3 relative">
        <input
          className="border p-2 w-full rounded pr-10"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      
      
      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
      >
        Create Account
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  )
}
