// Só aceita redirecionar para páginas internas do site (evita open redirect).
export const destinoSeguro = (valor, padrao) =>
  valor && valor.startsWith('/') && !valor.startsWith('//') && !valor.includes('\\') ? valor : padrao;

export const destinoPadrao = (usuario) => (usuario?.papel === 'admin' ? '/painel' : '/agendar');
