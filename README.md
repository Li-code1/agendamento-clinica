# Agendamento de Consulta — MVP

MVP de um sistema de agendamento de consultas para uma clínica, desenvolvido como teste técnico para a vaga de Estagiário Full Stack. Substitui o processo manual de agendar consultas por WhatsApp por um fluxo simples de auto-agendamento: o paciente escolhe uma data, vê os horários livres e confirma o agendamento.

## Sumário

1. [Tecnologias utilizadas](#tecnologias-utilizadas)
2. [Arquitetura](#arquitetura)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração do Supabase](#configuração-do-supabase)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Instalação](#instalação)
7. [Migrations](#migrations)
8. [Como iniciar o backend](#como-iniciar-o-backend)
9. [Como iniciar o frontend](#como-iniciar-o-frontend)
10. [Endpoints](#endpoints)
11. [Regras de negócio](#regras-de-negócio)
12. [Integração com a Nager API](#integração-com-a-nager-api)
13. [Timezone](#timezone)
14. [Decisões técnicas](#decisões-técnicas)
15. [Deploy (Vercel)](#deploy-vercel)

## Tecnologias utilizadas

**Frontend:** React, Vite, TypeScript, Tailwind CSS
**Backend:** Node.js, Express, TypeScript
**Banco de dados:** PostgreSQL (Supabase)
**ORM:** Prisma
**Validação:** Zod
**API externa:** [Nager.Date](https://date.nager.at/) (feriados nacionais do Brasil)

## Arquitetura

```
[React SPA] --HTTP/JSON--> [Express API] --Prisma--> [PostgreSQL/Supabase]
                                  |
                                  +--HTTP--> [Nager API de feriados]
```

Toda a regra de negócio (disponibilidade, feriados, conflitos de horário) vive no backend. O frontend apenas exibe o que a API retorna e reenvia a intenção do usuário — nunca decide sozinho se um agendamento é válido. Isso significa que o `POST /appointments` revalida tudo de novo, mesmo que o frontend já tenha bloqueado a UI para horários indisponíveis.

```
project/
├── frontend/          # React + Vite + TS + Tailwind
├── backend/           # Node + Express + TS + Prisma
├── README.md
└── docker-compose.yml
```

## Pré-requisitos

- Node.js 18 ou superior (o backend usa o `fetch` nativo do Node)
- Uma conta gratuita no [Supabase](https://supabase.com)
- npm

## Configuração do Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (ou faça login).
2. Clique em **New Project**.
3. Escolha uma organização, dê um nome ao projeto (ex: `agendamento-clinica`), defina uma senha para o banco (guarde-a) e escolha a região mais próxima (ex: São Paulo).
4. Aguarde o projeto ser provisionado (leva 1-2 minutos).
5. No painel do projeto, vá em **Project Settings → Database**.
6. Em **Connection string**, copie a URL no modo **Connection pooling** (recomendado para aplicações serverless/curta duração) ou a conexão direta (para uso local contínuo). Ela tem o formato:
   ```
   postgresql://postgres:[SUA-SENHA]@[HOST]:5432/postgres
   ```
7. Substitua `[SUA-SENHA]` pela senha definida no passo 3.

## Variáveis de ambiente

Copie os arquivos de exemplo e preencha com seus valores:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**
```
DATABASE_URL=postgresql://postgres:SUA_SENHA@SEU_HOST:5432/postgres
PORT=3333
TIMEZONE=America/Sao_Paulo
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:3333
```

Nenhum arquivo `.env` é versionado (veja `.gitignore`); apenas os `.env.example` vão para o repositório.

## Instalação

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

## Migrations

Com o `DATABASE_URL` já configurado em `backend/.env`:

```bash
cd backend
npx prisma migrate dev --name init
```

Isso cria a tabela `appointments` no Supabase e gera o Prisma Client.

## Como iniciar o backend

```bash
cd backend
npm run dev
```

A API sobe em `http://localhost:3333` (verifique em `GET /health`).

## Como iniciar o frontend

```bash
cd frontend
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Endpoints

### `GET /available?date=YYYY-MM-DD`

Retorna os horários disponíveis para a data informada.

```json
{ "date": "2026-02-10", "available": true, "slots": ["08:00", "09:00", "..."] }
```

Fim de semana ou feriado:

```json
{ "date": "2026-02-14", "available": false, "reason": "WEEKEND", "slots": [] }
```

### `POST /appointments`

```json
{ "patientName": "Maria Silva", "date": "2026-02-10", "time": "10:00" }
```

Sucesso (`201`):

```json
{
  "id": "...",
  "patientName": "Maria Silva",
  "date": "2026-02-10",
  "time": "10:00",
  "message": "Agendamento realizado com sucesso"
}
```

Horário ocupado → `409 Conflict`.

### `GET /appointments`

Lista todos os agendamentos salvos.

## Regras de negócio

- Funcionamento: 08:00 às 18:00, consultas de 1h → slots de 08:00 a 17:00.
- Não é possível agendar aos sábados, domingos, feriados nacionais ou em horários já ocupados.
- Todas as regras são revalidadas no backend no `POST /appointments`, independentemente do que o frontend já validou.
- A constraint `UNIQUE(date, time)` no banco impede double-booking mesmo em caso de requisições simultâneas.

## Integração com a Nager API

O backend consulta `https://date.nager.at/api/v3/PublicHolidays/{ano}/BR` para obter os feriados nacionais do ano da data consultada. O resultado é mantido em cache em memória por ano (`holiday.service.ts`) para reduzir chamadas repetidas à API externa durante a execução do processo. Se a API estiver indisponível, o backend retorna `502 Bad Gateway` com uma mensagem genérica, sem expor detalhes internos.

## Timezone

Todas as datas e horários usam `America/Sao_Paulo` como referência (configurável via `TIMEZONE` no `.env`). Datas e horários trafegam como strings simples (`"YYYY-MM-DD"` e `"HH:mm"`), nunca como objetos `Date` com hora embutida, evitando o problema clássico de troca de dia por conversão de fuso horário.

## Decisões técnicas

- **Strings em vez de `Date` para date/time:** elimina ambiguidade de timezone ao persistir e comparar.
- **Cache de feriados por ano:** evita chamadas repetidas à API Nager sem esconder a consulta real por trás de dados fictícios.
- **Erro `P2002` do Prisma como fonte de verdade para conflitos:** garante consistência mesmo com requisições concorrentes, além da checagem prévia de disponibilidade.
- **Sem autenticação/cadastro/pagamentos:** fora do escopo do MVP, conforme especificado.

## Deploy (Vercel)

Dá para publicar na Vercel, mas os dois lados do projeto exigem uma configuração um pouco diferente:

- **Frontend (React + Vite):** funciona perfeitamente na Vercel sem ajustes — é o caso de uso padrão da plataforma. Basta importar o repositório, apontar o **Root Directory** para `frontend/`, e configurar a variável de ambiente `VITE_API_URL` apontando para a URL pública do backend.
- **Backend (Express + Prisma):** a Vercel roda código como funções serverless, não como um processo Express de longa duração. Para publicar esse backend lá, é preciso adaptar `app.ts`/`server.ts` para o formato de function handler da Vercel (ex: exportar o app Express a partir de `api/index.ts`), e usar a **connection string em modo pooling** do Supabase (porta `6543`, com `pgbouncer=true`) — conexões diretas do Postgres não seguram bem sob o modelo serverless, que abre e fecha conexões a cada invocação. Também é importante rodar `prisma generate` no build (`postinstall`), pois o Prisma Client precisa ser gerado no ambiente de deploy.

Alternativa mais simples para o backend, se o objetivo é só ter algo publicado para demonstrar o projeto: hospedar o backend em um serviço voltado a processos Node persistentes (Railway, Render, Fly.io) e deixar só o frontend na Vercel. Isso evita a adaptação para serverless e mantém o comportamento idêntico ao ambiente local.
