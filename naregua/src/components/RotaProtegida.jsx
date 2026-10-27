import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RotaProtegida({ children, somenteAdmin = false }) {
  const { usuario, ehAdmin } = useAuth();
  const location = useLocation();

  if (!usuario) {
    const destino = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(destino)}`} replace />;
  }
  if (somenteAdmin && !ehAdmin) return <Navigate to="/meus-agendamentos" replace />;
  return children;
}
