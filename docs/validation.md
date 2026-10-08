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

```sh
npm run db:local
```

O Wrangler aplica somente migrations pendentes no D1 local. Para um banco remoto novo e configurado na sua conta Cloudflare, use `npm run db:remote` antes da primeira publicação.

## Hospedagem independente — 08/10/2026

- Puxada a versão `986591a` do GitHub. Confirmado 404 no Pages: workflow publicou a raiz sem index.html e sem build; o aplicativo exige Worker/D1.
- Removido o workflow de Pages e os plugins de hospedagem do Sites do build. Configuração independente em wrangler.jsonc, Worker padrão do Vinext e scripts de deploy direto.
- TypeScript, ESLint (sem erros; seis avisos existentes), build de produção e migrations locais aprovados.
- Catálogo com 23 veículos, detalhe, administração pública de login, créditos e imagem retornaram 200 em Worker local. Rota inexistente retornou 404; gravação sem sessão retornou 403; leituras repetidas preservaram a quantidade.
- Banco remoto novo criado na conta Cloudflare do proprietário, separado do Sites; transferência dos 23 registros e marcas de inicialização preservadas.
- Login Google real ainda depende do Client ID e de autorizar a origem nova no Google.
