import arte from '../assets/img/ilustra-espelho.webp';
import Logo from './Logo';
import './AuthLayout.css';

export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth">
      <aside className="auth__arte" aria-hidden="true">
        <img src={arte} alt="" />
        <div className="auth__arte-texto">
          <p className="tag">fica na régua</p>
          <p className="auth__frase">Seu horário, seu barbeiro, sem fila.</p>
        </div>
      </aside>
      <main className="auth__painel">
        <div className="auth__caixa">
          <Logo />
          <div className="auth__cabecalho">
            <h1>{titulo}</h1>
            {subtitulo && <p className="muted">{subtitulo}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
