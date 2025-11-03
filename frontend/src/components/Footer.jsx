import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid #eee', py: 4, mt: 8 }}>
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} FreshGrocer. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link href="#" underline="hover" color="text.secondary">Privacy</Link>
          <Link href="#" underline="hover" color="text.secondary">Terms</Link>
          <Link href="#" underline="hover" color="text.secondary">Support</Link>
        </Box>
      </Container>
    </Box>
  )
}


