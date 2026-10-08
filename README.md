# Linha Motors

Site de revenda com catálogo público, busca, filtros, fichas, galeria e administração com Google. React/TypeScript, Vinext/Vite e Cloudflare Workers/D1.

## Rodar localmente

Requer Node.js 22.13 ou superior.

```sh
npm ci
npm run db:local
npm run dev
```

Abra http://localhost:5173. O D1 local é separado do banco hospedado. Os 23 veículos demonstrativos são inseridos uma vez; anúncios removidos não reaparecem.

Para configurar a administração, crie um arquivo **local e ignorado** `.dev.vars` com `ADMIN_EMAIL`, `GOOGLE_CLIENT_ID` e `SESSION_SECRET` (pelo menos 32 caracteres). Veja [login Google](docs/google-login.md).

## Publicar na Cloudflare

O GitHub Pages hospeda apenas arquivos estáticos e não executa este sistema, que precisa de servidor e banco de dados. O workflow anterior de Pages foi removido. A aplicação não depende de Sites, `.openai` ou domínio ChatGPT.

```sh
npx wrangler login
npx wrangler d1 create linha-motors
```

Copie o `database_id` retornado para o binding `DB` em `wrangler.jsonc`. O ID é um identificador público do recurso, não um segredo; o ID de exemplo serve somente para desenvolvimento local. Use um banco novo na sua conta, sem reaproveitar recursos do Sites.

```sh
npm run db:remote
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put SESSION_SECRET
npm run deploy
```

O comando de deploy gera o build e publica `dist/server/wrangler.json`. Não publique só `dist/client`: as rotas dependem do Worker. A Cloudflare informa o endereço `workers.dev` real ao final. Não é necessário domínio comprado. Autorize essa origem no cliente Google. Sem configuração Google válida, o catálogo fica aberto e a administração permanece bloqueada.

Para publicar a partir do GitHub, conecte este repositório em **Cloudflare > Workers & Pages > Create > Import a repository**. Configure o build `npm run build` e o deploy `npx wrangler deploy --config dist/server/wrangler.json`; configure o binding D1 e as três variáveis na Cloudflare. Aplique as migrations antes da primeira publicação. Segredos ficam exclusivamente no ambiente, nunca no Git.

## Fotos e dados

Valores, quilometragens, equipamentos e imagens dos 23 anúncios são demonstrativos. O lote de usados está em `lib/demo-used-vehicles.json`; suas licenças e fontes estão em [créditos](public/stock/credits.html). Fotos podem representar outra versão, ano ou cor.

- BMW: Patrick Tomasso — https://unsplash.com/photos/white-bmw-car-CP1cKFIl7qc
- Audi A6: Seifeddine Dridi — https://unsplash.com/photos/black-audi-vehicle-X82zIlot6zU
- Audi R8: Conor Samuel — https://unsplash.com/photos/black-audi-car-aIbR-deTiWY

As três fotos acima seguem a licença Unsplash.
