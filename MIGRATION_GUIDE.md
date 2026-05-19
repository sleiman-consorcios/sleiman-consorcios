# Guia de Migração Técnica: Sleiman Consórcios

Este guia fornece instruções passo a passo para migrar o projeto do ambiente Lovable para uma infraestrutura independente do cliente.

## Pré-requisitos
- Conta no **GitHub**
- Conta no **Supabase**
- Conta na **Vercel**

---

## 1. Configuração do Repositório (GitHub)

1. Crie um novo repositório no GitHub do cliente.
2. Clone o repositório atual do Lovable ou baixe o código-fonte.
3. Configure o novo repositório como o remoto principal:
   ```bash
   git remote add client-origin https://github.com/usuario/cliente-repo.git
   git push client-origin main
   ```

## 2. Configuração do Backend (Supabase)

1. **Novo Projeto:** Crie um projeto no Supabase.
2. **Schema do Banco:** Execute o conteúdo do arquivo `DUMP_ESTRUTURA.sql` no **SQL Editor** do Supabase. Este script cria:
   - Tabelas (`leads`, `site_config`, `site_content`, `admin_profiles`, `content_versions`)
   - Políticas RLS (Segurança)
   - Triggers de timestamp
   - Funções auxiliares
3. **Storage:**
   - Crie um bucket chamado `site-assets`.
   - Configure o acesso como **Public**.
4. **Usuário Administrador:**
   - Registre um e-mail em **Authentication**.
   - Identifique o `UUID` do usuário e insira-o na tabela `admin_profiles` para habilitar o painel administrativo:
     ```sql
     INSERT INTO public.admin_profiles (user_id, role) VALUES ('SEU-UUID-AQUI', 'admin');
     ```

## 3. Deployment e Hospedagem (Vercel)

1. Conecte o repositório do GitHub à Vercel.
2. Configure as seguintes **Environment Variables**:
   - `VITE_SUPABASE_URL`: A URL da API do seu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: A chave anônima (public) do seu projeto Supabase.
3. O build command padrão (`npm run build`) já executará os testes automatizados via Vitest antes de gerar o bundle de produção.

## 4. Scripts e Automação

O projeto inclui:
- **Testes Unitários:** Localizados em `src/**/*.test.ts(x)`. Rode com `npm test`.
- **DUMP de Dados:** O arquivo `DUMP_ESTRUTURA.sql` é a "fonte da verdade" para o banco de dados.

## 5. Checklist de Sucesso

- [ ] Leads sendo salvos no novo banco de dados.
- [ ] Painel administrativo acessível com o novo usuário.
- [ ] Upload de imagens funcionando no novo bucket.
- [ ] Deploy automático configurado via GitHub -> Vercel.

---
*Documentação gerada automaticamente para garantir o desacoplamento total do ambiente de desenvolvimento.*
