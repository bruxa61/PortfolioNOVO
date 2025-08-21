# Troubleshooting - Erro 502 Bad Gateway no Render

## Diagnóstico do Problema

O erro 502 Bad Gateway indica que o servidor não está respondendo corretamente. Aqui estão as etapas para resolver:

## 1. Verificar Logs no Render

1. Acesse o painel do Render
2. Vá para o seu serviço "portfolio-rafaela"
3. Clique na aba "Logs"
4. Procure por erros durante o startup ou runtime

## 2. Configurações Necessárias

Certifique-se de que as seguintes configurações estão corretas no Render:

### Variáveis de Ambiente
```
NODE_ENV=production
```

**NÃO configure:**
- `PORT` (o Render define automaticamente)
- `REPLIT_DOMAINS` (deve estar ausente)

### Comandos
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

## 3. Possíveis Causas e Soluções

### Causa 1: Processo não está iniciando
**Sintoma**: Logs mostram erro na inicialização
**Solução**: Verificar se todas as dependências estão instaladas

### Causa 2: Porta incorreta
**Sintoma**: "EADDRINUSE" ou problemas de rede
**Solução**: Remover variável PORT manual - o Render define automaticamente

### Causa 3: Dependências faltando
**Sintoma**: "Cannot find module" nos logs
**Solução**: Verificar se todos os packages estão em dependencies (não devDependencies)

### Causa 4: Build falhou
**Sintoma**: Arquivos estáticos não encontrados
**Solução**: 
1. Fazer rebuild manual no Render
2. Verificar se comando de build está correto

## 4. Etapas de Diagnóstico

1. **Redeploy**: Force um novo deploy no Render
2. **Check Logs**: Examine os logs de build e runtime
3. **Test Local**: Execute `npm run build && npm run start` localmente
4. **Verify Files**: Confirme que `/dist/public/` tem os arquivos gerados

## 5. Teste Local de Produção

Para testar localmente se está funcionando:

```bash
# Build da aplicação
npm run build

# Testar em modo produção
NODE_ENV=production npm run start
```

Depois acesse `http://localhost:5000` para verificar se funciona.

## 6. Configuração Recomendada no Render

1. **Repository**: Conectar repositório GitHub
2. **Branch**: main ou master
3. **Root Directory**: deixar vazio (raiz do projeto)
4. **Runtime**: Node
5. **Build Command**: `npm run build`
6. **Start Command**: `npm run start`
7. **Environment Variables**: apenas `NODE_ENV=production`

## 7. Se Ainda Não Funcionar

1. Delete o serviço no Render
2. Crie um novo serviço
3. Use as configurações acima
4. Aguarde o primeiro deploy completar totalmente

## Arquivos Importantes

- `render.yaml` - Configuração automatizada
- `package.json` - Scripts de build e start
- `server/index.ts` - Servidor principal
- `dist/public/` - Arquivos estáticos gerados