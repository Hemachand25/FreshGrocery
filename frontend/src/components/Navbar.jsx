import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [search, setSearch] = useState('')

  const loadCart = async () => {
    try {
      const api = (await import('../utils/api')).default
      const res = await api.get('/cart')
      const items = res.data || []
      const totalQty = items.reduce((s, it) => s + (it.quantity || 0), 0)
      setCartCount(totalQty)
    } catch (e) {
      setCartCount(0)
    }
  }

  React.useEffect(() => {
    if (token && role === 'ROLE_CUSTOMER') {
      loadCart()
    } else {
      setCartCount(0)
    }
  }, [token, role])

  React.useEffect(() => {
    const onCartUpdated = () => loadCart()
    window.addEventListener('cart-updated', onCartUpdated)
    return () => window.removeEventListener('cart-updated', onCartUpdated)
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleSearch = () => {
    if (!search.trim()) return
    if (role === 'ROLE_ADMIN') {
      navigate(`/admin/search?q=${encodeURIComponent(search)}`)
    } else {
      // Customer or Vendor search products
      navigate(`/products/search?q=${encodeURIComponent(search)}`)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <AppBar color="primary" position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }} component={Link} to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            FreshGrocer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Remove global Products from nav; flow is Vendors -> Vendor Store */}
            {token && role === 'ROLE_CUSTOMER' && <Button color="inherit" component={Link} to="/orders">My Orders</Button>}
            <Button color="inherit" component={Link} to="/vendors">Browse</Button>
            {token && role === 'ROLE_VENDOR' && <Button color="inherit" component={Link} to="/vendor/dashboard">Dashboard</Button>}
            {token && role === 'ROLE_VENDOR' && <Button color="inherit" component={Link} to="/vendor/products">My Products</Button>}
            {token && role === 'ROLE_VENDOR' && <Button color="inherit" component={Link} to="/vendor/orders">Orders</Button>}
            {token && role === 'ROLE_ADMIN' && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
            {token && role === 'ROLE_ADMIN' && <Button color="inherit" component={Link} to="/orders">All Orders</Button>}
            {token && role === 'ROLE_ADMIN' && <Button color="inherit" component={Link} to="/users">Users</Button>}
            {token && role === 'ROLE_ADMIN' && <Button color="inherit" component={Link} to="/admin/vendors">Vendors</Button>}
            {token && <Button color="inherit" component={Link} to="/profile">Profile</Button>}
            {token && role === 'ROLE_CUSTOMER' && (
              <IconButton color="inherit" component={Link} to="/cart" aria-label="Cart">
                <Badge color="secondary" badgeContent={cartCount} invisible={cartCount === 0}>
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}
            {/* Role-based search */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <TextField 
                size="small" 
                variant="outlined" 
                placeholder={role === 'ROLE_ADMIN' ? 'Search vendors' : 'Search products'} 
                value={search} 
                onChange={e=>setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ bgcolor: 'white', borderRadius: 1, minWidth: 200 }} 
              />
              <Button variant="contained" color="secondary" onClick={handleSearch}>Search</Button>
            </Box>

            {!token ? (
              <>
                <Button variant="contained" color="secondary" component={Link} to="/login">Login</Button>
                <Button variant="contained" color="secondary" component={Link} to="/register">Register</Button>
              </>
            ) : (
              <Button color="inherit" onClick={logout}>Logout</Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
