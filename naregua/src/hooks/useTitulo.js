import { useEffect } from 'react';
import { barbearia } from '../data/barbearia';

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | ${barbearia.nome}` : `${barbearia.nome} | ${barbearia.slogan}`;
  }, [titulo]);
}
