import { Link, useLocation, useParams } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import { FiCalendar, FiCheck, FiClock, FiMapPin, FiScissors, FiUser } from 'react-icons/fi';
import { barbearia, barbeiroPorId } from '../data/barbearia';
import {
  ROTULO_STATUS,
  formatarDataLonga,
  formatarDuracao,
  formatarMoeda,
  linkGoogleAgenda,
  linkMapa,
  linkWhatsApp,
  resumoServicos,
} from '../lib/agenda';
import { agendamentoPorId } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { useTitulo } from '../hooks/useTitulo';
import NaoEncontrada from './NaoEncontrada';
import './Confirmacao.css';

export default function Confirmacao() {
  useTitulo('Agendamento');
  const { id } = useParams();
  const { state } = useLocation();
  const { usuario, ehAdmin } = useAuth();
  const a = agendamentoPorId(id);

  if (!a || (a.usuarioId !== usuario.id && !ehAdmin)) return <NaoEncontrada />;

  const { lista } = resumoServicos(a.servicos);
  const barbeiro = barbeiroPorId(a.barbeiroId);
  const novo = state?.novo && a.status === 'confirmado';
  const mensagem = `Salve! Acabei de agendar pelo site: ${lista.map((s) => s.nome).join(' + ')} com ${barbeiro?.nome} em ${formatarDataLonga(a.data)} às ${a.inicio}. Nome: ${usuario.nome}.`;

  return (
    <div className="page confirmacao">
      <div className="container confirmacao__inner">
        <div className="confirmacao__selo" aria-hidden="true"><FiCheck /></div>
        <span className="tag confirmacao__tag">{novo ? 'tá marcado!' : ROTULO_STATUS[a.status]}</span>
        <h1 className="page__title">{novo ? 'Horário confirmado' : 'Detalhes do agendamento'}</h1>
        <p className="lead">
          {novo
            ? `Valeu, ${usuario.nome.split(' ')[0]}! Te esperamos na ${barbearia.nomeCurto}. Chegue uns 5 minutinhos antes.`
            : 'Confira as informações do seu horário.'}
        </p>

        <div className="ticket card">
          <div className="ticket__topo">
            <div>
              <span className="ticket__rotulo">Quando</span>
              <strong className="ticket__data">{formatarDataLonga(a.data)}</strong>
              <span className="ticket__hora"><FiClock /> {a.inicio} às {a.fim} · {formatarDuracao(a.duracao)}</span>
            </div>
            <span className={`badge badge--${a.status}`}>{ROTULO_STATUS[a.status]}</span>
          </div>
          <div className="ticket__corte" aria-hidden="true" />
          <dl className="ticket__lista">
            <div><dt><FiScissors /> Serviços</dt><dd>{lista.map((s) => s.nome).join(' + ')}</dd></div>
            <div><dt><FiUser /> Barbeiro</dt><dd>{barbeiro?.nome}{a.semPreferencia && <span className="muted"> (escolhido pela casa)</span>}</dd></div>
            <div><dt><FiMapPin /> Local</dt><dd><a href={linkMapa()} target="_blank" rel="noopener noreferrer" className="link">{barbearia.endereco.rua}, {barbearia.endereco.cidade}</a></dd></div>
            {a.observacao && <div><dt>Observação</dt><dd>{a.observacao}</dd></div>}
          </dl>
          <div className="ticket__total">
            <span>Total a pagar na barbearia</span>
            <strong>{formatarMoeda(a.total)}</strong>
          </div>
        </div>

        <div className="confirmacao__acoes">
          {a.status === 'confirmado' && (
            <>
              <a href={linkGoogleAgenda(a)} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                <FiCalendar /> Adicionar à agenda
              </a>
              <a href={linkWhatsApp(mensagem)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <FaWhatsapp /> Avisar no WhatsApp
              </a>
            </>
          )}
          <Link to={ehAdmin && a.usuarioId !== usuario.id ? '/painel' : '/meus-agendamentos'} className="btn btn--ghost">
            {ehAdmin && a.usuarioId !== usuario.id ? 'Voltar ao painel' : 'Ver meus agendamentos'}
          </Link>
        </div>
        <Link to="/" className="link confirmacao__home">Voltar para o início</Link>
      </div>
    </div>
  );
}
