import React, { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Container from '@mui/material/Container'
import { formatINR } from '../utils/currency'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

export default function Admin() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('')
  const [msg, setMsg] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/')
    } else {
      fetchProducts()
      // Check if we're editing a product from URL params
      const editId = searchParams.get('edit')
      if (editId) {
        api.get(`/products/${editId}`).then(res => editProduct(res.data)).catch(()=>{})
      }
    }
  }, [role])

  const fetchProducts = () => {
    api.get('/products').then(res => setProducts(res.data))
  }

  const resetForm = () => {
    setName('')
    setPrice('')
    setDescription('')
    setStock('')
    setEditingProduct(null)
  }

  const addProduct = async () => {
    if (!name || !price || !description || !stock) {
      setMsg('Please fill in all fields')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    
    try {
      await api.post('/products', {
        name,
        description,
        // Admin enters INR; store as-is
        price: parseFloat(price),
        stock: parseInt(stock),
      })
      resetForm()
      setMsg('Product added successfully!')
      setTimeout(() => setMsg(''), 3000)
      fetchProducts()
    } catch (error) {
      setMsg('Error adding product')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const editProduct = (product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description)
    // Show INR as-is in the input when editing
    setPrice((product.price ?? '').toString())
    setStock(product.stock.toString())
  }

  const updateProduct = async () => {
    if (!name || !price || !description || !stock) {
      setMsg('Please fill in all fields')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    
    try {
      await api.put(`/products/${editingProduct.id}`, {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
      })
      resetForm()
      setMsg('Product updated successfully!')
      setTimeout(() => setMsg(''), 3000)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      setMsg('Error updating product: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`)
        setMsg('Product deleted successfully!')
        setTimeout(() => setMsg(''), 3000)
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        setMsg('Error deleting product: ' + (error.response?.data?.message || error.message))
        setTimeout(() => setMsg(''), 3000)
      }
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>Admin Dashboard</Typography>
        </Grid>
        <Grid item>
          <Button component={Link} to="/users" variant="contained" color="info" sx={{ mr: 1 }}>Manage Users</Button>
          <Button component={Link} to="/orders" variant="contained" color="secondary">View Orders</Button>
        </Grid>
      </Grid>

      {msg && (
        <Card sx={{ mb: 2, bgcolor: msg.includes('Error') ? '#FEE2E2' : '#E8F5E9' }}>
          <CardContent>
            <Typography color={msg.includes('Error') ? 'error' : 'success.main'}>{msg}</Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Product Name" value={name} onChange={e => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Price" value={price} type="number" inputProps={{ step: '0.01', min: '0' }} onChange={e => setPrice(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Description" value={description} onChange={e => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Stock Quantity" value={stock} type="number" inputProps={{ min: '0' }} onChange={e => setStock(e.target.value)} />
            </Grid>
          </Grid>
          <CardActions>
            <Button variant="contained" color="secondary" onClick={editingProduct ? updateProduct : addProduct}>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
            {editingProduct && <Button variant="outlined" color="inherit" onClick={resetForm}>Cancel</Button>}
          </CardActions>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Current Products</Typography>
          {products.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 6 }}>No products found. Add some products to get started!</Typography>
          ) : (
            <Grid container spacing={2}>
              {products.map(p => (
                <Grid item xs={12} md={6} lg={4} key={p.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>{p.description}</Typography>
                      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Grid item>
                          <Typography sx={{ color: 'secondary.main', fontWeight: 700 }}>{formatINR(p.price)}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography color="text.secondary">Stock: {p.stock}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button fullWidth variant="contained" color="info" onClick={() => editProduct(p)}>Edit Product</Button>
                      <Button fullWidth variant="contained" color="error" onClick={() => deleteProduct(p.id)}>Delete Product</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
