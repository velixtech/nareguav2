import { Link } from 'react-router-dom';
import { useTitulo } from '../hooks/useTitulo';

export default function NaoEncontrada() {
  useTitulo('Página não encontrada');
  return (
    <div className="page">
      <div className="container" style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: '1.25rem', paddingBlock: '4rem' }}>
        <span className="tag" style={{ fontSize: '1.6rem', transform: 'rotate(-3deg)' }}>ih, se perdeu?</span>
        <h1 className="display" style={{ fontSize: 'clamp(4rem, 14vw, 9rem)' }}>4<span className="gold">0</span>4</h1>
        <p className="lead">Essa página não existe ou saiu da régua. Bora voltar pro começo?</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn--primary">Ir para o início</Link>
          <Link to="/agendar" className="btn btn--ghost">Agendar horário</Link>
        </div>
      </div>
    </div>
  );
}
