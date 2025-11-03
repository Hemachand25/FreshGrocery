import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'

export default function Landing() {
  const [userInfo, setUserInfo] = useState(null)
  const [cartTotal, setCartTotal] = useState(0)
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (token) {
      // Fetch user's cart total for customers
      if (role === 'ROLE_CUSTOMER') {
        fetchCartTotal()
      }
    }
  }, [token, role])

  const fetchCartTotal = async () => {
    try {
      const response = await api.get('/cart')
      const cartItems = response.data
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      setCartTotal(total)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  // Admin landing page
  if (token && role === 'ROLE_ADMIN') {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #FFF7F0, #FFE8D6)' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, textAlign: 'center' }}>Welcome to FreshGrocer</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }}>
          Manage products, view orders, and oversee your grocery store operations.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button component={Link} to="/admin" variant="contained" color="secondary">Manage Products</Button>
          <Button component={Link} to="/orders" variant="contained" color="primary">All Orders</Button>
          <Button component={Link} to="/users" variant="outlined" color="secondary">Users</Button>
        </Box>
        <Grid container spacing={3} sx={{ maxWidth: 900, px: 2 }}>
          {[
            { icon: '📦', title: 'Product Management', text: 'Add, edit, and manage your product inventory.' },
            { icon: '📊', title: 'Order Analytics', text: 'Track sales and customer orders in real-time.' },
            { icon: '⚙️', title: 'Store Settings', text: 'Configure store settings and manage operations.' }
          ].map((c, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontSize: 32, mb: 1 }}>{c.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{c.title}</Typography>
                  <Typography color="text.secondary">{c.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Customer landing page
  if (token && role === 'ROLE_CUSTOMER') {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #FFF7F0, #FFE8D6)' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, textAlign: 'center' }}>Welcome to FreshGrocer</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }}>
          Get the freshest groceries delivered to your doorstep. Shop from a wide range of fruits, vegetables, and daily essentials.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button component={Link} to="/products" variant="contained" color="secondary">Shop Now</Button>
          <Button component={Link} to="/cart" variant="outlined" color="secondary">View Cart {cartTotal > 0 && `(₹${Math.round(cartTotal).toLocaleString('en-IN')})`}</Button>
          <Button component={Link} to="/orders" variant="contained" color="primary">My Orders</Button>
        </Box>
        <Grid container spacing={3} sx={{ maxWidth: 900, px: 2 }}>
          {[
            { icon: '🛒', title: 'Wide Selection', text: 'Choose from hundreds of products, from fresh produce to pantry staples.' },
            { icon: '🚚', title: 'Fast Delivery', text: 'Get your groceries delivered within hours, right to your door.' },
            { icon: '💳', title: 'Easy Payment', text: 'Pay securely online with multiple payment options.' }
          ].map((c, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontSize: 32, mb: 1 }}>{c.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{c.title}</Typography>
                  <Typography color="text.secondary">{c.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Guest landing page
  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #FFF7F0, #FFE8D6)' }}>
      <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main', mb: 2, textAlign: 'center' }}>Welcome to FreshGrocer</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }}>
        Get the freshest groceries delivered to your doorstep. Shop from a wide range of fruits, vegetables, and daily essentials.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button component={Link} to="/products" variant="contained" color="secondary">Shop Now</Button>
        <Button component={Link} to="/register" variant="contained" color="secondary">Register</Button>
        <Button component={Link} to="/login" variant="contained" color="secondary">Login</Button>
      </Box>
      <Grid container spacing={3} sx={{ maxWidth: 900, px: 2 }}>
        {[
          { icon: '🛒', title: 'Wide Selection', text: 'Choose from hundreds of products, from fresh produce to pantry staples.' },
          { icon: '🚚', title: 'Fast Delivery', text: 'Get your groceries delivered within hours, right to your door.' },
          { icon: '💳', title: 'Easy Payment', text: 'Pay securely online with multiple payment options.' }
        ].map((c, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: 32, mb: 1 }}>{c.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{c.title}</Typography>
                <Typography color="text.secondary">{c.text}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}