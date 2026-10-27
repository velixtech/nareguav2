# NaRégua Barbearia

Site completo de barbearia com agendamento online. Identidade de barbearia de quebrada, acabamento de marca premium.

**Da quebrada, com padrão de primeira.**

## O que tem no site

- **Home** com topo ilustrado, sobre a casa, serviços e preços, como funciona, equipe, galeria, horário de funcionamento, mapa e WhatsApp.
- **Cadastro e login** com validação, máscara de WhatsApp, senha protegida por hash (SHA-256 com sal) e botão de mostrar senha.
- **Agendamento em 4 passos**: serviços (soma valor e tempo), barbeiro (ou sem preferência), dia e horário (só mostra horários livres de verdade, respeitando expediente, duração do serviço e a agenda de cada barbeiro) e revisão.
- **Confirmação** com link para adicionar na agenda do Google e mensagem pronta para o WhatsApp.
- **Meus agendamentos**: próximos e histórico, com cancelamento até 2 horas antes.
- **Painel da barbearia** (conta admin): agenda do dia por barbeiro, faturamento previsto, ocupação, filtros e ações de concluir, marcar falta ou cancelar.
- **Responsivo** do celular à TV 4K (o layout escala proporcionalmente em telas grandes).

## Contas de demonstração

Criadas automaticamente na primeira visita, junto com uma agenda de exemplo:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Cliente | cliente@naregua.com | cliente123 |
| Barbearia (admin) | admin@naregua.com | admin123 |

A tela de login tem botões para entrar com cada uma em um clique. No painel, o botão **Restaurar dados demo** recria a agenda de exemplo a partir do dia de hoje.

> Não existe servidor: usuários e agendamentos ficam no `localStorage` do navegador. Cada navegador tem seus próprios dados. Para uso real em uma barbearia, as funções de `naregua/src/lib/db.js` devem ser trocadas por chamadas a uma API (Supabase, Firebase ou backend próprio).

## Rodando no seu computador (localhost)

Precisa do [Node.js](https://nodejs.org) 20.19 ou mais novo (recomendado: 22).

```bash
git clone https://github.com/velixtech/nareguav2.git
cd nareguav2
npm run setup     # instala as dependências (dentro de naregua/)
npm run dev       # ambiente de desenvolvimento
```

Abra **http://localhost:5173**. As alterações no código aparecem na hora.

Para ver exatamente a versão que vai para o ar:

```bash
npm run build     # gera naregua/dist
npm run preview   # serve a versão de produção em http://localhost:4173
```

**Testar no celular, tablet ou TV:** com o `npm run dev` rodando, o terminal mostra um endereço `Network` (ex.: `http://192.168.0.10:5173`). Abra esse endereço em qualquer aparelho conectado ao mesmo Wi-Fi.

## Publicando de graça (Vercel)

O projeto já está configurado (`vercel.json`). Só precisa conectar uma vez:

1. Entre em [vercel.com](https://vercel.com) com a conta do GitHub (plano Hobby, gratuito).
2. Clique em **Add New → Project** e importe o repositório `velixtech/nareguav2`.
3. Não precisa mudar nada nas configurações. Clique em **Deploy**. (Se você já tinha escolhido `naregua` como **Root Directory**, também funciona: essa pasta tem o próprio `vercel.json`.)

Pronto: o site fica em um endereço `https://nome-do-projeto.vercel.app`. A cada push na `main` ele é atualizado sozinho, e cada pull request ganha um link de prévia para testar antes de juntar.

O plano Hobby da Vercel é para uso não comercial, o que serve para portfólio. Quando o site for vendido para uma barbearia, publique na conta do cliente ou use a **Netlify** ou a **Cloudflare Pages** (ambas gratuitas e liberadas para uso comercial). A Netlify já está configurada pelo `netlify.toml`; na Cloudflare Pages use diretório raiz `naregua`, comando `npm run build` e pasta de saída `dist`.

## Personalizando para outra barbearia

Quase tudo fica em um arquivo só: **`naregua/src/data/barbearia.js`**

- nome, slogan, telefone, WhatsApp, Instagram e endereço (o mapa é gerado a partir do endereço)
- horário de funcionamento de cada dia e intervalo entre horários
- serviços (nome, descrição, preço, duração e foto)
- barbeiros (nome, especialidade e foto)
- fotos da galeria

As imagens ficam em `naregua/src/assets/img` (formato WebP). Cores e fontes ficam no topo de `naregua/src/styles/global.css`.

## Estrutura

```
naregua/
  index.html              metadados, fontes e ícones
  public/                 favicon, ícones e imagem de compartilhamento
  src/
    App.jsx               rotas
    data/barbearia.js     dados da barbearia
    lib/agenda.js         regras de horário, formatação e links
    lib/db.js             usuários, sessão, agendamentos e dados demo
    context/              login (AuthContext)
    components/           cabeçalho, rodapé, campos, diálogos
    pages/                Home, Login, Cadastro, Agendar, Confirmacao,
                          MeusAgendamentos, Painel, NaoEncontrada
    styles/global.css     cores, tipografia, botões e formulários
```

Rotas: `/`, `/login`, `/cadastro`, `/agendar`, `/agendamento/:id`, `/meus-agendamentos`, `/painel`.

Stack: React 18, React Router 7, Vite 7, CSS puro e react-icons.
