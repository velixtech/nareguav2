import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as db from '../lib/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => db.usuarioAtual());

  const entrar = useCallback((email, senha) => {
    const u = db.entrar(email, senha);
    setUsuario(u);
    return u;
  }, []);

  const cadastrar = useCallback((dados) => {
    const u = db.cadastrar(dados);
    setUsuario(u);
    return u;
  }, []);

  const sair = useCallback(() => {
    db.sair();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, ehAdmin: usuario?.papel === 'admin', entrar, cadastrar, sair }),
    [usuario, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
