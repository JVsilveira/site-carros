# Linha Motors

Site de revenda com catálogo, busca, filtros, detalhes, galeria e administração protegida.

## Desenvolvimento

```sh
npm run install:ci
npm run db:generate
npm run build
```

Aplique as migrations em D1 local conforme os comandos em `docs/validation.md`. Inicie com `npm start`. O catálogo e os detalhes são públicos; somente a administração exige login com Google.

## Google e administração

Siga [docs/google-login.md](docs/google-login.md). Configure `ADMIN_EMAIL`, `GOOGLE_CLIENT_ID` e `SESSION_SECRET` no ambiente do Worker. O servidor valida a assinatura do token Google, emissor, público-alvo, expiração, nonce e e-mail verificado. Somente o e-mail em `ADMIN_EMAIL` recebe uma sessão administrativa. Cabeçalhos de identidade do ChatGPT não concedem acesso.

Dados de veículos e configurações ficam em D1. Três exemplos são inseridos apenas na primeira leitura; a marca de inicialização impede que veículos removidos reapareçam. Fotos de anúncios reais aceitam até 12 URLs HTTPS. O WhatsApp é opcional e configurável na administração; sem número, a interface informa que o contato estará disponível em breve.

## Fotos demonstrativas

- BMW: Patrick Tomasso — https://unsplash.com/photos/white-bmw-car-CP1cKFIl7qc
- Audi A6: Seifeddine Dridi — https://unsplash.com/photos/black-audi-vehicle-X82zIlot6zU
- Audi R8: Conor Samuel — https://unsplash.com/photos/black-audi-car-aIbR-deTiWY

Fotos sob a licença Unsplash. Valores e especificações são ilustrativos.

## Estoque usado demonstrativo

O lote `lib/demo-used-vehicles.json` acrescenta 20 anúncios (14 hatches e 6 picapes) uma única vez, com marca persistente em D1. Releituras não duplicam o lote nem recriam anúncios removidos. Fotos por modelo em `public/stock/`, com autores, fontes e licenças em `public/stock/credits.html`. Fotos podem representar outra versão, ano ou cor, como informado nas fichas.
