import { useMemo, useState } from 'react';
import { FiBriefcase, FiCheck, FiKey, FiRefreshCw } from 'react-icons/fi';
import Dialogo from '../Dialogo';
import { barbearia, barbeiros } from '../../data/barbearia';
import { formatarMoeda, intervaloDoPeriodo } from '../../lib/agenda';
import * as db from '../../lib/db';

function TrocarPin({ perfil, nome }) {
  const [aberto, setAberto] = useState(false);
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState(null);

  const salvar = (e) => {
    e.preventDefault();
    try {
      db.alterarPin(perfil, pin);
      setMsg({ ok: true, texto: `PIN de ${nome} atualizado.` });
      setPin('');
      setAberto(false);
    } catch (err) {
      setMsg({ ok: false, texto: err.message });
    }
  };

  return (
    <div className="trocar-pin">
      {aberto ? (
        <form onSubmit={salvar} className="trocar-pin__form">
          <label className="visually-hidden" htmlFor={`pin-${perfil}`}>Novo PIN de {nome}</label>
          <input
            id={`pin-${perfil}`}
            className="input input--plain"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Novo PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            autoFocus
          />
          <button type="submit" className="btn btn--primary btn--sm" disabled={pin.length !== 4}><FiCheck /> Salvar</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setAberto(false); setPin(''); setMsg(null); }}>Cancelar</button>
        </form>
      ) : (
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setAberto(true); setMsg(null); }}>
          <FiKey /> Alterar PIN
        </button>
      )}
      {msg && <p className={`trocar-pin__msg ${msg.ok ? 'is-ok' : 'is-erro'}`} role="status">{msg.texto}</p>}
    </div>
  );
}

export default function Equipe({ onDadosAlterados }) {
  const [restaurar, setRestaurar] = useState(false);
  const [versao, setVersao] = useState(0);
  const [inicio, fim] = intervaloDoPeriodo('mes');

  const doMes = useMemo(
    () => db.agendamentosEntre(inicio, fim).filter((a) => a.status === 'concluido'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inicio, fim, versao],
  );

  const restaurarDemo = () => {
    db.popularDemo({ forcar: true });
    setRestaurar(false);
    setVersao((v) => v + 1);
    onDadosAlterados?.();
  };

  return (
    <div className="equipe-painel">
      <div className="equipe-painel__grid">
        {barbeiros.map((b) => {
          const deles = doMes.filter((a) => a.barbeiroId === b.id);
          const valor = deles.reduce((s, a) => s + a.total, 0);
          return (
            <article key={b.id} className="membro card">
              <div className="membro__topo">
                <img src={b.img} alt="" />
                <div>
                  <h3>{b.nome}</h3>
                  <p className="muted">{b.especialidade}</p>
                </div>
              </div>
              <dl className="membro__numeros">
                <div><dt>Atendimentos no mês</dt><dd>{deles.length}</dd></div>
                <div><dt>Faturado no mês</dt><dd>{formatarMoeda(valor)}</dd></div>
                <div><dt>Comissão ({Math.round(barbearia.comissaoBarbeiro * 100)}%)</dt><dd className="gold">{formatarMoeda(valor * barbearia.comissaoBarbeiro)}</dd></div>
              </dl>
              <TrocarPin perfil={b.id} nome={b.nome} />
            </article>
          );
        })}
        <article className="membro card membro--gestao">
          <div className="membro__topo">
            <span className="membro__icone"><FiBriefcase /></span>
            <div>
              <h3>Gestão</h3>
              <p className="muted">Acesso completo ao painel</p>
            </div>
          </div>
          <p className="muted membro__texto">
            O PIN da gestão libera agenda geral, relatórios e esta aba. Troque os PINs sempre que alguém sair da equipe.
          </p>
          <TrocarPin perfil="gestao" nome="Gestão" />
        </article>
      </div>

      <section className="painel-bloco card demo-bloco">
        <div>
          <h3>Dados de demonstração</h3>
          <p className="muted">Recria a agenda de exemplo (últimos 35 dias e próxima semana) a partir de hoje. Contas que você criou e os agendamentos delas continuam salvos.</p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRestaurar(true)}>
          <FiRefreshCw /> Restaurar dados demo
        </button>
      </section>

      <Dialogo
        aberto={restaurar}
        titulo="Restaurar dados de demonstração?"
        confirmar="Restaurar"
        onConfirmar={restaurarDemo}
        onFechar={() => setRestaurar(false)}
      >
        <p>A agenda de exemplo é recriada a partir de hoje. Contas que você criou e os agendamentos delas continuam salvos.</p>
      </Dialogo>
    </div>
  );
}
