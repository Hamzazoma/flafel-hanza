import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppShell from '@/components/AppShell'
import Home from '@/pages/Home'
import Orders from '@/pages/Orders'
import Success from '@/pages/Success'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/success" element={<Success />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
