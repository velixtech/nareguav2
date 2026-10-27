import { Link } from 'react-router-dom';
import logo from '../assets/img/logo.webp';
import './Logo.css';

export default function Logo({ compacto = false, ...props }) {
  return (
    <Link to="/" className="logo" aria-label="NaRégua Barbearia, página inicial" {...props}>
      <img src={logo} alt="" width="44" height="45" className="logo__img" />
      {!compacto && (
        <span className="logo__texto">
          <span>Na<span className="gold">Régua</span></span>
          <small>Barbearia</small>
        </span>
      )}
    </Link>
  );
}
