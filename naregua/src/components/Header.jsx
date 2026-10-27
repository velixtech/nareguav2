import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiCalendar, FiChevronDown, FiGrid, FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const ANCORAS = [
  { hash: '#sobre', rotulo: 'Sobre' },
  { hash: '#servicos', rotulo: 'Serviços' },
  { hash: '#equipe', rotulo: 'Equipe' },
  { hash: '#galeria', rotulo: 'Galeria' },
  { hash: '#contato', rotulo: 'Contato' },
];

const iniciais = (nome = '') =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export default function Header() {
  const { usuario, ehAdmin, sair } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const contaRef = useRef(null);

  const naHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha menus ao navegar.
  useEffect(() => {
    setMenuAberto(false);
    setContaAberta(false);
  }, [pathname]);

  // Trava a rolagem com o menu mobile aberto e fecha com Esc.
  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && (setMenuAberto(false), setContaAberta(false));
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuAberto]);

  useEffect(() => {
    if (!contaAberta) return undefined;
    const fora = (e) => !contaRef.current?.contains(e.target) && setContaAberta(false);
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [contaAberta]);

  const fazerLogout = () => {
    sair();
    setMenuAberto(false);
    navigate('/');
  };

  const solido = rolou || !naHome || menuAberto;

  return (
    <>
      <header className={`header ${solido ? 'header--solido' : ''}`}>
        <div className="container header__inner">
          <Logo />
  
          <nav className="header__nav" aria-label="Seções do site">
            {ANCORAS.map((a) => (
              <Link key={a.hash} to={{ pathname: '/', hash: a.hash }} className="header__link">
                {a.rotulo}
              </Link>
            ))}
          </nav>
  
          <div className="header__acoes">
            {usuario ? (
              <div className="conta" ref={contaRef}>
                <button
                  type="button"
                  className="conta__botao"
                  aria-expanded={contaAberta}
                  aria-haspopup="menu"
                  onClick={() => setContaAberta((v) => !v)}
                >
                  <span className="avatar" aria-hidden="true">{iniciais(usuario.nome)}</span>
                  <span className="conta__nome">{usuario.nome.split(' ')[0]}</span>
                  <FiChevronDown className={`conta__seta ${contaAberta ? 'is-open' : ''}`} />
                </button>
                {contaAberta && (
                  <div className="conta__menu" role="menu">
                    <div className="conta__info">
                      <strong>{usuario.nome}</strong>
                      <span>{usuario.email}</span>
                    </div>
                    {ehAdmin && (
                      <Link role="menuitem" to="/painel"><FiGrid /> Painel da barbearia</Link>
                    )}
                    <Link role="menuitem" to="/meus-agendamentos"><FiCalendar /> Meus agendamentos</Link>
                    <button role="menuitem" type="button" onClick={fazerLogout}><FiLogOut /> Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header__entrar">
                <FiUser /> Entrar
              </Link>
            )}
            <Link to="/agendar" className="btn btn--primary btn--sm header__cta">
              Agendar horário
            </Link>
            <button
              type="button"
              className="header__burger"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              onClick={() => setMenuAberto((v) => !v)}
            >
              {menuAberto ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      <div id="menu-mobile" className={`drawer ${menuAberto ? 'is-open' : ''}`} hidden={!menuAberto}>
        <nav className="drawer__nav" aria-label="Menu">
          {ANCORAS.map((a, i) => (
            <Link
              key={a.hash}
              to={{ pathname: '/', hash: a.hash }}
              onClick={() => setMenuAberto(false)}
              style={{ '--i': i }}
            >
              {a.rotulo}
            </Link>
          ))}
        </nav>
        <div className="drawer__conta">
          {usuario ? (
            <>
              <p className="muted">Olá, <strong>{usuario.nome.split(' ')[0]}</strong></p>
              {ehAdmin && <NavLink to="/painel" className="btn btn--ghost btn--block"><FiGrid /> Painel da barbearia</NavLink>}
              <NavLink to="/meus-agendamentos" className="btn btn--ghost btn--block"><FiCalendar /> Meus agendamentos</NavLink>
              <button type="button" className="btn btn--ghost btn--block" onClick={fazerLogout}><FiLogOut /> Sair</button>
            </>
          ) : (
            <Link to="/login" className="btn btn--ghost btn--block"><FiUser /> Entrar ou criar conta</Link>
          )}
          <Link to="/agendar" className="btn btn--primary btn--block btn--lg">Agendar horário</Link>
        </div>
      </div>
    </>
  );
}
