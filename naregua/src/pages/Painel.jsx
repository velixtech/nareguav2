import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiPercent,
  FiRefreshCw,
  FiUserX,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import Dialogo from '../components/Dialogo';
import { barbeiros } from '../data/barbearia';
import {
  ROTULO_STATUS,
  chaveData,
  dataDeChave,
  expedienteDoDia,
  formatarDataLonga,
  formatarMoeda,
  hojeChave,
  paraMinutos,
  resumoServicos,
  somarDias,
} from '../lib/agenda';
import * as db from '../lib/db';
import { useTitulo } from '../hooks/useTitulo';
import './Painel.css';

const ACOES = {
  concluido: { rotulo: 'Concluir', icone: FiCheck, classe: 'acao--ok' },
  faltou: { rotulo: 'Faltou', icone: FiUserX, classe: 'acao--faltou' },
  cancelado: { rotulo: 'Cancelar', icone: FiX, classe: 'acao--cancelar' },
};

const soNumeros = (t = '') => t.replace(/\D/g, '');

export default function Painel() {
  useTitulo('Painel da barbearia');
  const [data, setData] = useState(hojeChave);
  const [filtro, setFiltro] = useState('todos');
  const [versao, setVersao] = useState(0);
  const [confirmarAcao, setConfirmarAcao] = useState(null);
  const [restaurar, setRestaurar] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doDia = useMemo(() => db.agendamentosDoDia(data), [data, versao]);
  const expediente = expedienteDoDia(data);

  const ativos = doDia.filter((a) => a.status === 'confirmado' || a.status === 'concluido');
  const faturamento = ativos.reduce((s, a) => s + a.total, 0);
  const concluidos = doDia.filter((a) => a.status === 'concluido').length;
  const minutosAbertos = expediente ? paraMinutos(expediente.fecha) - paraMinutos(expediente.abre) : 0;
  const ocupados = ativos.reduce((s, a) => s + (paraMinutos(a.fim) - paraMinutos(a.inicio)), 0);
  const ocupacao = minutosAbertos ? Math.round((ocupados / (minutosAbertos * barbeiros.length)) * 100) : 0;

  const colunas = barbeiros.filter((b) => filtro === 'todos' || b.id === filtro);

  const mudarDia = (n) => setData((d) => chaveData(somarDias(dataDeChave(d), n)));

  const aplicarAcao = () => {
    db.atualizarStatus(confirmarAcao.agendamento.id, confirmarAcao.status);
    setConfirmarAcao(null);
    setVersao((v) => v + 1);
  };

  const restaurarDemo = () => {
    db.popularDemo({ forcar: true });
    setRestaurar(false);
    setVersao((v) => v + 1);
  };

  return (
    <div className="page painel">
      <div className="container">
        <header className="page__head painel__head">
          <div>
            <span className="eyebrow">Área da barbearia</span>
            <h1 className="page__title">Painel de agendamentos</h1>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRestaurar(true)}>
            <FiRefreshCw /> Restaurar dados demo
          </button>
        </header>

        <div className="painel__barra card">
          <div className="painel__dia">
            <button type="button" className="icone-btn" onClick={() => mudarDia(-1)} aria-label="Dia anterior"><FiChevronLeft /></button>
            <div className="painel__dia-texto">
              <strong>{formatarDataLonga(data)}</strong>
              <span className="muted">{data === hojeChave() ? 'Hoje' : dataDeChave(data).toLocaleDateString('pt-BR')}</span>
            </div>
            <button type="button" className="icone-btn" onClick={() => mudarDia(1)} aria-label="Próximo dia"><FiChevronRight /></button>
          </div>
          <div className="painel__dia-acoes">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setData(hojeChave())} disabled={data === hojeChave()}>Hoje</button>
            <label className="painel__data-input">
              <span className="visually-hidden">Ir para a data</span>
              <FiCalendar aria-hidden="true" />
              <input type="date" value={data} onChange={(e) => e.target.value && setData(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="kpis">
          <div className="kpi card">
            <span className="kpi__icone"><FiCalendar /></span>
            <span className="kpi__rotulo">Agendamentos</span>
            <strong className="kpi__valor">{ativos.length}</strong>
            <span className="kpi__extra">{concluidos} concluídos</span>
          </div>
          <div className="kpi card">
            <span className="kpi__icone"><FiDollarSign /></span>
            <span className="kpi__rotulo">Faturamento previsto</span>
            <strong className="kpi__valor">{formatarMoeda(faturamento)}</strong>
            <span className="kpi__extra">ticket médio {formatarMoeda(ativos.length ? faturamento / ativos.length : 0)}</span>
          </div>
          <div className="kpi card">
            <span className="kpi__icone"><FiPercent /></span>
            <span className="kpi__rotulo">Ocupação da agenda</span>
            <strong className="kpi__valor">{ocupacao}%</strong>
            <span className="kpi__barra"><span style={{ width: `${Math.min(ocupacao, 100)}%` }} /></span>
          </div>
          <div className="kpi card">
            <span className="kpi__icone"><FiUsers /></span>
            <span className="kpi__rotulo">Cancelados / faltas</span>
            <strong className="kpi__valor">{doDia.length - ativos.length}</strong>
            <span className="kpi__extra">no dia</span>
          </div>
        </div>

        <div className="chips" role="group" aria-label="Filtrar por barbeiro">
          {[{ id: 'todos', nome: 'Todos' }, ...barbeiros].map((b) => (
            <button key={b.id} type="button" className={`chip ${filtro === b.id ? 'is-ativo' : ''}`} aria-pressed={filtro === b.id} onClick={() => setFiltro(b.id)}>
              {b.img && <img src={b.img} alt="" />}
              {b.nome}
              <span>{doDia.filter((a) => (b.id === 'todos' || a.barbeiroId === b.id) && a.status !== 'cancelado').length}</span>
            </button>
          ))}
        </div>

        {!expediente ? (
          <div className="empty">
            <FiCalendar />
            <h3>Barbearia fechada neste dia</h3>
            <p>Domingo é dia de descanso. Navegue para outro dia para ver a agenda.</p>
          </div>
        ) : (
          <div className="quadro">
            {colunas.map((b) => {
              const itens = doDia.filter((a) => a.barbeiroId === b.id);
              return (
                <section key={b.id} className="coluna">
                  <header className="coluna__head">
                    <img src={b.img} alt="" />
                    <div>
                      <strong>{b.nome}</strong>
                      <span className="muted">{itens.filter((a) => a.status !== 'cancelado').length} na agenda</span>
                    </div>
                  </header>
                  {itens.length === 0 ? (
                    <p className="coluna__vazia muted">Agenda livre neste dia.</p>
                  ) : (
                    <ul className="coluna__lista">
                      {itens.map((a) => {
                        const cliente = db.usuarioPorId(a.usuarioId);
                        const { lista } = resumoServicos(a.servicos);
                        return (
                          <li key={a.id} className={`item is-${a.status}`}>
                            <div className="item__topo">
                              <span className="item__hora">{a.inicio}<small> – {a.fim}</small></span>
                              <span className={`badge badge--${a.status}`}>{ROTULO_STATUS[a.status]}</span>
                            </div>
                            <Link to={`/agendamento/${a.id}`} className="item__cliente">{cliente?.nome ?? 'Cliente'}</Link>
                            <p className="item__servicos">{lista.map((s) => s.nome).join(' + ')} · <strong>{formatarMoeda(a.total)}</strong></p>
                            {a.observacao && <p className="item__obs">“{a.observacao}”</p>}
                            <div className="item__acoes">
                              {cliente?.telefone && (
                                <a
                                  href={`https://wa.me/55${soNumeros(cliente.telefone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="acao acao--whats"
                                  aria-label={`WhatsApp de ${cliente.nome}`}
                                >
                                  <FaWhatsapp />
                                </a>
                              )}
                              {a.status === 'confirmado' &&
                                Object.entries(ACOES).map(([status, acao]) => {
                                  const Icone = acao.icone;
                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      className={`acao ${acao.classe}`}
                                      onClick={() => setConfirmarAcao({ agendamento: a, status, cliente })}
                                    >
                                      <Icone /> {acao.rotulo}
                                    </button>
                                  );
                                })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <Dialogo
        aberto={Boolean(confirmarAcao)}
        titulo={confirmarAcao ? `${ACOES[confirmarAcao.status].rotulo} atendimento?` : ''}
        confirmar={confirmarAcao ? ACOES[confirmarAcao.status].rotulo : 'Confirmar'}
        perigo={confirmarAcao?.status === 'cancelado'}
        onConfirmar={aplicarAcao}
        onFechar={() => setConfirmarAcao(null)}
      >
        {confirmarAcao && (
          <p>
            {confirmarAcao.cliente?.nome ?? 'Cliente'}, às {confirmarAcao.agendamento.inicio}. O status vai mudar para
            “{ROTULO_STATUS[confirmarAcao.status]}”.
          </p>
        )}
      </Dialogo>

      <Dialogo
        aberto={restaurar}
        titulo="Restaurar dados de demonstração?"
        confirmar="Restaurar"
        onConfirmar={restaurarDemo}
        onFechar={() => setRestaurar(false)}
      >
        <p>A agenda de exemplo é recriada a partir de hoje. Contas e agendamentos criados por você continuam salvos.</p>
      </Dialogo>
    </div>
  );
}
