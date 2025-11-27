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
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/')
    } 
  }, [role])

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

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Admin Tools</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Vendors</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Add, edit, and block vendors</Typography>
                  <Button fullWidth variant="contained" color="secondary" component={Link} to="/admin/vendors">Manage Vendors</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Users</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>View and block/unblock users</Typography>
                  <Button fullWidth variant="contained" color="secondary" component={Link} to="/users">Manage Users</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Orders</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>View and filter all customer orders</Typography>
                  <Button fullWidth variant="contained" color="secondary" component={Link} to="/orders">View Orders</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}
