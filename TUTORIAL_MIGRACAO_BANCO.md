# 🚀 Tutorial: Migração de Banco de Dados do Render para Neon

## 📋 Índice
1. [Por que migrar?](#por-que-migrar)
2. [Preparação](#preparação)
3. [Passo 1: Criar conta no Neon](#passo-1-criar-conta-no-neon)
4. [Passo 2: Exportar dados do Render](#passo-2-exportar-dados-do-render)
5. [Passo 3: Configurar novo banco no Neon](#passo-3-configurar-novo-banco-no-neon)
6. [Passo 4: Importar dados para o Neon](#passo-4-importar-dados-para-o-neon)
7. [Passo 5: Atualizar aplicação no Render](#passo-5-atualizar-aplicação-no-render)
8. [Passo 6: Testar e validar](#passo-6-testar-e-validar)
9. [Alternativas ao Neon](#alternativas-ao-neon)

---

## Por que migrar?

### ❌ Problemas do Render (Plano Gratuito)
- **Dados não persistem**: Banco de dados pode ser deletado após 90 dias de inatividade
- **Recursos limitados**: 256 MB RAM, 1 GB storage
- **Suspende com frequência**: Pode desligar após períodos de inatividade

### ✅ Vantagens do Neon (Plano Gratuito)
- **3 GiB de storage** (vs 1 GB do Render)
- **191.9 horas/mês de computação** (suficiente para 24/7)
- **Backup automático PITR**: 24 horas de point-in-time restore
- **Database branching**: Crie ambientes de teste facilmente
- **Serverless**: Escala automaticamente e hiberna após 5 min de inatividade
- **Dados persistem**: Não há risco de perder seus dados

---

## Preparação

### ✅ Checklist antes de começar
- [ ] Acesso ao painel do Render
- [ ] Acesso ao repositório do código (GitHub)
- [ ] Email para criar conta no Neon
- [ ] Conexão estável à internet
- [ ] Tempo estimado: **30-40 minutos**

### ⚠️ Importante
- Faça a migração em um horário de baixo tráfego
- Avise possíveis usuários sobre manutenção (se aplicável)
- Mantenha o banco antigo ativo até confirmar que tudo funciona

---

## Passo 1: Criar conta no Neon

### 1.1 Acessar o site
1. Acesse: **https://neon.tech**
2. Clique em **"Sign Up"** (no canto superior direito)

### 1.2 Criar conta
Você pode criar conta usando:
- **GitHub** (recomendado - mais rápido)
- **Google**
- **Email**

**Escolha a opção GitHub** se seu código está lá - fica tudo integrado!

### 1.3 Verificar conta
- Se usar email, confirme o email de verificação
- Faça login no painel do Neon

✅ **Pronto!** Agora você tem acesso ao console do Neon.

---

## Passo 2: Exportar dados do Render

### 2.1 Acessar painel do Render
1. Acesse: **https://dashboard.render.com**
2. Faça login com sua conta
3. Clique no seu **PostgreSQL database** na lista de serviços

### 2.2 Obter credenciais de conexão
No painel do banco de dados:
1. Role até a seção **"Connections"**
2. Localize e copie a **"External Database URL"**
   - Formato: `postgresql://usuario:senha@host:5432/database`
3. **Guarde essa URL** - você vai precisar dela!

### 2.3 Exportar estrutura e dados

#### Opção A: Via terminal local (Recomendado)

Se você tem PostgreSQL instalado localmente:

```bash
# Exportar todo o banco (estrutura + dados)
pg_dump "SUA_DATABASE_URL_DO_RENDER" > backup_portfolio.sql

# Exemplo real:
# pg_dump "postgresql://portfolio_user:abc123@dpg-xyz.oregon-postgres.render.com/portfolio_db" > backup_portfolio.sql
```

#### Opção B: Via Replit (Alternativa fácil)

Se não tem PostgreSQL instalado:

1. Abra seu projeto no Replit
2. Abra o **Shell** (aba inferior)
3. Execute:

```bash
# Instalar PostgreSQL client (se necessário)
npm install -g pg

# Criar script de backup
cat > backup.js << 'EOF'
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'COLE_SUA_DATABASE_URL_DO_RENDER_AQUI'
});

await client.connect();

// Exportar estrutura
const tables = await client.query(`
  SELECT tablename FROM pg_tables 
  WHERE schemaname = 'public'
`);

console.log('Tabelas encontradas:', tables.rows.map(r => r.tablename));

await client.end();
EOF

# Executar
node backup.js
```

### 2.4 Verificar backup
- Abra o arquivo `backup_portfolio.sql`
- Confirme que contém:
  - `CREATE TABLE` statements
  - `INSERT INTO` statements com seus dados
  - Schemas das tabelas: projects, achievements, users, likes, comments, etc.

✅ **Backup criado com sucesso!**

---

## Passo 3: Configurar novo banco no Neon

### 3.1 Criar novo projeto
1. No painel do Neon, clique em **"Create a project"**
2. Preencha:
   - **Project name**: `portfolio-rafaela` (ou nome de sua preferência)
   - **Region**: Escolha **US East (Ohio)** (mais próximo do Render US)
   - **PostgreSQL version**: Deixe a padrão (16 ou mais recente)
3. Clique em **"Create project"**

### 3.2 Obter string de conexão
Após criar o projeto:
1. Na tela principal, você verá **"Connection string"**
2. Clique em **"Pooled connection"** (melhor para aplicações web)
3. Copie a connection string - ela terá este formato:
   ```
   postgresql://usuario:senha@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **GUARDE ESSA URL** - você vai precisar em breve!

### 3.3 Configurar conexão SSL
Neon exige SSL. Verifique que sua connection string tem `?sslmode=require` no final.

✅ **Banco Neon criado!** Agora vamos importar os dados.

---

## Passo 4: Importar dados para o Neon

### 4.1 Via terminal local (Recomendado)

```bash
# Importar backup para o Neon
psql "SUA_DATABASE_URL_DO_NEON" < backup_portfolio.sql

# Exemplo real:
# psql "postgresql://usuario:senha@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require" < backup_portfolio.sql
```

Se der erro de SSL, adicione `sslmode=require`:
```bash
PGSSLMODE=require psql "SUA_DATABASE_URL_DO_NEON" < backup_portfolio.sql
```

### 4.2 Via Replit (Alternativa)

Se preferir fazer tudo no Replit:

```bash
# No Shell do Replit
# Definir a nova DATABASE_URL
export DATABASE_URL="SUA_DATABASE_URL_DO_NEON"

# Executar migrations (recria estrutura)
npm run db:push

# Importar dados manualmente via script
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// Inserir seus projetos, achievements, etc.
// (use os dados do backup ou do arquivo server/data/sample-projects.json)
"
```

### 4.3 Opção mais fácil: Recriar com dados iniciais

Como seu projeto já tem dados de exemplo em `server/data/`, você pode:

1. **No Replit**, edite o arquivo `.env` (ou crie se não existir):
   ```env
   DATABASE_URL=SUA_DATABASE_URL_DO_NEON
   SESSION_SECRET=seu-secret-aqui
   ```

2. Execute para recriar tabelas e dados:
   ```bash
   npm run db:push
   node -e "require('./server/init-db.js')"
   ```

### 4.4 Verificar dados importados

Acesse o **Neon Console**:
1. Clique na aba **"SQL Editor"**
2. Execute queries para verificar:
   ```sql
   -- Ver quantos projetos foram importados
   SELECT COUNT(*) FROM projects;
   
   -- Ver quantos achievements
   SELECT COUNT(*) FROM achievements;
   
   -- Ver todos os usuários
   SELECT * FROM users;
   
   -- Ver estrutura das tabelas
   \dt
   ```

✅ **Dados importados com sucesso!**

---

## Passo 5: Atualizar aplicação no Render

Agora vamos fazer seu site no Render usar o novo banco do Neon.

### 5.1 Atualizar variável de ambiente no Render

1. Acesse **https://dashboard.render.com**
2. Clique no seu **Web Service** (não no banco de dados)
3. Vá em **"Environment"** (menu lateral esquerdo)
4. Localize a variável `DATABASE_URL`
5. Clique em **"Edit"** (ícone de lápis)
6. **Cole a nova connection string do Neon**
7. Clique em **"Save Changes"**

### 5.2 Forçar novo deploy (opcional mas recomendado)

Para garantir que as mudanças sejam aplicadas:
1. Vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**
3. Aguarde o deploy completar (2-5 minutos)

**OU** simplesmente faça um commit vazio no GitHub:
```bash
git commit --allow-empty -m "Migrado banco para Neon"
git push
```

### 5.3 Monitorar logs

Durante o deploy:
1. Clique em **"Logs"** no painel do Render
2. Observe a mensagem de conexão com o banco:
   ```
   ✅ Database connection successful
   ```
3. Verifique se não há erros de conexão

✅ **Aplicação atualizada!**

---

## Passo 6: Testar e validar

### 6.1 Testar site em produção

1. Acesse seu site: `https://seu-site.onrender.com`
2. Verifique:
   - [ ] Projetos carregam corretamente
   - [ ] Achievements aparecem
   - [ ] Likes funcionam
   - [ ] Comentários funcionam
   - [ ] Login admin funciona
   - [ ] Dashboard admin carrega dados

### 6.2 Testar funcionalidades

Faça testes práticos:
- **Curtir um projeto**: Verifica se grava no banco
- **Adicionar comentário**: Testa escrita no banco
- **Login admin**: Testa autenticação
- **Editar projeto no admin**: Testa update no banco
- **Criar novo achievement**: Testa insert no banco

### 6.3 Monitorar performance

No painel do **Neon**:
1. Vá em **"Monitoring"**
2. Observe:
   - **Queries por segundo**: Deve ser > 0 quando usar o site
   - **Storage usado**: Verifique quanto está usando
   - **Compute time**: Acompanhe consumo de horas

### 6.4 Configurar alertas (Opcional)

No Neon:
1. Configure notificações por email
2. Ative alertas para:
   - Storage > 2.5 GB (perto do limite)
   - Compute time alto

✅ **Tudo funcionando!** Migração completa!

---

## 🎉 Pós-migração

### ✅ O que fazer agora

1. **Aguarde 1 semana** - Monitore se tudo está funcionando perfeitamente
2. **Exporte backup semanal** do Neon (segurança extra)
3. **Documentar a nova DATABASE_URL** em local seguro

### 🗑️ Desativar banco antigo no Render

**SOMENTE** depois de confirmar que tudo funciona (1-2 semanas):

1. Acesse o painel do Render
2. Vá no seu PostgreSQL database
3. Clique em **"Settings"** → **"Delete Database"**
4. Confirme a exclusão

⚠️ **Cuidado**: Isso é **irreversível**! Só faça se tiver certeza absoluta.

### 📊 Monitoramento contínuo

Crie o hábito de:
- **Semanalmente**: Verificar uso de storage no Neon
- **Mensalmente**: Exportar backup completo
- **Sempre**: Manter código atualizado no GitHub (backup automático)

---

## Alternativas ao Neon

Se por algum motivo o Neon não atender suas necessidades, aqui estão outras opções:

### 1. **Supabase** (Melhor para backend completo)
- **Storage**: 500 MB banco + 1 GB arquivos
- **Extras**: Auth, Storage, Realtime, Edge Functions
- **Vantagens**: Plataforma completa, não deleta dados (vira read-only)
- **Link**: https://supabase.com

**Quando usar**: Se precisar de autenticação integrada, storage de arquivos, ou realtime.

### 2. **Railway** (Boa interface)
- **Storage**: $5 crédito/mês grátis (≈500 MB)
- **Vantagens**: Interface linda, fácil de usar
- **Link**: https://railway.app

**Quando usar**: Se prioriza experiência do usuário.

### 3. **ElephantSQL**
- **Storage**: 20 MB (muito pequeno)
- **Vantagens**: Simples, confiável, backups automáticos
- **Link**: https://elephantsql.com

**Quando usar**: Para projetos muito pequenos ou testes.

### 4. **Fly.io**
- **Crédito**: $5/mês gratuito
- **Vantagens**: Ferramentas dev excelentes
- **Link**: https://fly.io

**Quando usar**: Se gosta de linha de comando e quer controle total.

---

## 🆘 Solução de Problemas

### Erro: "Connection refused"
**Causa**: Firewall ou SSL incorreto  
**Solução**: 
- Adicione `?sslmode=require` na connection string
- Verifique se copiou a string completa (com senha)

### Erro: "Too many connections"
**Causa**: Limite de conexões atingido  
**Solução**:
- Use **Pooled connection** no Neon
- Configure connection pooling no código (já configurado no seu projeto)

### Erro: "Database not found"
**Causa**: Nome do banco incorreto  
**Solução**:
- Verifique o nome do banco na connection string
- Banco padrão do Neon é `neondb`

### Site não carrega dados
**Solução passo a passo**:
1. Verifique logs no Render: `"Database connection successful"`?
2. Teste connection string localmente no Replit
3. Confirme que tables foram criadas: `\dt` no SQL Editor do Neon
4. Verifique se dados existem: `SELECT * FROM projects LIMIT 5;`

### Dados desapareceram
**Causa**: Importação falhou  
**Solução**:
1. Reimportar backup: `psql "NEON_URL" < backup_portfolio.sql`
2. Ou reexecutar seed: `node server/init-db.js`

---

## 📚 Recursos Úteis

### Documentação
- **Neon Docs**: https://neon.tech/docs/introduction
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Ferramentas úteis
- **pg_dump**: Exportar banco PostgreSQL
- **psql**: Cliente PostgreSQL linha de comando
- **DBeaver**: Interface gráfica para gerenciar bancos (gratuito)

### Comandos úteis

```bash
# Exportar banco
pg_dump "DATABASE_URL" > backup.sql

# Importar banco
psql "DATABASE_URL" < backup.sql

# Conectar via psql
psql "DATABASE_URL"

# Ver tabelas
\dt

# Ver estrutura de uma tabela
\d nome_da_tabela

# Executar query
SELECT * FROM projects;
```

---

## ✅ Checklist Final

Antes de considerar a migração completa:

- [ ] Banco Neon criado e acessível
- [ ] Dados exportados do Render
- [ ] Dados importados para o Neon
- [ ] DATABASE_URL atualizada no Render
- [ ] Site em produção funcionando
- [ ] Todas as funcionalidades testadas
- [ ] Backup salvo em local seguro
- [ ] Monitoramento configurado

---

## 💡 Dicas Finais

1. **Mantenha sempre um backup local** dos seus dados
2. **Exporte dados mensalmente** como precaução
3. **Use branches do Neon** para testar mudanças antes de aplicar em produção
4. **Configure backups automáticos** (upgrade para $19/mês se precisar de 7 dias PITR)
5. **Documente suas credenciais** em gerenciador de senhas (1Password, Bitwarden)

---

## 🎯 Resultado Esperado

Após seguir este tutorial:
- ✅ Banco de dados mais confiável e com mais storage (3 GB vs 1 GB)
- ✅ Dados persistem sem risco de perda
- ✅ Backups automáticos (24h PITR)
- ✅ Melhor performance com serverless scaling
- ✅ Database branching para desenvolvimento

**Boa migração! 🚀**

---

**Criado para**: Rafaela Botelho  
**Data**: Outubro 2025  
**Versão**: 1.0
