import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import { FiArrowRight, FiArrowUpRight, FiCalendar, FiCheck, FiClock, FiMapPin, FiPhone, FiScissors, FiStar } from 'react-icons/fi';
import heroSm from '../assets/img/hero-sm.webp';
import hero from '../assets/img/hero.webp';
import ilustraCorte from '../assets/img/ilustra-corte.webp';
import ilustraEspelho from '../assets/img/ilustra-espelho.webp';
import { barbearia, barbeiros, galeria, servicos } from '../data/barbearia';
import { formatarDuracao, formatarMoeda, linkMapa, linkMapaEmbed, linkWhatsApp } from '../lib/agenda';
import { useReveal } from '../hooks/useReveal';
import { useTitulo } from '../hooks/useTitulo';
import './Home.css';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];
const precoMinimo = Math.min(...servicos.map((s) => s.preco));

export default function Home() {
  useTitulo();
  useReveal();
  const hoje = new Date().getDay();

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <picture className="hero__bg">
          <source media="(min-width: 900px)" srcSet={hero} />
          <img src={heroSm} alt="Ilustração de uma barbearia de quebrada: barbeiro com camisa da seleção cortando o cabelo de um menino" />
        </picture>
        <div className="hero__veu" aria-hidden="true" />

        <div className="container hero__conteudo">
          <span className="eyebrow">Barbearia · {barbearia.endereco.cidade}</span>
          <h1 className="hero__titulo">
            Corte de respeito.
            <span className="gold">Na régua.</span>
          </h1>
          <p className="hero__tag tag">da quebrada pro mundo</p>
          <p className="lead">
            Degradê, barba e freestyle com acabamento de primeira. Escolhe o serviço, o barbeiro e o horário
            em menos de um minuto. Sem fila, sem espera.
          </p>
          <div className="hero__ctas">
            <Link to="/agendar" className="btn btn--primary btn--lg">
              <FiCalendar /> Agendar horário
            </Link>
            <Link to={{ hash: '#servicos' }} className="btn btn--ghost btn--lg">
              Ver serviços e preços
            </Link>
          </div>
        </div>

        <div className="container hero__infos">
          <div><FiClock /> <span><strong>Seg a Sáb</strong> 8h às 18h</span></div>
          <div><FiScissors /> <span><strong>A partir de {formatarMoeda(precoMinimo)}</strong> por serviço</span></div>
          <div><FiStar /> <span><strong>{barbeiros.length} barbeiros</strong> na casa</span></div>
        </div>
      </section>

      {/* ---------- FAIXA ---------- */}
      <div className="faixa" aria-hidden="true">
        <div className="faixa__trilho">
          {[0, 1].map((k) => (
            <span key={k}>
              {servicos.map((s) => (
                <span key={s.id}>{s.nome} <i>✦</i> </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- SOBRE ---------- */}
      <section id="sobre" className="section sobre">
        <div className="container sobre__grid">
          <figure className="sobre__arte" data-reveal>
            <img src={ilustraCorte} alt="Ilustração de um barbeiro fazendo o acabamento no cabelo de um cliente" loading="lazy" />
            <figcaption className="tag">desde a laje até a cadeira</figcaption>
          </figure>
          <div className="sobre__texto">
            <span className="eyebrow" data-reveal>Sobre a casa</span>
            <h2 className="display" data-reveal>
              Mais que barbearia. <span className="gold">É o ponto da quebrada.</span>
            </h2>
            <p className="lead" data-reveal>
              A NaRégua nasceu na rua, entre amigos que cortavam cabelo na garagem. Hoje é casa cheia,
              com cadeira boa, som rolando e o mesmo cuidado de sempre. Aqui todo mundo sai alinhado
              e respeitado.
            </p>
            <ul className="sobre__lista">
              {[
                ['Horário é compromisso', 'Agendou, é atendido na hora. Seu tempo vale.'],
                ['Acabamento na navalha', 'Cada detalhe revisado antes de você levantar.'],
                ['Ambiente de respeito', 'Lugar de troca, de resenha e de sair na estica.'],
              ].map(([titulo, texto], i) => (
                <li key={titulo} data-reveal style={{ '--delay': `${i * 0.08}s` }}>
                  <span className="sobre__check"><FiCheck /></span>
                  <div>
                    <strong>{titulo}</strong>
                    <p className="muted">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- SERVIÇOS ---------- */}
      <section id="servicos" className="section servicos">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow" data-reveal>Serviços e preços</span>
              <h2 className="display" data-reveal>O que rola <span className="gold">na cadeira</span></h2>
            </div>
            <p className="lead" data-reveal>
              Preço justo, sem surpresa no final. Monte seu combo no agendamento: o valor e o tempo
              aparecem na hora.
            </p>
          </div>

          <div className="servicos__grid">
            {servicos.map((s, i) => (
              <article key={s.id} className="servico" data-reveal style={{ '--delay': `${(i % 3) * 0.08}s` }}>
                <div className="servico__img">
                  <img src={s.img} alt={`Exemplo de ${s.nome}`} loading="lazy" />
                </div>
                <div className="servico__corpo">
                  <div className="servico__topo">
                    <h3>{s.nome}</h3>
                    <span className="servico__preco">{formatarMoeda(s.preco)}</span>
                  </div>
                  <p className="muted">{s.descricao}</p>
                  <div className="servico__rodape">
                    <span className="servico__tempo"><FiClock /> {formatarDuracao(s.duracao)}</span>
                    <Link to={`/agendar?servico=${s.id}`} className="servico__link">
                      Agendar <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COMO FUNCIONA ---------- */}
      <section className="section passos">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" data-reveal>Agendamento online</span>
            <h2 className="display" data-reveal>Marcou, <span className="gold">tá marcado.</span></h2>
          </div>
          <ol className="passos__lista">
            {[
              ['Escolhe o serviço', 'Um ou vários. O total e a duração já aparecem na tela.'],
              ['Escolhe barbeiro e horário', 'Só aparecem os horários livres de verdade, de cada barbeiro.'],
              ['Chega e fica na régua', 'Confirmação na hora, lembrete na agenda do celular e pronto.'],
            ].map(([titulo, texto], i) => (
              <li key={titulo} className="passo" data-reveal style={{ '--delay': `${i * 0.1}s` }}>
                <span className="passo__num">0{i + 1}</span>
                <h3>{titulo}</h3>
                <p className="muted">{texto}</p>
              </li>
            ))}
          </ol>
          <div className="passos__cta" data-reveal>
            <Link to="/agendar" className="btn btn--primary btn--lg"><FiCalendar /> Agendar agora</Link>
          </div>
        </div>
      </section>

      {/* ---------- EQUIPE ---------- */}
      <section id="equipe" className="section equipe">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow" data-reveal>A equipe</span>
              <h2 className="display" data-reveal>Quem faz <span className="gold">acontecer</span></h2>
            </div>
            <p className="lead" data-reveal>
              Cada um com sua especialidade. Escolhe o seu de confiança ou deixa que a gente encaixa
              com quem estiver livre.
            </p>
          </div>

          <div className="equipe__grid">
            {barbeiros.map((b, i) => (
              <article key={b.id} className="barbeiro" data-reveal style={{ '--delay': `${i * 0.08}s` }}>
                <div className="barbeiro__foto">
                  <img src={b.img} alt={`Barbeiro ${b.nome}`} loading="lazy" />
                </div>
                <div className="barbeiro__info">
                  <h3>{b.nome}</h3>
                  <p className="muted">{b.especialidade}</p>
                  <Link to={`/agendar?barbeiro=${b.id}`} className="servico__link">
                    Agendar com {b.nome} <FiArrowRight />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GALERIA ---------- */}
      <section id="galeria" className="section galeria">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <span className="eyebrow" data-reveal>Galeria</span>
              <h2 className="display" data-reveal>Trampo <span className="gold">que fala</span></h2>
            </div>
            <div data-reveal>
              <a href={barbearia.instagram} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <FaInstagram /> Siga {barbearia.instagramUsuario} <FiArrowUpRight />
              </a>
            </div>
          </div>

          <div className="galeria__grid">
            {galeria.map((g, i) => (
              <figure key={g.legenda} className={`galeria__item galeria__item--${i + 1}`} data-reveal style={{ '--delay': `${(i % 3) * 0.08}s` }}>
                <img src={g.img} alt={g.legenda} loading="lazy" />
                <figcaption>{g.legenda}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTATO ---------- */}
      <section id="contato" className="section contato">
        <div className="container contato__grid">
          <div className="contato__info">
            <span className="eyebrow" data-reveal>Onde estamos</span>
            <h2 className="display" data-reveal>Cola <span className="gold">com a gente</span></h2>

            <ul className="contato__lista" data-reveal>
              <li>
                <FiMapPin />
                <div>
                  <strong>{barbearia.endereco.rua}</strong>
                  <span className="muted">{barbearia.endereco.cidade}</span>
                  <a href={linkMapa()} target="_blank" rel="noopener noreferrer" className="link">Ver rota no mapa</a>
                </div>
              </li>
              <li>
                <FiPhone />
                <div>
                  <strong>{barbearia.telefone}</strong>
                  <span className="muted">Ligação ou WhatsApp</span>
                </div>
              </li>
            </ul>

            <div className="horarios card" data-reveal>
              <h3>Horário de funcionamento</h3>
              <ul>
                {ORDEM_DIAS.map((d) => {
                  const h = barbearia.horarios[d];
                  return (
                    <li key={d} className={d === hoje ? 'is-hoje' : ''}>
                      <span>{DIAS[d]}{d === hoje && <em> · hoje</em>}</span>
                      <span>{h ? `${h.abre} às ${h.fecha}` : 'Fechado'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="contato__ctas" data-reveal>
              <a href={linkWhatsApp('Salve! Vim pelo site da NaRégua.')} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <FaWhatsapp /> Chamar no WhatsApp
              </a>
              <Link to="/agendar" className="btn btn--primary"><FiCalendar /> Agendar horário</Link>
            </div>
          </div>

          <div className="contato__mapa" data-reveal>
            <iframe
              title={`Mapa: ${barbearia.endereco.mapa}`}
              src={linkMapaEmbed()}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="cta-final">
        <img src={ilustraEspelho} alt="" className="cta-final__bg" loading="lazy" />
        <div className="container cta-final__conteudo" data-reveal>
          <p className="tag">e aí, bora?</p>
          <h2 className="display">Seu próximo corte <span className="gold">começa aqui.</span></h2>
          <Link to="/agendar" className="btn btn--primary btn--lg"><FiCalendar /> Agendar meu horário</Link>
        </div>
      </section>
    </>
  );
}
