import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiBriefcase, FiLock } from 'react-icons/fi';
import { barbeiros } from '../../data/barbearia';
import { PINS_DEMO, verificarPin } from '../../lib/db';

const PERFIL_GESTAO = { id: 'gestao', nome: 'Gestão', descricao: 'Agenda geral, relatórios e equipe' };

export default function EscolherPerfil({ onEntrar }) {
  const [escolhido, setEscolhido] = useState(null);
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (escolhido) inputRef.current?.focus();
  }, [escolhido]);

  const conferir = (valor) => {
    if (verificarPin(escolhido.id, valor)) {
      onEntrar(escolhido.id);
    } else {
      setErro(true);
      setPin('');
    }
  };

  const digitar = (valor) => {
    const limpo = valor.replace(/\D/g, '').slice(0, 4);
    setPin(limpo);
    setErro(false);
    if (limpo.length === 4) conferir(limpo);
  };

  if (escolhido) {
    return (
      <div className="perfil-pin card">
        <button type="button" className="auth__voltar" onClick={() => { setEscolhido(null); setPin(''); setErro(false); }}>
          <FiArrowLeft /> Trocar perfil
        </button>
        {escolhido.img ? (
          <img src={escolhido.img} alt="" className="perfil-pin__foto" />
        ) : (
          <span className="perfil-pin__foto perfil-pin__foto--icone"><FiBriefcase /></span>
        )}
        <h2>{escolhido.id === 'gestao' ? 'Gestão da barbearia' : escolhido.nome}</h2>
        <p className="muted">Digite o PIN de 4 números para entrar.</p>

        <label className={`pin ${erro ? 'pin--erro' : ''}`} onClick={() => inputRef.current?.focus()}>
          <span className="visually-hidden">PIN de {escolhido.nome}</span>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => digitar(e.target.value)}
            aria-invalid={erro || undefined}
          />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin__ponto ${i < pin.length ? 'is-cheio' : ''} ${i === pin.length ? 'is-atual' : ''}`} aria-hidden="true" />
          ))}
        </label>
        <p className={`perfil-pin__msg ${erro ? 'is-erro' : ''}`} role={erro ? 'alert' : undefined}>
          {erro ? 'PIN incorreto. Tente de novo.' : <><FiLock /> Cada perfil tem o seu PIN.</>}
        </p>
      </div>
    );
  }

  return (
    <div className="perfis">
      <div className="perfis__head">
        <h2>Quem está acessando?</h2>
        <p className="muted">A gestão vê a barbearia inteira. Cada barbeiro vê só a própria agenda, ganhos e atendimentos.</p>
      </div>
      <div className="perfis__grid">
        <button type="button" className="perfil perfil--gestao" onClick={() => setEscolhido(PERFIL_GESTAO)}>
          <span className="perfil__foto perfil__foto--icone"><FiBriefcase /></span>
          <strong>Gestão</strong>
          <span className="muted">{PERFIL_GESTAO.descricao}</span>
        </button>
        {barbeiros.map((b) => (
          <button key={b.id} type="button" className="perfil" onClick={() => setEscolhido(b)}>
            <img src={b.img} alt="" className="perfil__foto" />
            <strong>{b.nome}</strong>
            <span className="muted">Barbeiro · {b.especialidade}</span>
          </button>
        ))}
      </div>
      <p className="perfis__demo muted">
        PINs padrão da demonstração: Gestão {PINS_DEMO.gestao}
        {barbeiros.map((b) => ` · ${b.nome} ${PINS_DEMO[b.id]}`).join('')}. A gestão pode trocar os PINs na aba Equipe.
      </p>
    </div>
  );
}
