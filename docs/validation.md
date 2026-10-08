# Validação

## Versão pública com Google — 07/10/2026

- TypeScript, ESLint de app/lib/db e build de produção aprovados.
- Catálogo, consulta do estoque e fichas acessíveis sem sessão.
- Administração revisada em 390 e 1440 pixels, sem overflow.
- Removidos módulo, links e dependências da autenticação ChatGPT.
- Cabeçalhos de identidade ChatGPT não autorizam mais gravações.
- Gravações sem sessão, com sessão forjada, expirada, de outro e-mail ou público-alvo inválido: 403.
- Sessão assinada simulada apenas em ambiente local: administração acessível; validação de formulário preservada.
- Origem inválida bloqueada e logout apaga os cookies.
- Desafio Google: nonce assinado, cookie HttpOnly/SameSite=Strict, validade de cinco minutos e no-store.
- Google JWT inválido ou desafio ausente: 401; JSON incompleto: 400; origem inválida: 403; payload grande: 413.
- Sem configuração Google, login falha fechado (503) e o catálogo continua aberto.
- O simulador local pode reiniciar entre requests (503 explícito); apenas esses casos foram repetidos nos checks.
- Não foi validado um login Google real: o Client ID do proprietário ainda é necessário. O Client ID fictício usado para exercitar os endpoints ficou somente em arquivo local ignorado pelo Git.
- Segredos de sessão local e hospedado são diferentes; nenhum segredo está no código ou no Git.

## Banco local

Após gerar o build, aplique cada migration ainda pendente usando o nome exato:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_curvy_white_tiger.sql
```

Não reaplique migrations já executadas. A publicação gerencia o banco hospedado separadamente.
