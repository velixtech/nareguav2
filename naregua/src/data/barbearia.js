// Todos os dados da barbearia ficam aqui. Para vender o site para outra
// barbearia, basta trocar este arquivo e as imagens em src/assets/img.

import imgDegrade from '../assets/img/degrade.webp';
import imgSocial from '../assets/img/social.webp';
import imgBarba from '../assets/img/barba.webp';
import imgSobrancelha from '../assets/img/sobrancelha.webp';
import imgFreestyle from '../assets/img/freestyle.webp';
import imgPigmentacao from '../assets/img/pigmentacao.webp';
import imgLucas from '../assets/img/barbeiro-lucas.webp';
import imgMatheus from '../assets/img/barbeiro-matheus.webp';
import imgRafael from '../assets/img/barbeiro-rafael.webp';
import imgJoao from '../assets/img/barbeiro-joao.webp';
import g1 from '../assets/img/galeria-1.webp';
import g2 from '../assets/img/galeria-2.webp';
import g3 from '../assets/img/galeria-3.webp';
import g4 from '../assets/img/galeria-4.webp';
import g5 from '../assets/img/galeria-5.webp';
import g6 from '../assets/img/galeria-6.webp';

export const barbearia = {
  nome: 'NaRégua Barbearia',
  nomeCurto: 'NaRégua',
  slogan: 'Da quebrada, com padrão de primeira.',
  telefone: '(61) 94002-8922',
  whatsapp: '5561940028922',
  email: 'contato@naregua.com.br',
  instagram: 'https://www.instagram.com/naregua_barbers/',
  instagramUsuario: '@naregua_barbers',
  endereco: {
    rua: 'Ceilândia Centro',
    cidade: 'Brasília - DF',
    // Texto usado para gerar o mapa e o link de rotas.
    mapa: 'Ceilândia Centro, Brasília - DF',
  },
  // 0 = domingo ... 6 = sábado. null = fechado.
  horarios: {
    0: null,
    1: { abre: '08:00', fecha: '18:00' },
    2: { abre: '08:00', fecha: '18:00' },
    3: { abre: '08:00', fecha: '18:00' },
    4: { abre: '08:00', fecha: '18:00' },
    5: { abre: '08:00', fecha: '18:00' },
    6: { abre: '08:00', fecha: '18:00' },
  },
  // Intervalo entre um horário e outro na agenda, em minutos.
  intervaloAgenda: 30,
  // Quantos dias à frente o cliente consegue agendar.
  diasDeAgenda: 21,
};

export const servicos = [
  {
    id: 'degrade',
    nome: 'Degradê',
    descricao: 'Fade na régua, do zero ao topo, com acabamento na navalha.',
    preco: 30,
    duracao: 40,
    img: imgDegrade,
  },
  {
    id: 'social',
    nome: 'Corte Social',
    descricao: 'Corte clássico na tesoura e máquina, alinhado do jeito certo.',
    preco: 20,
    duracao: 30,
    img: imgSocial,
  },
  {
    id: 'barba',
    nome: 'Barba',
    descricao: 'Desenho, toalha quente e navalha. Barba alinhada e hidratada.',
    preco: 20,
    duracao: 30,
    img: imgBarba,
  },
  {
    id: 'sobrancelha',
    nome: 'Sobrancelha',
    descricao: 'Limpeza e corte na navalha, com risco opcional.',
    preco: 10,
    duracao: 10,
    img: imgSobrancelha,
  },
  {
    id: 'freestyle',
    nome: 'Freestyle',
    descricao: 'Desenho na máquina: risco, nome, símbolo. Você escolhe.',
    preco: 15,
    duracao: 20,
    img: imgFreestyle,
  },
  {
    id: 'pigmentacao',
    nome: 'Pigmentação',
    descricao: 'Realça o desenho e preenche falhas no cabelo e na barba.',
    preco: 25,
    duracao: 30,
    img: imgPigmentacao,
  },
];

export const barbeiros = [
  { id: 'lucas', nome: 'Lucas', especialidade: 'Degradê e navalhado', img: imgLucas },
  { id: 'matheus', nome: 'Matheus', especialidade: 'Barba e toalha quente', img: imgMatheus },
  { id: 'rafael', nome: 'Rafael', especialidade: 'Freestyle e desenhos', img: imgRafael },
  { id: 'joao', nome: 'João', especialidade: 'Social e pigmentação', img: imgJoao },
];

export const galeria = [
  { img: g1, legenda: 'Fade com textura no topo' },
  { img: g2, legenda: 'Desenho na máquina' },
  { img: g3, legenda: 'Barba na régua' },
  { img: g4, legenda: 'Freestyle de coração' },
  { img: g5, legenda: 'Waves com degradê' },
  { img: g6, legenda: 'Dia a dia da cadeira' },
];

export const servicoPorId = (id) => servicos.find((s) => s.id === id);
export const barbeiroPorId = (id) => barbeiros.find((b) => b.id === id);
