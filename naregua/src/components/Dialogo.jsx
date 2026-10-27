import { useEffect, useRef } from 'react';
import './Dialogo.css';

// Caixa de confirmação acessível, usando o <dialog> nativo.
export default function Dialogo({ aberto, titulo, children, confirmar = 'Confirmar', cancelar = 'Voltar', perigo = false, onConfirmar, onFechar }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (aberto && !el.open) el.showModal();
    if (!aberto && el.open) el.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className="dialogo"
      onClose={onFechar}
      onClick={(e) => e.target === ref.current && onFechar()}
    >
      <div className="dialogo__corpo">
        <h2 className="dialogo__titulo">{titulo}</h2>
        <div className="dialogo__texto">{children}</div>
        <div className="dialogo__acoes">
          <button type="button" className="btn btn--ghost" onClick={onFechar}>{cancelar}</button>
          <button
            type="button"
            className={`btn ${perigo ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirmar}
          >
            {confirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
