# Procedimento de Migração de Dados (Upgrade)

Se você já realizou a migração da estrutura (tabelas e código), utilize este procedimento para levar apenas o conteúdo atual (textos, imagens e configurações) para o seu novo ambiente.

### Passo Único: Importação de Dados
1. No seu novo projeto Supabase, vá em **SQL Editor**.
2. Abra e copie o conteúdo do arquivo `IMPORTAR_DADOS.sql` (disponível na raiz do repositório).
3. Cole no editor e clique em **Run**.

---

### O que este script faz?
- **Sincroniza as Configurações:** Cores, logos, Favicon, SEO e scripts de cabeçalho/corpo.
- **Sincroniza o Conteúdo:** Todos os textos de todas as seções (Sobre, Como Funciona, FAQ, etc) e os links das imagens que estão no Storage.
- **Mantém a Integridade:** Limpa os dados de teste antigos e insere a versão exata que está rodando no Lovable agora.

### Notas Importantes
- Certifique-se de que o bucket `site-assets` já foi criado no seu novo Supabase conforme o guia anterior.
- Os arquivos de imagem físicos permanecem nos mesmos links (URL do Supabase original do Lovable), a menos que você os baixe e faça upload no seu novo bucket e atualize as URLs manualmente.
