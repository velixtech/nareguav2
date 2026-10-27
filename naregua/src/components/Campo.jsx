import { useId, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Campo({ label, icone: Icone, erro, dica, type = 'text', className = '', ...props }) {
  const id = useId();
  const [mostrar, setMostrar] = useState(false);
  const ehSenha = type === 'password';

  return (
    <div className={`field ${className}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      <div className="field__control">
        {Icone && <Icone className="field__icon" aria-hidden="true" />}
        <input
          id={id}
          type={ehSenha && mostrar ? 'text' : type}
          className={`input ${Icone ? '' : 'input--plain'}`}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={erro || dica ? `${id}-msg` : undefined}
          {...props}
        />
        {ehSenha && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Esconder senha' : 'Mostrar senha'}
          >
            {mostrar ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {(erro || dica) && (
        <span id={`${id}-msg`} className={erro ? 'field__error' : 'field__hint'}>
          {erro || dica}
        </span>
      )}
    </div>
  );
}
