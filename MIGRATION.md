# Checklist de Migração (Decoupled)

Este documento resume os passos para tirar o projeto do Lovable e levar para sua própria infraestrutura. Para instruções detalhadas de comando, use o [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

## 1. Código Fonte
- [ ] Conectar este repositório ao seu GitHub pessoal/empresa.
- [ ] Garantir que a branch `main` está sincronizada.

## 2. Supabase (Banco & Auth)
- [ ] Criar novo projeto no Supabase.
- [ ] Rodar o script `DUMP_ESTRUTURA.sql` no SQL Editor.
- [ ] Criar bucket `site-assets` (Público).
- [ ] Adicionar seu e-mail em Authentication e o respectivo UUID na tabela `admin_profiles`.

## 3. Vercel (Hospedagem)
- [ ] Importar o repo do GitHub na Vercel.
- [ ] Configurar `VITE_SUPABASE_URL`.
- [ ] Configurar `VITE_SUPABASE_ANON_KEY`.

## 4. Limpeza e Otimização
- [ ] Códigos não utilizados (como `NavLink.tsx`) foram removidos.
- [ ] Estrutura de pastas padronizada.
- [ ] Testes unitários validados (Vitest).

O sistema foi preparado para funcionar de forma totalmente independente, sem dependências de infraestrutura do Lovable.
