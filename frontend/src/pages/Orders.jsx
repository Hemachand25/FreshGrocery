import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import { formatINR } from '../utils/currency'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [msg, setMsg] = useState('')
  const { userId } = useParams()
  const role = localStorage.getItem('role')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | ACTIVE | COMPLETED

  useEffect(() => {
    fetchOrders()
  }, [userId, currentPage, statusFilter])

  const fetchOrders = async () => {
    try {
      let endpoint = '/orders'
      if (userId && role === 'ROLE_ADMIN') {
        endpoint = `/orders/user/${userId}`
        // Fetch user info for admin view
        try {
          const userRes = await api.get(`/users/all`)
          const user = userRes.data.find(u => u.id === parseInt(userId))
          setUserInfo(user)
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      } else if (role === 'ROLE_ADMIN') {
        if (statusFilter !== 'ALL') {
          endpoint = `/orders/all/status?status=${statusFilter}&page=${currentPage}&size=10`
        } else {
          endpoint = `/orders/all?page=${currentPage}&size=10`
        }
      }
      
      const res = await api.get(endpoint)
      
      if (role === 'ROLE_ADMIN' && !userId) {
        // Handle paginated response for admin all orders
        setOrders((res.data.content || []).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)))
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
      } else {
        // Handle regular list response
        setOrders((res.data || []).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)))
        setTotalPages(0)
        setTotalElements(res.data.length)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const markAsDelivered = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/status`, null, { params: { status: 'COMPLETED' } })
      setMsg('Order marked as delivered')
      setTimeout(() => setMsg(''), 3000)
      fetchOrders() // Refresh orders
    } catch (error) {
      setMsg('Error updating order status')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-700">
        {userId && role === 'ROLE_ADMIN' ? `Orders for ${userInfo?.fullName || 'User'}` : 
         role === 'ROLE_ADMIN' ? 'All Orders' : 'My Orders'}
      </h2>
      {role === 'ROLE_ADMIN' && !userId && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <button onClick={() => { setStatusFilter('ALL'); setCurrentPage(0) }} className={`px-3 py-1 rounded border ${statusFilter==='ALL' ? 'bg-orange-600 text-white' : 'hover:bg-gray-50'}`}>All</button>
          <button onClick={() => { setStatusFilter('ACTIVE'); setCurrentPage(0) }} className={`px-3 py-1 rounded border ${statusFilter==='ACTIVE' ? 'bg-orange-600 text-white' : 'hover:bg-gray-50'}`}>Active</button>
          <button onClick={() => { setStatusFilter('COMPLETED'); setCurrentPage(0) }} className={`px-3 py-1 rounded border ${statusFilter==='COMPLETED' ? 'bg-orange-600 text-white' : 'hover:bg-gray-50'}`}>Completed</button>
        </div>
      )}
      
      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}
      
      {userInfo && role === 'ROLE_ADMIN' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <h3 className="font-semibold text-blue-800">Customer Information</h3>
          <p className="text-blue-700">Name: {userInfo.fullName}</p>
          <p className="text-blue-700">Email: {userInfo.email}</p>
          <p className="text-blue-700">Status: 
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              userInfo.deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {userInfo.deleted ? 'Blocked' : 'Active'}
            </span>
          </p>
        </div>
      )}
      
      {role === 'ROLE_ADMIN' && !userId && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
          <p className="text-gray-700">Showing {orders.length} of {totalElements} orders</p>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-white shadow rounded p-8 text-center">
          <p className="text-gray-600 text-lg">
            {userId && role === 'ROLE_ADMIN' ? 'This user has no orders.' : 
             role === 'ROLE_ADMIN' ? 'No orders found.' : 'You have no orders yet.'}
          </p>
          {role === 'ROLE_CUSTOMER' && (
            <p className="text-gray-500 mt-2">Start shopping to see your orders here!</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white shadow rounded p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {role === 'ROLE_ADMIN' && order.user && !userId && (
                      <p className="text-blue-600 text-sm mt-1">
                        Customer: {order.user.email}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Delivered' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-orange-700">
                      {formatINR(order.total)}
                    </p>
                    {role === 'ROLE_ADMIN' && order.status === 'ACTIVE' && (
                      <button
                        onClick={() => markAsDelivered(order.id)}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="space-y-1">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-center py-1">
                        <span className="text-gray-700">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="text-gray-600">
                          {formatINR(item.priceAtPurchase)} each
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for admin all orders */}
          {role === 'ROLE_ADMIN' && !userId && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded border ${
                      currentPage === i ? 'bg-green-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}
