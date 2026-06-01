# Guia de Migração Técnica: Sleiman Consórcios (COM DADOS)

Este guia fornece instruções para migrar o projeto mantendo 100% dos dados e configurações atuais.

## Pré-requisitos
- Conta no **GitHub**
- Conta no **Supabase**
- Conta na **Vercel**

---

## 1. Configuração do Repositório (GitHub)
1. Crie um novo repositório no GitHub do cliente.
2. Configure o novo repositório como o remoto principal e envie o código:
   ```bash
   git remote add client-origin https://github.com/usuario/cliente-repo.git
   git push client-origin main
   ```

## 2. Configuração do Backend (Supabase)
1. **Novo Projeto:** Crie um projeto no Supabase.
2. **Importação Completa:** Copie o conteúdo do arquivo `DUMP_COMPLETO.sql` e cole no **SQL Editor** do seu novo projeto Supabase. Execute o script.
   - Isso criará todas as tabelas e **importará todos os textos, imagens e configurações** que você vê no site hoje.
3. **Storage:**
   - Crie um bucket chamado `site-assets`.
   - Configure o acesso como **Public**.
4. **Administrador:**
   - Cadastre seu e-mail em **Authentication**.
   - Pegue seu `UUID` e insira na tabela `admin_profiles`:
     ```sql
     INSERT INTO public.admin_profiles (user_id, role) VALUES ('SEU-UUID-AQUI', 'admin');
     ```

## 3. Hospedagem (Vercel)
1. Conecte o repositório na Vercel.
2. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do novo projeto.
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do novo projeto.

## 4. Checklist de Sucesso
- [ ] O site carrega com as mesmas cores e textos do original.
- [ ] Leads de teste aparecem no novo banco.
- [ ] O painel `/admin` funciona com o seu novo usuário.

---
*Este procedimento garante que você não perca nenhuma alteração feita durante o desenvolvimento no Lovable.*
