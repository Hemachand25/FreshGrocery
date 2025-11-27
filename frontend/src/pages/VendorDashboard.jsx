import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { formatINR } from '../utils/currency'

export default function VendorDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pendingOrders: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_VENDOR') {
      navigate('/')
    } else {
      fetchStats()
    }
  }, [role])

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products/vendor'),
        api.get('/vendor/orders')
      ])
      setStats({
        products: productsRes.data.length,
        orders: ordersRes.data.length,
        pendingOrders: ordersRes.data.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 4 }}>
        Vendor Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.products}
            </Typography>
            <Typography color="text.secondary">Total Products</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {stats.orders}
            </Typography>
            <Typography color="text.secondary">Total Orders</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
              {stats.pendingOrders}
            </Typography>
            <Typography color="text.secondary">Pending Orders</Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button component={Link} to="/vendor/products" variant="contained" color="primary" fullWidth>
                Manage Products
              </Button>
              <Button component={Link} to="/vendor/orders" variant="contained" color="secondary" fullWidth>
                View Orders
              </Button>
              <Button component={Link} to="/products" variant="outlined" color="primary" fullWidth>
                Browse All Products
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Welcome!</Typography>
            <Typography color="text.secondary" paragraph>
              Manage your products, track orders, and grow your business with FreshGrocer.
              Use the quick actions above to get started.
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

