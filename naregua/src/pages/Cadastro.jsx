import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { useTitulo } from '../hooks/useTitulo';
import { destinoPadrao, destinoSeguro } from '../lib/navegacao';

const mascaraTelefone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validar(f) {
  const erros = {};
  if (f.nome.trim().length < 2) erros.nome = 'Diz pra gente como te chamar.';
  if (!EMAIL_RE.test(f.email.trim())) erros.email = 'Digite um e-mail válido.';
  if (f.telefone.replace(/\D/g, '').length < 10) erros.telefone = 'Digite o WhatsApp com DDD.';
  if (f.senha.length < 6) erros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
  if (f.confirmar !== f.senha) erros.confirmar = 'As senhas não são iguais.';
  return erros;
}

export default function Cadastro() {
  useTitulo('Criar conta');
  const { usuario, cadastrar } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect');
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmar: '' });
  const [erros, setErros] = useState({});
  const [tentou, setTentou] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  if (usuario) return <Navigate to={destinoSeguro(redirect, destinoPadrao(usuario))} replace />;

  const mudar = (campo) => (e) => {
    const valor = campo === 'telefone' ? mascaraTelefone(e.target.value) : e.target.value;
    const novo = { ...form, [campo]: valor };
    setForm(novo);
    if (tentou) setErros(validar(novo));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setTentou(true);
    setErroGeral('');
    const v = validar(form);
    setErros(v);
    if (Object.keys(v).length) return;
    try {
      const u = cadastrar(form);
      navigate(destinoSeguro(redirect, destinoPadrao(u)), { replace: true });
    } catch (err) {
      setErroGeral(err.message);
    }
  };

  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';

  return (
    <AuthLayout titulo="Crie sua conta" subtitulo="Leva 30 segundos. Depois é só agendar quando quiser.">
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        {erroGeral && (
          <div className="alert" role="alert">
            <FiAlertCircle /> <span>{erroGeral} <Link to={loginHref} className="link">Ir para o login</Link></span>
          </div>
        )}
        <Campo label="Nome" icone={FiUser} autoComplete="name" placeholder="Como te chamam?" value={form.nome} onChange={mudar('nome')} erro={erros.nome} />
        <Campo label="E-mail" icone={FiMail} type="email" autoComplete="email" placeholder="voce@email.com" value={form.email} onChange={mudar('email')} erro={erros.email} />
        <Campo label="WhatsApp" icone={FiPhone} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(61) 99999-9999" value={form.telefone} onChange={mudar('telefone')} erro={erros.telefone} dica="Usamos só para avisos do seu horário." />
        <Campo label="Senha" icone={FiLock} type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" value={form.senha} onChange={mudar('senha')} erro={erros.senha} />
        <Campo label="Confirme a senha" icone={FiLock} type="password" autoComplete="new-password" placeholder="Repita a senha" value={form.confirmar} onChange={mudar('confirmar')} erro={erros.confirmar} />
        <button type="submit" className="btn btn--primary btn--lg btn--block">Criar conta</button>
      </form>

      <p className="auth__rodape">
        Já tem conta? <Link to={loginHref} className="link">Entrar</Link>
      </p>
      <Link to="/" className="auth__voltar"><FiArrowLeft /> Voltar para o site</Link>
    </AuthLayout>
  );
}
