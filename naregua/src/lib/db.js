// "Banco de dados" do site, guardado no localStorage do navegador.
// Não há servidor: cada navegador tem seus próprios usuários e agendamentos.
// Para usar em produção de verdade, troque estas funções por chamadas a uma API.

import { sha256 } from './sha256';
import { barbeiros } from '../data/barbearia';
import {
  chaveData,
  deMinutos,
  duracaoNaAgenda,
  estaAberto,
  expedienteDoDia,
  horariosDoDia,
  paraMinutos,
  resumoServicos,
  somarDias,
  barbeiroLivre,
} from './agenda';

const PREFIXO = 'naregua:v2:';
const CHAVES = {
  usuarios: 'usuarios',
  agendamentos: 'agendamentos',
  sessao: 'sessao',
  seed: 'seed',
  pins: 'pins',
  perfil: 'perfilPainel',
};
const VERSAO_SEED = 2;

export const CONTAS_DEMO = {
  cliente: { email: 'cliente@naregua.com', senha: 'cliente123' },
  admin: { email: 'admin@naregua.com', senha: 'admin123' },
};

// ---------- armazenamento ----------

const memoria = new Map(); // usado se o localStorage estiver bloqueado

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return memoria.has(chave) ? memoria.get(chave) : padrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    memoria.set(chave, valor);
  }
}

function apagar(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch {
    memoria.delete(chave);
  }
}

const novoId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const novoSal = () => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const hashSenha = (senha, sal) => sha256(`${sal}:${senha}`);

const publico = (u) => u && { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone, papel: u.papel };

export class ErroDb extends Error {}

// ---------- usuários e sessão ----------

const usuarios = () => ler(CHAVES.usuarios, []);
const normalizarEmail = (email) => email.trim().toLowerCase();

function criarUsuarioBruto({ nome, email, telefone, senha, papel = 'cliente' }) {
  const sal = novoSal();
  return {
    id: novoId(),
    nome: nome.trim(),
    email: normalizarEmail(email),
    telefone: telefone?.trim() ?? '',
    papel,
    sal,
    hash: hashSenha(senha, sal),
    criadoEm: new Date().toISOString(),
  };
}

export function cadastrar(dados) {
  const lista = usuarios();
  if (lista.some((u) => u.email === normalizarEmail(dados.email))) {
    throw new ErroDb('Já existe uma conta com esse e-mail. Faça login.');
  }
  const usuario = criarUsuarioBruto(dados);
  gravar(CHAVES.usuarios, [...lista, usuario]);
  gravar(CHAVES.sessao, usuario.id);
  return publico(usuario);
}

export function entrar(email, senha) {
  const usuario = usuarios().find((u) => u.email === normalizarEmail(email));
  if (!usuario || usuario.hash !== hashSenha(senha, usuario.sal)) {
    throw new ErroDb('E-mail ou senha incorretos.');
  }
  gravar(CHAVES.sessao, usuario.id);
  return publico(usuario);
}

export const sair = () => {
  apagar(CHAVES.sessao);
  apagar(CHAVES.perfil);
};

export function usuarioAtual() {
  const id = ler(CHAVES.sessao, null);
  return id ? publico(usuarios().find((u) => u.id === id)) ?? null : null;
}

export const usuarioPorId = (id) => publico(usuarios().find((u) => u.id === id));

// ---------- agendamentos ----------

export const agendamentos = () => ler(CHAVES.agendamentos, []);

export const agendamentoPorId = (id) => agendamentos().find((a) => a.id === id) ?? null;

export const agendamentosDoUsuario = (usuarioId) =>
  agendamentos()
    .filter((a) => a.usuarioId === usuarioId)
    .sort((x, y) => (x.data + x.inicio).localeCompare(y.data + y.inicio));

export const agendamentosDoDia = (data) =>
  agendamentos()
    .filter((a) => a.data === data)
    .sort((x, y) => x.inicio.localeCompare(y.inicio));

