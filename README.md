# Portal SSO (portal-sso)

Interface (portal) da **Plataforma de Identidade e SSO**, construída com **Next.js (App Router)** e **Auth.js (NextAuth v5)**. O colaborador faz **login uma única vez** (por e-mail, via Amazon Cognito) e acessa as aplicações da empresa liberadas para o seu setor.

Este é o **frontend** do sistema. O backend (API) e a **documentação completa de instalação e operação** estão em **[`sso-auth-api`](../sso-auth-api)**.

**Stack:** Next.js (App Router) · React · Auth.js (NextAuth v5) · TypeScript · Tailwind CSS

---

## Arquitetura

```
┌──────────────┐  login    ┌─────────────────┐
│  portal-sso  │ ───────▶  │  Amazon Cognito │
│  (Next.js)   │ ◀───────  │     (login)     │
│  + Auth.js   │  tokens   └─────────────────┘
│              │
│  /apps       │  Bearer   ┌─────────────────┐
│  /admin      │ ───────▶  │  sso-auth-api   │  (valida token,
└──────────────┘           │  (API)          │   grupos, admin)
                           └─────────────────┘
```

- **Auth.js** cuida de todo o fluxo de login (OIDC: redirect, callback, tokens, sessão).
- O **Cognito** é o dono da identidade (usuários, senha, MFA).
- O **NestJS** valida o token e executa as regras (grupos, administração).

---

## Páginas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Tela inicial com botão **Entrar**. |
| `/apps` | Autenticado | Portal: aplicações liberadas para o setor do usuário. |
| `/admin` | Grupo `admin` | Painel de administração (convidar usuários, gerenciar setores). |
| `/api/auth/*` | — | Rotas internas do Auth.js (login, callback, logout). |

A lista de aplicações fica em [lib/apps.ts](lib/apps.ts) — cada item declara quais **grupos** podem vê-lo.

---

## Como funciona

- **Login por e-mail:** o usuário entra com e-mail e senha na tela do Cognito; volta ao portal já autenticado.
- **Acesso por setor:** o portal lê os grupos do usuário (claim `cognito:groups` no token) e mostra **apenas** as aplicações permitidas.
- **Administração:** quem é do grupo `admin` vê o botão **🛠️ Admin** e acessa o painel para **convidar** novos usuários (por e-mail) e **gerenciar** os setores.

---

## Configuração

### 1. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
AUTH_SECRET=                # gere com: npx auth secret
AUTH_URL=http://localhost:3001
AUTH_COGNITO_ID=            # App Client ID (mesmo do backend)
AUTH_COGNITO_SECRET=        # App Client Secret
AUTH_COGNITO_ISSUER=https://cognito-idp.<regiao>.amazonaws.com/<userPoolId>
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> Os valores de Cognito (`AUTH_COGNITO_*`) são os mesmos gerados pelo `npm run setup:pool` do backend. O **issuer** segue o formato `https://cognito-idp.<regiao>.amazonaws.com/<userPoolId>`.

### 2. App Client no Cognito

Se o ambiente foi criado pelo `setup:pool`, as URLs de retorno já vêm configuradas. Caso contrário, no App Client garanta:

- **Callback URL**: `http://localhost:3001/api/auth/callback/cognito`
- **Sign-out URL**: `http://localhost:3001`
- **Authorization code grant** + scopes `openid email profile`.

---

## Como executar

```bash
npm install
npm run dev      # http://localhost:3001
```

> Rode o backend [`sso-auth-api`](../sso-auth-api) em paralelo (porta 3000).

### Primeiro administrador

A área `/admin` exige o grupo `admin`. Crie o primeiro administrador uma vez, pelo backend:

```bash
# no projeto sso-auth-api
npm run seed:admin -- seu-email@empresa.com
```

Depois faça **logout/login** no portal — o botão **🛠️ Admin** aparece. A partir daí, novos usuários e admins são gerenciados pelo próprio painel.

> ⚠️ A claim de grupos só atualiza em um **login novo**. Ao mudar o grupo de alguém, a pessoa precisa sair e entrar de novo.

---

## Estrutura

```
portal-sso/
├── app/
│   ├── page.tsx              # Tela inicial (login)
│   ├── apps/page.tsx         # Portal de aplicações
│   ├── admin/page.tsx        # Painel de administração
│   └── api/auth/[...]        # Auth.js
├── lib/
│   ├── apps.ts               # Catálogo de aplicações (+ grupos)
│   ├── api.ts                # Cliente da API NestJS
│   └── groups.ts             # Grupos gerenciados
├── auth.ts                   # Configuração do Auth.js (provider Cognito)
└── proxy.ts                  # Proteção de rotas (/apps, /admin)
```
