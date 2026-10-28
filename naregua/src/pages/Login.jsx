import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiBriefcase, FiLock, FiMail, FiUser } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { CONTAS_DEMO } from '../lib/db';
import { useTitulo } from '../hooks/useTitulo';
import { destinoPadrao, destinoSeguro } from '../lib/navegacao';

export default function Login() {
  const { usuario, entrar, sair } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const redirect = params.get('redirect');
  const ehBarbearia = params.get('tipo') === 'barbearia';
  useTitulo(ehBarbearia ? 'Acesso da barbearia' : 'Entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const clienteNaAbaBarbearia = usuario && ehBarbearia && usuario.papel !== 'admin';

  if (usuario && !clienteNaAbaBarbearia) {
    const destino = ehBarbearia && usuario.papel === 'admin' ? '/painel' : destinoSeguro(redirect, destinoPadrao(usuario));
    return <Navigate to={destino} replace />;
  }

  const trocarTipo = (barbearia) => {
    setErro('');
    const novos = new URLSearchParams(params);
    if (barbearia) novos.set('tipo', 'barbearia');
    else novos.delete('tipo');
    setParams(novos, { replace: true });
  };

  const acessar = (e, s, comoBarbearia = ehBarbearia) => {
    try {
      const u = entrar(e, s);
      if (comoBarbearia && u.papel !== 'admin') {
        sair();
        setErro('Essa é uma conta de cliente. Use a aba "Sou cliente" para entrar.');
        return;
      }
      const destino = comoBarbearia ? '/painel' : destinoSeguro(redirect, destinoPadrao(u));
      navigate(destino, { replace: true });
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

  let subtitulo = 'Entre para agendar e acompanhar seus horários.';
  if (redirect && !ehBarbearia) subtitulo = 'Entre na sua conta para continuar o agendamento.';
  if (ehBarbearia) subtitulo = 'Gestão e barbeiros entram por aqui. Depois cada um escolhe o seu perfil com PIN.';

  return (
    <AuthLayout titulo={ehBarbearia ? 'Acesso da barbearia' : 'Bem-vindo de volta'} subtitulo={subtitulo}>
      <div className="auth__tipo" role="tablist" aria-label="Tipo de acesso">
        <button
          type="button"
          role="tab"
          aria-selected={!ehBarbearia}
          className={!ehBarbearia ? 'is-ativo' : ''}
          onClick={() => trocarTipo(false)}
        >
          <FiUser /> Sou cliente
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={ehBarbearia}
          className={ehBarbearia ? 'is-ativo' : ''}
          onClick={() => trocarTipo(true)}
        >
          <FiBriefcase /> Sou barbearia
        </button>
      </div>

      {clienteNaAbaBarbearia ? (
        <div className="alert alert--info" role="status">
          <FiAlertCircle />
          <span>
            Você está conectado como cliente ({usuario.nome}). Para entrar na área da barbearia, saia primeiro.{' '}
            <button type="button" className="link" onClick={sair}>
              Sair da conta de cliente
            </button>
          </span>
        </div>
      ) : (
        <form className="auth__form" onSubmit={onSubmit} noValidate>
          {erro && (
            <div className="alert" role="alert">
              <FiAlertCircle /> {erro}
            </div>
          )}
          <Campo
            label={ehBarbearia ? 'E-mail da barbearia' : 'E-mail'}
            icone={FiMail}
            type="email"
            autoComplete="email"
            placeholder={ehBarbearia ? 'contato@suabarbearia.com' : 'voce@email.com'}
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
            {ehBarbearia ? 'Entrar no painel' : 'Entrar'}
          </button>
        </form>
      )}

      {!ehBarbearia && (
        <p className="auth__rodape">
          Ainda não tem conta?{' '}
          <Link to={cadastroHref} className="link">
            Criar conta grátis
          </Link>
        </p>
      )}

      <div className="auth__demo">
        {ehBarbearia ? (
          <>
            <p>
              <strong>Demonstração:</strong> {CONTAS_DEMO.admin.email} / {CONTAS_DEMO.admin.senha}. No painel, o PIN da gestão é
              1234 e o de cada barbeiro aparece na tela de perfis.
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => acessar(CONTAS_DEMO.admin.email, CONTAS_DEMO.admin.senha, true)}
            >
              Entrar com a conta demo da barbearia
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Quer só testar?</strong> Conta demo: {CONTAS_DEMO.cliente.email} / {CONTAS_DEMO.cliente.senha}.
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => acessar(CONTAS_DEMO.cliente.email, CONTAS_DEMO.cliente.senha, false)}
            >
              Entrar como cliente demo
            </button>
          </>
        )}
      </div>

      <Link to="/" className="auth__voltar">
        <FiArrowLeft /> Voltar para o site
      </Link>
    </AuthLayout>
  );
}
