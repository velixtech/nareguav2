import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RotaProtegida from './components/RotaProtegida';
import ScrollManager from './components/ScrollManager';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';

const Login = lazy(() => import('./pages/Login'));
const Cadastro = lazy(() => import('./pages/Cadastro'));
const Agendar = lazy(() => import('./pages/Agendar'));
const Confirmacao = lazy(() => import('./pages/Confirmacao'));
const MeusAgendamentos = lazy(() => import('./pages/MeusAgendamentos'));
const Painel = lazy(() => import('./pages/Painel'));
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada'));

function LayoutSite() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="carregando" aria-label="Carregando" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

const protegida = (el, somenteAdmin) => <RotaProtegida somenteAdmin={somenteAdmin}>{el}</RotaProtegida>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route element={<LayoutSite />}>
            <Route index element={<Home />} />
            <Route path="agendar" element={protegida(<Agendar />)} />
            <Route path="agendamento/:id" element={protegida(<Confirmacao />)} />
            <Route path="meus-agendamentos" element={protegida(<MeusAgendamentos />)} />
            <Route path="painel" element={protegida(<Painel />, true)} />
            {/* Endereços antigos do site */}
            <Route path="barbearia" element={<Navigate to="/login?tipo=barbearia" replace />} />
            <Route path="Agendamento" element={<Navigate to="/agendar" replace />} />
            <Route path="Final" element={<Navigate to="/meus-agendamentos" replace />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
          <Route
            path="login"
            element={<Suspense fallback={null}><Login /></Suspense>}
          />
          <Route
            path="cadastro"
            element={<Suspense fallback={null}><Cadastro /></Suspense>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
