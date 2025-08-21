# Deploy no Render

## Configuração Necessária

### 1. Variáveis de Ambiente no Render

Configure as seguintes variáveis de ambiente no painel do Render:

```
NODE_ENV=production
```

**IMPORTANTE**: 
- NÃO configure `REPLIT_DOMAINS` - deixe essa variável ausente para que a aplicação funcione em modo produção sem autenticação do Replit.
- NÃO configure `PORT` - o Render define automaticamente a porta correta e a aplicação se adapta automaticamente.

### 2. Configurações do Serviço

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Node Version**: 18+ ou 20+

### 3. Banco de Dados (Opcional)

Se quiser usar banco de dados PostgreSQL no Render:

1. Crie um banco PostgreSQL no Render
2. Configure a variável `DATABASE_URL` com a string de conexão
3. A aplicação automaticamente usará o banco quando disponível

Se não configurar banco, a aplicação funcionará com armazenamento em memória.

## Processo de Deploy

1. Conecte seu repositório GitHub ao Render
2. Configure as variáveis de ambiente acima
3. Configure os comandos de build e start
4. Deploy automático será executado

## Funcionalidades em Produção

- ✅ Visualização do portfólio
- ✅ Formulário de contato
- ✅ Seção de projetos e conquistas
- ✅ Interface responsiva
- ⚠️ Área admin sempre acessível (sem autenticação)

## Notas Importantes

- A aplicação roda na porta configurada pela variável `PORT` do Render
- Autenticação do Replit é automaticamente desabilitada em produção
- Todos os recursos funcionam normalmente, incluindo área administrativa
- Imagens e assets são servidos estaticamente