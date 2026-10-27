import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiLock, FiMail } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { CONTAS_DEMO } from '../lib/db';
import { useTitulo } from '../hooks/useTitulo';
import { destinoPadrao, destinoSeguro } from '../lib/navegacao';

export default function Login() {
  useTitulo('Entrar');
  const { usuario, entrar } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  if (usuario) return <Navigate to={destinoSeguro(redirect, destinoPadrao(usuario))} replace />;

  const acessar = (e, s) => {
    try {
      const u = entrar(e, s);
      navigate(destinoSeguro(redirect, destinoPadrao(u)), { replace: true });
    } catch (err) {
      setErro(err.message);
    }
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    setErro('');
    acessar(email, senha);
  };

  const cadastroHref = redirect ? `/cadastro?redirect=${encodeURIComponent(redirect)}` : '/cadastro';

  return (
    <AuthLayout
      titulo="Bem-vindo de volta"
      subtitulo={redirect ? 'Entre na sua conta para continuar o agendamento.' : 'Entre para agendar e acompanhar seus horários.'}
    >
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        {erro && (
          <div className="alert" role="alert"><FiAlertCircle /> {erro}</div>
        )}
        <Campo
          label="E-mail"
          icone={FiMail}
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Campo
          label="Senha"
          icone={FiLock}
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={!email || !senha}>
          Entrar
        </button>
      </form>

      <p className="auth__rodape">
        Ainda não tem conta? <Link to={cadastroHref} className="link">Criar conta grátis</Link>
      </p>

      <div className="auth__demo">
        <p>
          <strong>Quer só testar?</strong> Use uma conta de demonstração. Cliente:{' '}
          {CONTAS_DEMO.cliente.email} / {CONTAS_DEMO.cliente.senha}. Barbearia:{' '}
          {CONTAS_DEMO.admin.email} / {CONTAS_DEMO.admin.senha}.
        </p>
        <div className="auth__demo-botoes">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => acessar(CONTAS_DEMO.cliente.email, CONTAS_DEMO.cliente.senha)}>
            Entrar como cliente
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => acessar(CONTAS_DEMO.admin.email, CONTAS_DEMO.admin.senha)}>
            Entrar como barbearia
          </button>
        </div>
      </div>

      <Link to="/" className="auth__voltar"><FiArrowLeft /> Voltar para o site</Link>
    </AuthLayout>
  );
}
