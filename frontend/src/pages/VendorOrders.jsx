import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { formatINR } from '../utils/currency'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

export default function VendorOrders() {
  const [vendorOrders, setVendorOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_VENDOR') {
      navigate('/')
    } else {
      fetchOrders()
    }
  }, [role])

  const fetchOrders = async () => {
    try {
      const res = await api.get('/vendor/orders')
      setVendorOrders(res.data || [])
      if (res.data && res.data.length === 0) {
        setMsg('No orders found. Orders will appear here when customers place orders with your products.')
        setTimeout(() => setMsg(''), 5000)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Error fetching orders'
      setMsg('Error: ' + (typeof errorMsg === 'string' ? errorMsg : 'Failed to load orders'))
      setTimeout(() => setMsg(''), 5000)
      setVendorOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (vendorOrderId, newStatus) => {
    try {
      await api.put(`/vendor/orders/${vendorOrderId}/status`, null, { params: { status: newStatus } })
      setMsg('Order status updated successfully!')
      setTimeout(() => setMsg(''), 3000)
      fetchOrders()
    } catch (error) {
      setMsg('Error updating order status: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'warning',
      ACCEPTED: 'info',
      PREPARING: 'info',
      READY: 'primary',
      OUT_FOR_DELIVERY: 'secondary',
      DELIVERED: 'success',
      CANCELLED: 'error'
    }
    return colors[status] || 'default'
  }

  const getNextStatus = (currentStatus) => {
    const workflow = {
      PLACED: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED']
    }
    return workflow[currentStatus] || []
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading orders...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 4 }}>
        My Orders
      </Typography>

      {msg && (
        <Card sx={{ mb: 2, bgcolor: msg.includes('Error') ? '#FEE2E2' : '#E8F5E9' }}>
          <CardContent>
            <Typography color={msg.includes('Error') ? 'error' : 'success.main'}>{msg}</Typography>
          </CardContent>
        </Card>
      )}

      {vendorOrders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No orders found.</Typography>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vendorOrders.map(vo => (
            <Card key={vo.id} sx={{ mb: 2 }}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Order #{vo.order?.id || vo.id}
                    </Typography>
                    {vo.order?.user && (
                      <Typography color="text.secondary" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                        Customer: {vo.order.user.fullName || vo.order.user.email}
                      </Typography>
                    )}
                    <Typography color="text.secondary" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                      {vo.updatedAt && new Date(vo.updatedAt).toLocaleString()}
                    </Typography>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Typography
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: `${getStatusColor(vo.status)}.light`,
                        color: `${getStatusColor(vo.status)}.dark`,
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        display: 'inline-block',
                        mb: 1
                      }}
                    >
                      {vo.status}
                    </Typography>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Items:</Typography>
                  {vo.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Typography>
                        {item.product?.name} x {item.quantity}
                      </Typography>
                      <Typography color="text.secondary">
                        {formatINR(item.priceAtPurchase)} each
                      </Typography>
                    </div>
                  ))}
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, textAlign: 'right' }}>
                    Total: {formatINR(vo.items?.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0) || 0)}
                  </Typography>
                </div>

                {vo.status !== 'DELIVERED' && vo.status !== 'CANCELLED' && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value=""
                      label="Update Status"
                      onChange={(e) => updateStatus(vo.id, e.target.value)}
                    >
                      {getNextStatus(vo.status).map(next => (
                        <MenuItem key={next} value={next}>
                          {next.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}