/** Cria um agendamento validando tudo de novo (a agenda pode ter mudado). */
export function criarAgendamento({ usuarioId, servicos: ids, barbeiroId, data, inicio, observacao = '' }) {
  if (!usuarioId) throw new ErroDb('Faça login para agendar.');
  const { lista, total, duracao } = resumoServicos(ids);
  if (!lista.length) throw new ErroDb('Escolha pelo menos um serviço.');
  if (!estaAberto(data)) throw new ErroDb('A barbearia não abre nesse dia.');

  const todos = agendamentos();
  const horario = horariosDoDia({ data, duracao, barbeiroId, agendamentos: todos }).find(
    (h) => h.hora === inicio,
  );
  if (!horario?.disponivel) {
    throw new ErroDb('Esse horário acabou de ser ocupado. Escolha outro, por favor.');
  }

  const escolhido = barbeiroId === 'qualquer' ? horario.livres[0] : barbeiroId;
  const novo = {
    id: novoId(),
    usuarioId,
    servicos: lista.map((s) => s.id),
    barbeiroId: escolhido,
    semPreferencia: barbeiroId === 'qualquer',
    data,
    inicio,
    fim: horario.fim,
    duracao,
    total,
    observacao: observacao.trim(),
    status: 'confirmado',
    criadoEm: new Date().toISOString(),
  };
  gravar(CHAVES.agendamentos, [...todos, novo]);
  return novo;
}

export function atualizarStatus(id, status) {
  const todos = agendamentos();
  const alvo = todos.find((a) => a.id === id);
  if (!alvo) throw new ErroDb('Agendamento não encontrado.');
  gravar(
    CHAVES.agendamentos,
    todos.map((a) => (a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a)),
  );
}

// ---------- painel: perfis e PINs ----------
// A barbearia tem um único login. Dentro do painel, cada pessoa escolhe o seu
// perfil (Gestão ou um barbeiro) e confirma com um PIN de 4 dígitos.

export const PINS_DEMO = { gestao: '1234', lucas: '1111', matheus: '2222', rafael: '3333', joao: '4444' };

function garantirPins() {
  const pins = ler(CHAVES.pins, {});
  let mudou = false;
  for (const [perfil, pin] of Object.entries(PINS_DEMO)) {
    if (!pins[perfil]) {
      const sal = novoSal();
      pins[perfil] = { sal, hash: hashSenha(pin, sal) };
      mudou = true;
    }
  }
  if (mudou) gravar(CHAVES.pins, pins);
}

export function verificarPin(perfil, pin) {
  const registro = ler(CHAVES.pins, {})[perfil];
  return Boolean(registro) && registro.hash === hashSenha(pin, registro.sal);
}

export function alterarPin(perfil, novoPin) {
  if (!/^\d{4}$/.test(novoPin)) throw new ErroDb('O PIN precisa ter exatamente 4 números.');
  const pins = ler(CHAVES.pins, {});
  const sal = novoSal();
  gravar(CHAVES.pins, { ...pins, [perfil]: { sal, hash: hashSenha(novoPin, sal) } });
}

export const perfilPainel = () => ler(CHAVES.perfil, null);
export const definirPerfilPainel = (perfil) => gravar(CHAVES.perfil, perfil);
export const limparPerfilPainel = () => apagar(CHAVES.perfil);

/** Agendamentos entre duas datas "YYYY-MM-DD" (inclusive). */
export const agendamentosEntre = (inicio, fim) =>
  agendamentos()
    .filter((a) => a.data >= inicio && a.data <= fim)
    .sort((x, y) => (x.data + x.inicio).localeCompare(y.data + y.inicio));

// ---------- dados de demonstração ----------
// Na primeira visita, cria a conta de cliente demo, a conta admin e uma agenda
// movimentada nos próximos dias, para o painel não aparecer vazio.

const CLIENTES_FICTICIOS = [
  ['Wesley Santos', '(61) 99812-3344'],
  ['Kauã Oliveira', '(61) 99234-1188'],
  ['Diego Ferreira', '(61) 98456-7720'],
  ['Jonathan Lima', '(61) 99671-0042'],
  ['Brayan Souza', '(61) 98123-5566'],
  ['Igor Nascimento', '(61) 99345-9081'],
  ['Matheus Rocha', '(61) 98877-2210'],
  ['Caio Henrique', '(61) 99101-4477'],
];

