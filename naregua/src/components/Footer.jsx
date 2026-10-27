import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import Logo from './Logo';
import { barbearia } from '../data/barbearia';
import { linkMapa, linkWhatsApp } from '../lib/agenda';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__topo">
          <div className="footer__marca">
            <Logo />
            <p className="muted">{barbearia.slogan}</p>
            <div className="footer__sociais">
              <a href={barbearia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram da NaRégua">
                <FaInstagram />
              </a>
              <a href={linkWhatsApp('Salve! Vim pelo site da NaRégua.')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da NaRégua">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <h3>Navegação</h3>
            <Link to={{ pathname: '/', hash: '#servicos' }}>Serviços e preços</Link>
            <Link to={{ pathname: '/', hash: '#equipe' }}>Equipe</Link>
            <Link to={{ pathname: '/', hash: '#galeria' }}>Galeria</Link>
            <Link to="/agendar">Agendar horário</Link>
          </div>

          <div className="footer__col">
            <h3>Sua conta</h3>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Criar conta</Link>
            <Link to="/meus-agendamentos">Meus agendamentos</Link>
            <Link to="/barbearia">Área da barbearia</Link>
          </div>

          <div className="footer__col">
            <h3>Contato</h3>
            <a href={linkMapa()} target="_blank" rel="noopener noreferrer"><FiMapPin /> {barbearia.endereco.rua}, {barbearia.endereco.cidade}</a>
            <a href={`tel:+${barbearia.whatsapp}`}><FiPhone /> {barbearia.telefone}</a>
            <span className="muted">Seg a Sáb, 8h às 18h</span>
          </div>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} {barbearia.nome}. Todos os direitos reservados.</span>
          <span className="tag">fica na régua, mano.</span>
        </div>
      </div>
    </footer>
  );
}
