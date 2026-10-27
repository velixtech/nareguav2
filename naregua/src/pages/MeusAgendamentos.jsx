import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiPlus, FiUser, FiX } from 'react-icons/fi';
import Dialogo from '../components/Dialogo';
import { barbeiroPorId } from '../data/barbearia';
import {
  ROTULO_STATUS,
  diaDaSemanaCurto,
  formatarDataLonga,
  formatarMoeda,
  jaPassou,
  linkGoogleAgenda,
  mesCurto,
  podeCancelar,
  resumoServicos,
} from '../lib/agenda';
import * as db from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useTitulo } from '../hooks/useTitulo';
import './MeusAgendamentos.css';

export default function MeusAgendamentos() {
  useTitulo('Meus agendamentos');
  const { usuario } = useAuth();
  const [aba, setAba] = useState('proximos');
  const [versao, setVersao] = useState(0);
  const [cancelando, setCancelando] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const todos = useMemo(() => db.agendamentosDoUsuario(usuario.id), [usuario.id, versao]);
  const proximos = todos.filter((a) => a.status === 'confirmado' && !jaPassou(a));
  const historico = todos.filter((a) => !proximos.includes(a)).reverse();
  const lista = aba === 'proximos' ? proximos : historico;

  const confirmarCancelamento = () => {
    db.atualizarStatus(cancelando.id, 'cancelado');
    setCancelando(null);
    setVersao((v) => v + 1);
  };

  return (
    <div className="page meus">
      <div className="container">
        <header className="page__head meus__head">
          <div>
            <span className="eyebrow">Sua conta</span>
            <h1 className="page__title">Meus agendamentos</h1>
            <p className="muted">Olá, {usuario.nome.split(' ')[0]}. Aqui ficam seus horários marcados e o histórico.</p>
          </div>
          <Link to="/agendar" className="btn btn--primary"><FiPlus /> Novo agendamento</Link>
        </header>

        <div className="abas" role="tablist" aria-label="Filtrar agendamentos">
          <button role="tab" type="button" aria-selected={aba === 'proximos'} className={aba === 'proximos' ? 'is-ativa' : ''} onClick={() => setAba('proximos')}>
            Próximos <span>{proximos.length}</span>
          </button>
          <button role="tab" type="button" aria-selected={aba === 'historico'} className={aba === 'historico' ? 'is-ativa' : ''} onClick={() => setAba('historico')}>
            Histórico <span>{historico.length}</span>
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="empty">
            <FiCalendar />
            <h3>{aba === 'proximos' ? 'Nenhum horário marcado' : 'Nada no histórico ainda'}</h3>
            <p>{aba === 'proximos' ? 'Que tal já deixar o próximo corte garantido?' : 'Seus atendimentos anteriores vão aparecer aqui.'}</p>
            {aba === 'proximos' && <Link to="/agendar" className="btn btn--primary">Agendar agora</Link>}
          </div>
        ) : (
          <ul className="meus__lista">
            {lista.map((a) => {
              const { lista: svs } = resumoServicos(a.servicos);
              return (
                <li key={a.id} className={`agendamento card is-${a.status}`}>
                  <div className="agendamento__data">
                    <span>{diaDaSemanaCurto(a.data)}</span>
                    <strong>{a.data.slice(8)}</strong>
                    <span>{mesCurto(a.data)}</span>
                  </div>
                  <div className="agendamento__info">
                    <div className="agendamento__topo">
                      <h3>{svs.map((s) => s.nome).join(' + ')}</h3>
                      <span className={`badge badge--${a.status}`}>{ROTULO_STATUS[a.status]}</span>
                    </div>
                    <p className="agendamento__meta">
                      <span><FiCalendar /> {formatarDataLonga(a.data)}</span>
                      <span><FiClock /> {a.inicio} às {a.fim}</span>
                      <span><FiUser /> {barbeiroPorId(a.barbeiroId)?.nome}</span>
                    </p>
                  </div>
                  <div className="agendamento__lado">
                    <strong className="agendamento__total">{formatarMoeda(a.total)}</strong>
                    <div className="agendamento__acoes">
                      <Link to={`/agendamento/${a.id}`} className="btn btn--ghost btn--sm">Detalhes</Link>
                      {a.status === 'confirmado' && !jaPassou(a) && (
                        <a href={linkGoogleAgenda(a)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                          <FiCalendar /> Agenda
                        </a>
                      )}
                      {podeCancelar(a) && (
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => setCancelando(a)}>
                          <FiX /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {aba === 'proximos' && proximos.some((a) => !podeCancelar(a)) && (
          <p className="muted meus__nota">Horários a menos de 2 horas não podem ser cancelados pelo site. Fale com a gente no WhatsApp.</p>
        )}
      </div>

      <Dialogo
        aberto={Boolean(cancelando)}
        titulo="Cancelar este horário?"
        confirmar="Sim, cancelar"
        cancelar="Manter horário"
        perigo
        onConfirmar={confirmarCancelamento}
        onFechar={() => setCancelando(null)}
      >
        {cancelando && (
          <p>
            {resumoServicos(cancelando.servicos).lista.map((s) => s.nome).join(' + ')} em{' '}
            {formatarDataLonga(cancelando.data)}, às {cancelando.inicio}. O horário fica livre para outra pessoa.
          </p>
        )}
      </Dialogo>
    </div>
  );
}
