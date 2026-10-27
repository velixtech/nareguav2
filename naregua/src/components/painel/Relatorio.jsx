import { useMemo, useState } from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { barbearia, barbeiroPorId, barbeiros, servicos } from '../../data/barbearia';
import {
  PERIODOS,
  ROTULO_STATUS,
  diasEntre,
  formatarDataCurta,
  formatarMoeda,
  intervaloDoPeriodo,
  resumoServicos,
} from '../../lib/agenda';
import * as db from '../../lib/db';

const LIMITE_TABELA = 12;

// Relatório de um período. Sem barbeiroId: visão da gestão (casa inteira,
// com ranking da equipe). Com barbeiroId: ganhos e procedimentos do barbeiro.
export default function Relatorio({ barbeiroId = null, versao = 0 }) {
  const [periodo, setPeriodo] = useState('7d');
  const [inicio, fim] = intervaloDoPeriodo(periodo);
  const comissao = barbearia.comissaoBarbeiro;

  const lista = useMemo(
    () => db.agendamentosEntre(inicio, fim).filter((a) => !barbeiroId || a.barbeiroId === barbeiroId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inicio, fim, barbeiroId, versao],
  );

  const concluidos = lista.filter((a) => a.status === 'concluido');
  const faturamento = concluidos.reduce((s, a) => s + a.total, 0);
  const agendados = lista.filter((a) => a.status === 'confirmado');
  const valorAgendado = agendados.reduce((s, a) => s + a.total, 0);
  const perdidos = lista.filter((a) => a.status === 'faltou' || a.status === 'cancelado');
  const ticket = concluidos.length ? faturamento / concluidos.length : 0;

  // Faturamento por dia
  const porDia = diasEntre(inicio, fim).map((d) => ({
    data: d,
    valor: concluidos.filter((a) => a.data === d).reduce((s, a) => s + a.total, 0),
  }));
  const maxDia = Math.max(1, ...porDia.map((d) => d.valor));

  // Serviços realizados
  const porServico = servicos
    .map((s) => {
      const qtd = concluidos.filter((a) => a.servicos.includes(s.id)).length;
      return { ...s, qtd, valor: qtd * s.preco };
    })
    .filter((s) => s.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd);
  const maxServico = Math.max(1, ...porServico.map((s) => s.qtd));

  // Equipe (só gestão)
  const porBarbeiro = barbeiros
    .map((b) => {
      const deles = concluidos.filter((a) => a.barbeiroId === b.id);
      const valor = deles.reduce((s, a) => s + a.total, 0);
      return { ...b, qtd: deles.length, valor, comissao: valor * comissao };
    })
    .sort((a, b) => b.valor - a.valor);
  const maxBarbeiro = Math.max(1, ...porBarbeiro.map((b) => b.valor));

  const historico = [...lista].reverse().filter((a) => a.status !== 'confirmado');
  const mostrarGrafico = porDia.length > 1;
  const rotuloEixo = (i) => porDia.length <= 10 || i % 5 === 0 || i === porDia.length - 1;

  return (
    <div className="relatorio">
      <div className="relatorio__topo">
        <div className="segmentado" role="group" aria-label="Período do relatório">
          {PERIODOS.map((p) => (
            <button key={p.id} type="button" aria-pressed={periodo === p.id} className={periodo === p.id ? 'is-ativo' : ''} onClick={() => setPeriodo(p.id)}>
              {p.rotulo}
            </button>
          ))}
        </div>
        <span className="muted relatorio__intervalo">
          <FiCalendar /> {inicio === fim ? formatarDataCurta(inicio) : `${formatarDataCurta(inicio)} a ${formatarDataCurta(fim)}`}
        </span>
      </div>

      <div className="kpis">
        {barbeiroId ? (
          <div className="kpi card kpi--destaque">
            <span className="kpi__icone"><FiDollarSign /></span>
            <span className="kpi__rotulo">Seus ganhos ({Math.round(comissao * 100)}%)</span>
            <strong className="kpi__valor">{formatarMoeda(faturamento * comissao)}</strong>
            <span className="kpi__extra">de {formatarMoeda(faturamento)} em serviços</span>
          </div>
        ) : (
          <div className="kpi card kpi--destaque">
            <span className="kpi__icone"><FiDollarSign /></span>
            <span className="kpi__rotulo">Faturamento</span>
            <strong className="kpi__valor">{formatarMoeda(faturamento)}</strong>
            <span className="kpi__extra">casa {formatarMoeda(faturamento * (1 - comissao))} · equipe {formatarMoeda(faturamento * comissao)}</span>
          </div>
        )}
        <div className="kpi card">
          <span className="kpi__icone"><FiCheckCircle /></span>
          <span className="kpi__rotulo">Atendimentos concluídos</span>
          <strong className="kpi__valor">{concluidos.length}</strong>
          <span className="kpi__extra">ticket médio {formatarMoeda(ticket)}</span>
        </div>
        <div className="kpi card">
          <span className="kpi__icone"><FiTrendingUp /></span>
          <span className="kpi__rotulo">Ainda na agenda</span>
          <strong className="kpi__valor">{agendados.length}</strong>
          <span className="kpi__extra">{formatarMoeda(valorAgendado)} previstos</span>
        </div>
        <div className="kpi card">
          <span className="kpi__icone"><FiAlertCircle /></span>
          <span className="kpi__rotulo">Faltas e cancelamentos</span>
          <strong className="kpi__valor">{perdidos.length}</strong>
          <span className="kpi__extra">
            {lista.length ? Math.round((perdidos.length / lista.length) * 100) : 0}% dos agendamentos
          </span>
        </div>
      </div>

      <div className="relatorio__grid">
        {mostrarGrafico && (
          <section className="painel-bloco card relatorio__largo">
            <header className="painel-bloco__head">
              <h3>Faturamento por dia</h3>
              <span className="muted">maior dia: {formatarMoeda(Math.max(...porDia.map((d) => d.valor)))}</span>
            </header>
            <div className="colunas" role="list" aria-label="Faturamento por dia">
              {porDia.map((d, i) => (
                <div
                  key={d.data}
                  role="listitem"
                  tabIndex={0}
                  className="colunas__item"
                  data-tip={`${formatarDataCurta(d.data).slice(0, 5)} · ${formatarMoeda(d.valor)}`}
                  aria-label={`${formatarDataCurta(d.data)}: ${formatarMoeda(d.valor)}`}
                >
                  <span className="colunas__barra" style={{ height: `${(d.valor / maxDia) * 100}%` }} />
                  <span className="colunas__rotulo">{rotuloEixo(i) ? d.data.slice(8) : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="painel-bloco card">
          <header className="painel-bloco__head">
            <h3>{barbeiroId ? 'Seus procedimentos' : 'Serviços mais feitos'}</h3>
          </header>
          {porServico.length === 0 ? (
            <p className="muted painel-bloco__vazio">Nenhum atendimento concluído no período.</p>
          ) : (
            <ul className="barras">
              {porServico.map((s) => (
                <li key={s.id} className="barras__item" title={`${s.nome}: ${s.qtd} vezes, ${formatarMoeda(s.valor)}`}>
                  <div className="barras__texto">
                    <span>{s.nome}</span>
                    <span><strong>{s.qtd}x</strong> <span className="muted">· {formatarMoeda(s.valor)}</span></span>
                  </div>
                  <span className="barras__trilho"><span style={{ width: `${(s.qtd / maxServico) * 100}%` }} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {!barbeiroId && (
          <section className="painel-bloco card">
            <header className="painel-bloco__head">
              <h3>Desempenho da equipe</h3>
              <span className="muted">comissão {Math.round(comissao * 100)}%</span>
            </header>
            <ul className="barras">
              {porBarbeiro.map((b) => (
                <li key={b.id} className="barras__item" title={`${b.nome}: ${b.qtd} atendimentos, ${formatarMoeda(b.valor)}`}>
                  <div className="barras__texto">
                    <span className="barras__pessoa"><img src={b.img} alt="" /> {b.nome}</span>
                    <span><strong>{formatarMoeda(b.valor)}</strong> <span className="muted">· {b.qtd} atend.</span></span>
                  </div>
                  <span className="barras__trilho"><span style={{ width: `${(b.valor / maxBarbeiro) * 100}%` }} /></span>
                  <span className="barras__nota muted">Comissão: {formatarMoeda(b.comissao)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="painel-bloco card relatorio__largo">
          <header className="painel-bloco__head">
            <h3>{barbeiroId ? 'Seus últimos atendimentos' : 'Últimos atendimentos'}</h3>
            {historico.length > LIMITE_TABELA && (
              <span className="muted">mostrando {LIMITE_TABELA} de {historico.length}</span>
            )}
          </header>
          {historico.length === 0 ? (
            <p className="muted painel-bloco__vazio">Nada por aqui no período.</p>
          ) : (
            <div className="tabela-wrap">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Serviços</th>
                    {!barbeiroId && <th>Barbeiro</th>}
                    <th>Status</th>
                    <th className="num">Valor</th>
                    <th className="num">{barbeiroId ? 'Sua parte' : 'Comissão'}</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.slice(0, LIMITE_TABELA).map((a) => {
                    const pago = a.status === 'concluido';
                    return (
                      <tr key={a.id}>
                        <td>{formatarDataCurta(a.data).slice(0, 5)} <span className="muted">{a.inicio}</span></td>
                        <td>{db.usuarioPorId(a.usuarioId)?.nome ?? 'Cliente'}</td>
                        <td>{resumoServicos(a.servicos).lista.map((s) => s.nome).join(' + ')}</td>
                        {!barbeiroId && <td>{barbeiroPorId(a.barbeiroId)?.nome}</td>}
                        <td><span className={`badge badge--${a.status}`}>{ROTULO_STATUS[a.status]}</span></td>
                        <td className="num">{pago ? formatarMoeda(a.total) : '—'}</td>
                        <td className="num">{pago ? formatarMoeda(a.total * comissao) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
