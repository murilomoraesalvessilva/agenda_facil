# AGENDAÍ ◆

> Plataforma SaaS de agendamentos online para pequenos negócios — feita para Parnaíba, PI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-FF6B6B?style=flat-square)

---

## Sobre o projeto

O **Agendaí** é uma plataforma multi-tenant de agendamentos online voltada para os negócios de Parnaíba e região. Salões de beleza, barbearias, clínicas, psicólogos e outros segmentos podem criar sua página pública, configurar serviços e horários, e receber agendamentos — tudo com notificação automática via WhatsApp.

O modelo de negócio é SaaS com cobrança de mensalidade por estabelecimento.

---

## Páginas desenvolvidas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `app/page.tsx` | Landing page pública da plataforma |
| `/auth` | `app/auth/page.tsx` | Login e cadastro em 2 passos |
| `/onboarding` | `app/onboarding/page.tsx` | Configuração inicial do negócio |
| `/dashboard` | `app/dashboard/page.tsx` | Painel do estabelecimento |
| `/[slug]` | `app/[slug]/page.tsx` | Página pública de agendamento |

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + estilos inline (CSS-in-JS nativo)
- **Fontes:** Barlow Condensed + Barlow (Google Fonts)
- **Roteamento:** `next/navigation` — `useRouter` e `Link`
- **Estado:** React hooks (`useState`, `useEffect`)

> Backend, banco de dados e integração com WhatsApp ainda não implementados. O projeto está em fase de front-end com dados mockados.

---

## Estrutura de pastas

```
agendai/
├── src/
│   └── app/
│       ├── page.tsx              # Landing page  →  /
│       ├── auth/
│       │   └── page.tsx          # Login / Cadastro  →  /auth
│       ├── onboarding/
│       │   └── page.tsx          # Onboarding  →  /onboarding
│       ├── dashboard/
│       │   └── page.tsx          # Dashboard  →  /dashboard
│       └── [slug]/
│           └── page.tsx          # Agendamento público  →  /barbearia-do-joao
├── public/
├── package.json
└── README.md
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+ e npm.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/agendai.git
cd agendai

# 2. Instale as dependências
npm install

# 3. Instale os componentes shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label select dialog badge avatar tabs

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Fluxo de navegação

```
/  (landing)
│
├──  ENTRAR / COMEÇAR  ──────────────▶  /auth
│
/auth
├──  Login confirmado  ──────────────▶  /dashboard
└──  Cadastro completo  ─────────────▶  /onboarding
│
/onboarding
├──  Finalizar configuração  ────────▶  /dashboard
└──  Ver página pública  ────────────▶  /[slug]
│
/dashboard
└──  Link da URL na sidebar  ────────▶  /[slug]
│
/[slug]
└──  Logo AGENDAÍ  ──────────────────▶  /
```

---

## Design

A identidade visual segue uma estética **brutalista/editorial** — sem bordas arredondadas, sem emojis como ícones, tipografia condensada pesada e paleta restrita.

| Token | Valor |
|-------|-------|
| Azul principal | `#1B4FD8` |
| Coral / destaque | `#FF6B6B` |
| Fundo | `#F5F2ED` |
| Texto | `#0A0A0A` |
| Fonte display | Barlow Condensed 900 |
| Fonte corpo | Barlow 400 |

---

## Roadmap

- [x] Landing page
- [x] Login e cadastro
- [x] Onboarding do estabelecimento
- [x] Dashboard com agenda e KPIs
- [x] Página pública de agendamento (`/[slug]`)
- [x] Navegação com `next/navigation`
- [ ] Backend com Node.js + Fastify
- [ ] Banco de dados PostgreSQL + Prisma
- [ ] Autenticação real (JWT / NextAuth)
- [ ] Multi-tenancy com `tenant_id`
- [ ] Notificações via WhatsApp (Evolution API)
- [ ] Sistema de pagamentos (Stripe / Pagar.me)
- [ ] Painel de relatórios
- [ ] App mobile

---

## Licença

MIT — sinta-se livre para usar, estudar e adaptar.

---

<div align="center">
  Feito com dedicação em <strong>Parnaíba, PI</strong> 🔴
</div>
