import { barbearia, barbeiros, servicoPorId } from '../data/barbearia';

// ---------- datas e horas ----------
// Datas são sempre "YYYY-MM-DD" no fuso local. (O código antigo usava
// toISOString, que é UTC e trocava o dia depois das 21h no Brasil.)

const pad = (n) => String(n).padStart(2, '0');

export const chaveData = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const dataDeChave = (chave) => {
  const [a, m, d] = chave.split('-').map(Number);
  return new Date(a, m - 1, d);
};

export const somarDias = (d, n) => {
  const nova = new Date(d);
  nova.setDate(nova.getDate() + n);
  return nova;
};

export const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const deMinutos = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export const hojeChave = () => chaveData(new Date());

// ---------- formatação ----------

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoeda = (v) => moeda.format(v);

export const formatarDuracao = (min) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${pad(m)}` : `${h}h`;
};

const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatarDataLonga = (chave) =>
  capitalizar(
    dataDeChave(chave).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
  );

export const formatarDataCurta = (chave) =>
  dataDeChave(chave).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const diaDaSemanaCurto = (chave) =>
  capitalizar(dataDeChave(chave).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));

export const mesCurto = (chave) =>
  capitalizar(dataDeChave(chave).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));

// ---------- regras da agenda ----------

export const expedienteDoDia = (chave) => barbearia.horarios[dataDeChave(chave).getDay()];

export const estaAberto = (chave) => Boolean(expedienteDoDia(chave));

export const resumoServicos = (ids) => {
  const lista = ids.map(servicoPorId).filter(Boolean);
  return {
    lista,
    total: lista.reduce((s, x) => s + x.preco, 0),
    duracao: lista.reduce((s, x) => s + x.duracao, 0),
  };
};

// Duração ocupada na agenda: arredonda para o intervalo da agenda.
export const duracaoNaAgenda = (duracao) => {
  const passo = barbearia.intervaloAgenda;
  return Math.max(passo, Math.ceil(duracao / passo) * passo);
};

const ativo = (a) => a.status === 'confirmado' || a.status === 'concluido';

const sobrepoe = (inicioA, fimA, inicioB, fimB) => inicioA < fimB && inicioB < fimA;

export const barbeiroLivre = (barbeiroId, data, inicio, fim, agendamentos, ignorarId) =>
  !agendamentos.some(
    (a) =>
      a.id !== ignorarId &&
      ativo(a) &&
      a.data === data &&
      a.barbeiroId === barbeiroId &&
      sobrepoe(inicio, fim, paraMinutos(a.inicio), paraMinutos(a.fim)),
  );

/**
 * Lista os horários do dia para a duração escolhida.
 * barbeiroId = 'qualquer' considera o horário livre se algum barbeiro estiver livre.
 */
export function horariosDoDia({ data, duracao, barbeiroId, agendamentos, agora = new Date() }) {
  const expediente = expedienteDoDia(data);
  if (!expediente) return [];

  const ocupa = duracaoNaAgenda(duracao);
  const abre = paraMinutos(expediente.abre);
  const fecha = paraMinutos(expediente.fecha);
  const ehHoje = data === chaveData(agora);
  // Hoje, só aceita horários com pelo menos 30 minutos de antecedência.
  const limiteHoje = agora.getHours() * 60 + agora.getMinutes() + 30;
  const candidatos = barbeiroId === 'qualquer' ? barbeiros.map((b) => b.id) : [barbeiroId];

  const horarios = [];
  for (let inicio = abre; inicio + ocupa <= fecha; inicio += barbearia.intervaloAgenda) {
    const fim = inicio + ocupa;
    const passou = ehHoje && inicio < limiteHoje;
    const livres = passou
      ? []
      : candidatos.filter((id) => barbeiroLivre(id, data, inicio, fim, agendamentos));
    horarios.push({ hora: deMinutos(inicio), fim: deMinutos(fim), livres, disponivel: livres.length > 0 });
  }
  return horarios;
}

// Próximos dias exibidos no calendário do agendamento (inclui dias fechados,
// que aparecem desabilitados).
export function proximosDias(qtd = barbearia.diasDeAgenda, agora = new Date()) {
  const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Array.from({ length: qtd }, (_, i) => chaveData(somarDias(base, i)));
}

export const jaPassou = (a, agora = new Date()) => {
  const fim = dataDeChave(a.data);
  const [h, m] = a.fim.split(':').map(Number);
  fim.setHours(h, m);
  return fim < agora;
};

// ---------- links úteis ----------

export function linkGoogleAgenda(a) {
  const { lista } = resumoServicos(a.servicos);
  const barbeiro = barbeiros.find((b) => b.id === a.barbeiroId);
  const fmt = (data, hora) => `${data.replaceAll('-', '')}T${hora.replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${barbearia.nomeCurto}: ${lista.map((s) => s.nome).join(' + ')}`,
    dates: `${fmt(a.data, a.inicio)}/${fmt(a.data, a.fim)}`,
    details: `Com ${barbeiro?.nome ?? 'a equipe'}. Agendado pelo site da ${barbearia.nome}.`,
    location: barbearia.endereco.mapa,
    ctz: 'America/Sao_Paulo',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export const linkWhatsApp = (texto) =>
  `https://wa.me/${barbearia.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

export const linkMapa = () =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbearia.endereco.mapa)}`;

export const linkMapaEmbed = () =>
  `https://www.google.com/maps?q=${encodeURIComponent(barbearia.endereco.mapa)}&z=15&output=embed`;

export const inicioComoData = (a) => {
  const d = dataDeChave(a.data);
  const [h, m] = a.inicio.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

// O cliente pode cancelar pelo site até 2 horas antes do horário.
export const podeCancelar = (a, agora = new Date()) =>
  a.status === 'confirmado' && inicioComoData(a) - agora > 2 * 60 * 60 * 1000;

export const ROTULO_STATUS = {
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  faltou: 'Não compareceu',
};

// ---------- períodos dos relatórios ----------

export const PERIODOS = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: '7d', rotulo: '7 dias' },
  { id: '30d', rotulo: '30 dias' },
  { id: 'mes', rotulo: 'Este mês' },
];

export function intervaloDoPeriodo(id, agora = new Date()) {
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  if (id === '7d') return [chaveData(somarDias(hoje, -6)), chaveData(hoje)];
  if (id === '30d') return [chaveData(somarDias(hoje, -29)), chaveData(hoje)];
  if (id === 'mes') {
    return [
      chaveData(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
      chaveData(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
    ];
  }
  return [chaveData(hoje), chaveData(hoje)];
}

export function diasEntre(inicio, fim) {
  const dias = [];
  for (let d = dataDeChave(inicio); chaveData(d) <= fim; d = somarDias(d, 1)) dias.push(chaveData(d));
  return dias;
}
