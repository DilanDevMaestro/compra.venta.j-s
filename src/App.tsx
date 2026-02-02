import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CategoryPage } from './pages/CategoryPage'
import { PublicarPage } from './pages/PublicarPage'
import { PublicationDetailPage } from './pages/PublicationDetailPage'
import { AuthPage } from './pages/AuthPage'
import { PerfilPage } from './pages/PerfilPage'
import { DestacadosPage } from './pages/DestacadosPage'
import { OfertasPage } from './pages/OfertasPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categoria/:categorySlug" element={<CategoryPage />} />
      <Route path="/publicar" element={<PublicarPage />} />
      <Route path="/publicacion/:id" element={<PublicationDetailPage />} />
      <Route path="/destacados" element={<DestacadosPage />} />
      <Route path="/ofertas" element={<OfertasPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/callback" element={<AuthPage />} />
      <Route path="/perfil" element={<PerfilPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
