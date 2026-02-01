import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CategoryPage } from './pages/CategoryPage'
import { PublicarPage } from './pages/PublicarPage'
import { PublicationDetailPage } from './pages/PublicationDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
      <Route path="/publicar" element={<PublicarPage />} />
      <Route path="/publicacion/:id" element={<PublicationDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
