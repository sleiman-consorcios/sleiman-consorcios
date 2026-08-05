# Sleiman Consórcios — Landing Page & Admin

Projeto de Landing Page profissional para venda de consórcios, com painel administrativo integrado para gestão de conteúdo e leads.

## 🚀 Tecnologias

- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI.
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage).
- **Hospedagem:** Vercel.
- **Testes:** Vitest.

## 🛠️ Configuração Local

1. Instale as dependências:
   ```bash
   npm install
   # ou
   bun install
   ```

2. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz.
   - Adicione suas chaves do Supabase (veja `.env.example`).

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🧪 Testes

Execute a suíte de testes unitários:
```bash
npm test
```

## 🖼️ Assets estáticos

As imagens e vídeos da landing page são servidos pela Vercel a partir de
`public/assets/`. As URLs salvas no banco (bucket `site-assets` do Supabase)
são traduzidas em tempo de leitura para `/assets/<nome-do-arquivo>`; se o
arquivo local não existir, o componente faz fallback automático para a URL
original do Supabase.

Para copiar os arquivos, baixe os objetos do bucket e coloque-os em
`public/assets/` mantendo apenas o nome do arquivo (sem subpastas).

A variável `VITE_ASSETS_MODE` controla a origem:

- `local` (padrão) — usa `public/assets/` com fallback para o Supabase.
- `supabase` — ignora os arquivos locais e serve tudo do Storage (rollback
  rápido, sem precisar alterar código).

O upload pelo painel admin continua enviando para o Supabase Storage
(agora em WebP e com `cache-control` de 1 ano).

## 📦 Deploy e Migração

Para migrar este projeto para sua própria infraestrutura (GitHub/Supabase/Vercel) de forma 100% independente, siga as instruções em:
👉 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** (Guia Técnico Detalhado)
👉 **[MIGRATION.md](./MIGRATION.md)** (Resumo do Processo)

## 📂 Estrutura do Banco de Dados

O script para recriar todo o ambiente de dados (tabelas, RLS e triggers) está em:
👉 **[DUMP_ESTRUTURA.sql](./DUMP_ESTRUTURA.sql)**

---

Desenvolvido para máxima performance, SEO e facilidade de gestão.