// Gerador pseudoaleatório com semente, para a agenda demo ser sempre parecida.
function aleatorio(semente) {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function popularDemo({ forcar = false } = {}) {
  garantirPins();
  if (!forcar && ler(CHAVES.seed, 0) >= VERSAO_SEED) return;

  const lista = usuarios();
  const garantir = (dados) => {
    const existente = lista.find((u) => u.email === dados.email);
    if (existente) return existente;
    const u = { ...criarUsuarioBruto(dados), demo: true };
    lista.push(u);
    return u;
  };

  garantir({ nome: 'Equipe NaRégua', email: CONTAS_DEMO.admin.email, senha: CONTAS_DEMO.admin.senha, papel: 'admin', telefone: '(61) 94002-8922' });
  const cliente = garantir({ nome: 'Cliente Demo', email: CONTAS_DEMO.cliente.email, senha: CONTAS_DEMO.cliente.senha, telefone: '(61) 99999-0000' });
  const ficticios = CLIENTES_FICTICIOS.map(([nome, telefone], i) =>
    garantir({ nome, telefone, email: `cliente${i + 1}@exemplo.com`, senha: novoSal() }),
  );
  gravar(CHAVES.usuarios, lista);

  const ids = new Set(lista.filter((u) => u.demo).map((u) => u.id));
  // Recria só a agenda das contas demo; o que foi criado por você continua.
  const reais = agendamentos().filter((a) => !ids.has(a.usuarioId));
  const gerados = [];
  const hoje = new Date();
  const rnd = aleatorio(Number(chaveData(hoje).replaceAll('-', '')));
  const combos = [['degrade'], ['degrade', 'barba'], ['social'], ['social', 'barba'], ['barba'], ['degrade', 'sobrancelha'], ['degrade', 'freestyle'], ['social', 'pigmentacao']];

  const tentar = (usuario, data, ids, barbeiroId, inicio, status = 'confirmado') => {
    const { total, duracao } = resumoServicos(ids);
    const ini = paraMinutos(inicio);
    const fim = ini + duracaoNaAgenda(duracao);
    if (fim > paraMinutos(expedienteDoDia(data).fecha)) return;
    if (!barbeiroLivre(barbeiroId, data, ini, fim, [...reais, ...gerados])) return;
    gerados.push({
      id: novoId() + gerados.length,
      usuarioId: usuario.id,
      servicos: ids,
      barbeiroId,
      semPreferencia: false,
      data,
      inicio,
      fim: deMinutos(fim),
      duracao,
      total,
      observacao: '',
      status,
      criadoEm: new Date().toISOString(),
    });
  };

  const agora = hoje.getHours() * 60 + hoje.getMinutes();

  // Histórico dos últimos 35 dias e agenda dos próximos 6 dias.
  for (let d = -35; d <= 6; d++) {
    const data = chaveData(somarDias(hoje, d));
    if (!estaAberto(data)) continue;
    const qtd = 5 + Math.floor(rnd() * 6);
    for (let i = 0; i < qtd; i++) {
      const pessoa = ficticios[Math.floor(rnd() * ficticios.length)];
      const barbeiro = barbeiros[Math.floor(rnd() * barbeiros.length)];
      const hora = deMinutos(8 * 60 + Math.floor(rnd() * 19) * 30);
      let status = 'confirmado';
      const passou = d < 0 || (d === 0 && paraMinutos(hora) < agora);
      if (passou) status = rnd() < 0.88 ? 'concluido' : rnd() < 0.5 ? 'faltou' : 'cancelado';
      else if (rnd() < 0.08) status = 'cancelado';
      tentar(pessoa, data, combos[Math.floor(rnd() * combos.length)], barbeiro.id, hora, status);
    }
  }

  // Um histórico e um agendamento futuro para a conta "Cliente Demo".
  const proximoAberto = (inicio, passo) => {
    let d = inicio;
    while (!estaAberto(chaveData(somarDias(hoje, d)))) d += passo;
    return chaveData(somarDias(hoje, d));
  };
  tentar(cliente, proximoAberto(-7, -1), ['degrade', 'barba'], 'lucas', '10:00', 'concluido');
  tentar(cliente, proximoAberto(2, 1), ['degrade', 'sobrancelha'], 'rafael', '15:00');

  gravar(CHAVES.agendamentos, [...reais, ...gerados]);
  gravar(CHAVES.seed, VERSAO_SEED);
}
