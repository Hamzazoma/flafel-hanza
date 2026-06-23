import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../src/index.css'
import AdminApp from '../src/admin/AdminApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
