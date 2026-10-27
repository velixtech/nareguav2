import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClipboard,
  FiClock,
  FiEdit2,
  FiScissors,
  FiShuffle,
  FiUser,
} from 'react-icons/fi';
import { barbeiroPorId, barbeiros, servicoPorId, servicos } from '../data/barbearia';
import {
  diaDaSemanaCurto,
  estaAberto,
  formatarDataLonga,
  formatarDuracao,
  formatarMoeda,
  horariosDoDia,
  mesCurto,
  proximosDias,
  resumoServicos,
} from '../lib/agenda';
import * as db from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useTitulo } from '../hooks/useTitulo';
import './Agendar.css';

const PASSOS = [
  { id: 1, rotulo: 'Serviços', icone: FiScissors },
  { id: 2, rotulo: 'Barbeiro', icone: FiUser },
  { id: 3, rotulo: 'Dia e horário', icone: FiCalendar },
  { id: 4, rotulo: 'Confirmar', icone: FiClipboard },
];

export default function Agendar() {
  useTitulo('Agendar horário');
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const topoRef = useRef(null);

  const [passo, setPasso] = useState(1);
  const [selecionados, setSelecionados] = useState(() => {
    const s = params.get('servico');
    return s && servicoPorId(s) ? [s] : [];
  });
  const [barbeiroId, setBarbeiroId] = useState(() => {
    const b = params.get('barbeiro');
    return b && barbeiroPorId(b) ? b : null;
  });
  const dias = useMemo(() => proximosDias(), []);
  const [data, setData] = useState(() => dias.find(estaAberto));
  const [hora, setHora] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [versaoAgenda, setVersaoAgenda] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const resumo = useMemo(() => resumoServicos(selecionados), [selecionados]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const agendamentos = useMemo(() => db.agendamentos(), [versaoAgenda, passo]);

  const horarios = useMemo(
    () =>
      barbeiroId && resumo.duracao
        ? horariosDoDia({ data, duracao: resumo.duracao, barbeiroId, agendamentos })
        : [],
    [data, resumo.duracao, barbeiroId, agendamentos],
  );

  // Se a escolha mudar e o horário deixar de existir, limpa o horário.
  useEffect(() => {
    if (hora && !horarios.find((h) => h.hora === hora && h.disponivel)) setHora(null);
  }, [horarios, hora]);

  const podeAvancar = {
    1: selecionados.length > 0,
    2: Boolean(barbeiroId),
    3: Boolean(data && hora),
    4: true,
  };
  const liberado = (n) => PASSOS.slice(0, n - 1).every((p) => podeAvancar[p.id]);

  const irPara = (n) => {
    if (!liberado(n)) return;
    setErro('');
    // Ao chegar no calendário, pula para o primeiro dia que tem horário livre.
    if (n === 3 && !hora) {
      const temVaga = (d) =>
        horariosDoDia({ data: d, duracao: resumo.duracao, barbeiroId, agendamentos }).some((h) => h.disponivel);
      if (!temVaga(data)) setData(dias.find((d) => estaAberto(d) && temVaga(d)) ?? data);
    }
    setPasso(n);
    requestAnimationFrame(() => topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const alternarServico = (id) =>
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const confirmar = () => {
    setErro('');
    setEnviando(true);
    try {
      const novo = db.criarAgendamento({
        usuarioId: usuario.id,
        servicos: selecionados,
        barbeiroId,
        data,
        inicio: hora,
        observacao,
      });
      navigate(`/agendamento/${novo.id}`, { state: { novo: true } });
    } catch (e) {
      setErro(e.message);
      setVersaoAgenda((v) => v + 1);
      setEnviando(false);
    }
  };

  const horarioEscolhido = horarios.find((h) => h.hora === hora);
  const barbeiro = barbeiroId === 'qualquer' ? null : barbeiroPorId(barbeiroId);
  const livresDoDia = horarios.filter((h) => h.disponivel).length;
  const manha = horarios.filter((h) => h.hora < '12:00');
  const tarde = horarios.filter((h) => h.hora >= '12:00');

  const avancar = () => (passo < 4 ? irPara(passo + 1) : confirmar());
  const rotuloAvancar = passo < 4 ? 'Continuar' : <>Confirmar<span className="so-desktop"> agendamento</span></>;

  return (
    <div className="page agendar">
      <div className="container" ref={topoRef}>
        <header className="page__head">
          <span className="eyebrow">Agendamento online</span>
          <h1 className="page__title">Marque seu horário</h1>
        </header>

        <ol className="stepper" aria-label="Etapas do agendamento">
          {PASSOS.map((p) => {
            const Icone = p.icone;
            const estado = p.id === passo ? 'atual' : p.id < passo ? 'feito' : 'futuro';
            return (
              <li key={p.id} className={`stepper__item is-${estado}`}>
                <button
                  type="button"
                  onClick={() => irPara(p.id)}
                  disabled={!liberado(p.id)}
                  aria-current={p.id === passo ? 'step' : undefined}
                >
                  <span className="stepper__icone">{estado === 'feito' ? <FiCheck /> : <Icone />}</span>
                  <span className="stepper__rotulo">
                    <small>Passo {p.id}</small>
                    {p.rotulo}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="agendar__grid">
          <section className="agendar__etapa" aria-live="polite">
            {/* ---- 1. Serviços ---- */}
            {passo === 1 && (
              <div className="etapa">
                <div className="etapa__head">
                  <h2>Quais serviços você quer?</h2>
                  <p className="muted">Pode escolher mais de um. O valor e o tempo somam sozinhos.</p>
                </div>
                <div className="opcoes opcoes--servicos">
                  {servicos.map((s) => {
                    const ativo = selecionados.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`opcao opcao--servico ${ativo ? 'is-ativo' : ''}`}
                        aria-pressed={ativo}
                        onClick={() => alternarServico(s.id)}
                      >
                        <img src={s.img} alt="" className="opcao__thumb" />
                        <span className="opcao__corpo">
                          <span className="opcao__titulo">{s.nome}</span>
                          <span className="opcao__desc">{s.descricao}</span>
                          <span className="opcao__meta">
                            <strong>{formatarMoeda(s.preco)}</strong>
                            <span><FiClock /> {formatarDuracao(s.duracao)}</span>
                          </span>
                        </span>
                        <span className="opcao__check" aria-hidden="true"><FiCheck /></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- 2. Barbeiro ---- */}
            {passo === 2 && (
              <div className="etapa">
                <div className="etapa__head">
                  <h2>Com quem vai ser?</h2>
                  <p className="muted">Escolha seu barbeiro ou deixe a gente encaixar com quem estiver livre.</p>
                </div>
                <div className="opcoes opcoes--barbeiros">
                  <button
                    type="button"
                    className={`opcao opcao--barbeiro ${barbeiroId === 'qualquer' ? 'is-ativo' : ''}`}
                    aria-pressed={barbeiroId === 'qualquer'}
                    onClick={() => setBarbeiroId('qualquer')}
                  >
                    <span className="opcao__avatar opcao__avatar--icone"><FiShuffle /></span>
                    <span className="opcao__titulo">Sem preferência</span>
                    <span className="opcao__desc">Mais horários disponíveis</span>
                    <span className="opcao__check" aria-hidden="true"><FiCheck /></span>
                  </button>
                  {barbeiros.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`opcao opcao--barbeiro ${barbeiroId === b.id ? 'is-ativo' : ''}`}
                      aria-pressed={barbeiroId === b.id}
                      onClick={() => setBarbeiroId(b.id)}
                    >
                      <img src={b.img} alt="" className="opcao__avatar" />
                      <span className="opcao__titulo">{b.nome}</span>
                      <span className="opcao__desc">{b.especialidade}</span>
                      <span className="opcao__check" aria-hidden="true"><FiCheck /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ---- 3. Dia e horário ---- */}
            {passo === 3 && (
              <div className="etapa">
                <div className="etapa__head">
                  <h2>Escolha o dia e o horário</h2>
                  <p className="muted">
                    Atendimento de segunda a sábado. Seu atendimento dura cerca de{' '}
                    <strong>{formatarDuracao(resumo.duracao)}</strong>.
                  </p>
                </div>

                <div className="dias" role="listbox" aria-label="Dias disponíveis">
                  {dias.map((d) => {
                    const aberto = estaAberto(d);
                    const ativo = d === data;
                    return (
                      <button
                        key={d}
                        type="button"
                        role="option"
                        aria-selected={ativo}
                        className={`dia ${ativo ? 'is-ativo' : ''}`}
                        disabled={!aberto}
                        onClick={() => setData(d)}
                        title={aberto ? formatarDataLonga(d) : 'Fechado'}
                      >
                        <span className="dia__semana">{diaDaSemanaCurto(d)}</span>
                        <span className="dia__num">{d.slice(8)}</span>
                        <span className="dia__mes">{aberto ? mesCurto(d) : 'Fechado'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="horarios-dia">
                  <div className="horarios-dia__titulo">
                    <h3>{formatarDataLonga(data)}</h3>
                    <span className="muted">
                      {livresDoDia ? `${livresDoDia} horários livres` : 'Sem horários livres'}
                    </span>
                  </div>

                  {livresDoDia === 0 ? (
                    <div className="empty">
                      <FiCalendar />
                      <h3>Esse dia está lotado</h3>
                      <p>Tente outro dia{barbeiroId !== 'qualquer' ? ' ou escolha "Sem preferência" de barbeiro' : ''}.</p>
                    </div>
                  ) : (
                    [['Manhã', manha], ['Tarde', tarde]].map(([titulo, lista]) =>
                      lista.length ? (
                        <div key={titulo} className="turno">
                          <h4>{titulo}</h4>
                          <div className="slots">
                            {lista.map((h) => (
                              <button
                                key={h.hora}
                                type="button"
                                className={`slot ${hora === h.hora ? 'is-ativo' : ''}`}
                                disabled={!h.disponivel}
                                aria-pressed={hora === h.hora}
                                onClick={() => setHora(h.hora)}
                              >
                                {h.hora}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null,
                    )
                  )}
                </div>
              </div>
            )}

            {/* ---- 4. Revisão ---- */}
            {passo === 4 && (
              <div className="etapa">
                <div className="etapa__head">
                  <h2>Confere se tá tudo certo</h2>
                  <p className="muted">Se precisar mudar algo, é só tocar em editar.</p>
                </div>

                {erro && <div className="alert" role="alert"><FiAlertCircle /> {erro}</div>}

                <div className="revisao card">
                  <div className="revisao__linha">
                    <div>
                      <span className="revisao__rotulo">Serviços</span>
                      <ul>
                        {resumo.lista.map((s) => (
                          <li key={s.id}>{s.nome} <span className="muted">· {formatarMoeda(s.preco)}</span></li>
                        ))}
                      </ul>
                    </div>
                    <button type="button" className="revisao__editar" onClick={() => irPara(1)}><FiEdit2 /> Editar</button>
                  </div>
                  <div className="revisao__linha">
                    <div>
                      <span className="revisao__rotulo">Barbeiro</span>
                      <p>{barbeiro ? barbeiro.nome : 'Sem preferência'}</p>
                      {!barbeiro && horarioEscolhido && (
                        <p className="muted small">Você será atendido por {barbeiroPorId(horarioEscolhido.livres[0])?.nome}.</p>
                      )}
                    </div>
                    <button type="button" className="revisao__editar" onClick={() => irPara(2)}><FiEdit2 /> Editar</button>
                  </div>
                  <div className="revisao__linha">
                    <div>
                      <span className="revisao__rotulo">Quando</span>
                      <p>{formatarDataLonga(data)}, às {hora}</p>
                      <p className="muted small">Duração estimada: {formatarDuracao(resumo.duracao)}</p>
                    </div>
                    <button type="button" className="revisao__editar" onClick={() => irPara(3)}><FiEdit2 /> Editar</button>
                  </div>
                  <div className="revisao__linha">
                    <div>
                      <span className="revisao__rotulo">Cliente</span>
                      <p>{usuario.nome}</p>
                      <p className="muted small">{usuario.telefone || usuario.email}</p>
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="obs">Quer avisar algo ao barbeiro? <span className="muted">(opcional)</span></label>
                  <textarea
                    id="obs"
                    className="input"
                    maxLength={240}
                    placeholder="Ex.: quero o degradê bem baixinho, risco do lado esquerdo..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
                <p className="muted small">Pode cancelar grátis pelo site até 2 horas antes do horário.</p>
              </div>
            )}
          </section>

          {/* ---- Resumo ---- */}
          <aside className="resumo">
            <div className="resumo__card card">
              <h2 className="resumo__titulo">Resumo</h2>
              {resumo.lista.length ? (
                <ul className="resumo__lista">
                  {resumo.lista.map((s) => (
                    <li key={s.id}>
                      <span>{s.nome}</span>
                      <span>{formatarMoeda(s.preco)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">Nenhum serviço escolhido ainda.</p>
              )}
              <dl className="resumo__detalhes">
                <div><dt><FiUser /> Barbeiro</dt><dd>{barbeiroId ? (barbeiro?.nome ?? 'Sem preferência') : '—'}</dd></div>
                <div><dt><FiCalendar /> Data</dt><dd>{passo >= 3 && data ? formatarDataLonga(data) : '—'}</dd></div>
                <div><dt><FiClock /> Horário</dt><dd>{hora ? `${hora} às ${horarioEscolhido?.fim ?? ''}` : '—'}</dd></div>
              </dl>
              <div className="resumo__total">
                <span>Total</span>
                <strong>{formatarMoeda(resumo.total)}</strong>
              </div>
              <p className="muted small">Pagamento na barbearia: Pix, cartão ou dinheiro.</p>
            </div>
          </aside>
        </div>

        {/* ---- Navegação entre passos ---- */}
        <div className="agendar__barra">
          <div className="agendar__barra-inner">
            <div className="agendar__barra-total">
              <span className="muted small">{selecionados.length} serviço{selecionados.length === 1 ? '' : 's'} · {formatarDuracao(resumo.duracao || 0)}</span>
              <strong>{formatarMoeda(resumo.total)}</strong>
            </div>
            <div className="agendar__barra-botoes">
              {passo > 1 && (
                <button type="button" className="btn btn--ghost" onClick={() => irPara(passo - 1)}>
                  <FiArrowLeft /> <span className="so-desktop">Voltar</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn--primary"
                onClick={avancar}
                disabled={!podeAvancar[passo] || enviando}
              >
                {rotuloAvancar} {passo < 4 ? <FiArrowRight /> : <FiCheck />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
