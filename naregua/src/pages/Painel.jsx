import { useState } from 'react';
import { FiBarChart2, FiBriefcase, FiCalendar, FiRepeat, FiUsers } from 'react-icons/fi';
import AgendaDia from '../components/painel/AgendaDia';
import Equipe from '../components/painel/Equipe';
import EscolherPerfil from '../components/painel/EscolherPerfil';
import Relatorio from '../components/painel/Relatorio';
import { barbeiroPorId } from '../data/barbearia';
import * as db from '../lib/db';
import { useTitulo } from '../hooks/useTitulo';
import './Painel.css';

const ABAS_GESTAO = [
  { id: 'agenda', rotulo: 'Agenda', icone: FiCalendar },
  { id: 'relatorios', rotulo: 'Relatórios', icone: FiBarChart2 },
  { id: 'equipe', rotulo: 'Equipe', icone: FiUsers },
];

const ABAS_BARBEIRO = [
  { id: 'agenda', rotulo: 'Minha agenda', icone: FiCalendar },
  { id: 'relatorios', rotulo: 'Ganhos e procedimentos', icone: FiBarChart2 },
];

const perfilValido = (p) => p === 'gestao' || Boolean(barbeiroPorId(p));

export default function Painel() {
  useTitulo('Painel da barbearia');
  const [perfil, setPerfil] = useState(() => {
    const salvo = db.perfilPainel();
    return perfilValido(salvo) ? salvo : null;
  });
  const [aba, setAba] = useState('agenda');
  const [versao, setVersao] = useState(0);

  const entrar = (p) => {
    db.definirPerfilPainel(p);
    setPerfil(p);
    setAba('agenda');
  };

  const trocarPerfil = () => {
    db.limparPerfilPainel();
    setPerfil(null);
  };

  if (!perfil) {
    return (
      <div className="page painel">
        <div className="container">
          <header className="page__head">
            <span className="eyebrow">Área da barbearia</span>
            <h1 className="page__title">Painel</h1>
          </header>
          <EscolherPerfil onEntrar={entrar} />
        </div>
      </div>
    );
  }

  const ehGestao = perfil === 'gestao';
  const barbeiro = ehGestao ? null : barbeiroPorId(perfil);
  const abas = ehGestao ? ABAS_GESTAO : ABAS_BARBEIRO;

  return (
    <div className="page painel">
      <div className="container">
        <header className="page__head painel__head">
          <div>
            <span className="eyebrow">{ehGestao ? 'Gestão da barbearia' : 'Área do barbeiro'}</span>
            <h1 className="page__title">{ehGestao ? 'Painel de gestão' : `Fala, ${barbeiro.nome}!`}</h1>
          </div>
          <div className="perfil-atual">
            {barbeiro ? (
              <img src={barbeiro.img} alt="" />
            ) : (
              <span className="perfil-atual__icone"><FiBriefcase /></span>
            )}
            <div>
              <strong>{ehGestao ? 'Gestão' : barbeiro.nome}</strong>
              <span className="muted">{ehGestao ? 'Acesso completo' : 'Barbeiro'}</span>
            </div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={trocarPerfil}>
              <FiRepeat /> Trocar perfil
            </button>
          </div>
        </header>

        <div className="painel-abas" role="tablist" aria-label="Seções do painel">
          {abas.map((a) => {
            const Icone = a.icone;
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={aba === a.id}
                className={aba === a.id ? 'is-ativa' : ''}
                onClick={() => setAba(a.id)}
              >
                <Icone /> {a.rotulo}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {aba === 'agenda' && <AgendaDia barbeiroId={barbeiro?.id ?? null} versao={versao} />}
          {aba === 'relatorios' && <Relatorio barbeiroId={barbeiro?.id ?? null} versao={versao} />}
          {aba === 'equipe' && ehGestao && <Equipe onDadosAlterados={() => setVersao((v) => v + 1)} />}
        </div>
      </div>
    </div>
  );
}
