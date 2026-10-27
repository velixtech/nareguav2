import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Volta ao topo ao trocar de página e rola até a âncora (#servicos etc.)
// mesmo quando o link vem de outra página.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tentativas = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tentativas > 20) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash, key]);

  return null;
}
