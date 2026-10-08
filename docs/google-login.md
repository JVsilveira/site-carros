# Login administrativo com Google

O catálogo (`/`), as fichas (`/veiculos/:id`) e a consulta do estoque (`GET /api/vehicles`) não exigem login. Somente `/admin` e as gravações exigem uma sessão Google administrativa. O acesso público da hospedagem também precisa estar em `public`.

## Configuração no Google

1. No [Google Cloud Console](https://console.cloud.google.com/auth/clients), crie um cliente OAuth do tipo **Aplicativo da Web**.
2. Configure a tela de consentimento. Em modo de teste, inclua `joaovitor.santossilveira@gmail.com` entre os usuários de teste.
3. Adicione em **Origens JavaScript autorizadas**:
   - `http://localhost`
   - `http://localhost:4173`
   - `https://linha-motors.joaovitor-santossilv.chatgpt.site`
4. Copie o Client ID terminado em `.apps.googleusercontent.com`. Este fluxo usa o botão Google Identity Services com callback JavaScript; não necessita de Client Secret ou URI de redirecionamento.

Se o Google exigir domínio verificado para publicar a tela de consentimento, use um domínio próprio que você possa verificar. Não declare propriedade de `chatgpt.site`. Para desenvolvimento, use localhost e uma aplicação Google em modo de teste.

Referências oficiais: [configuração](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid), [validação dos tokens](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Ambiente local

Copie `.env.example` para `.env` e configure:

- `ADMIN_EMAIL`: e-mail Google autorizado a administrar a loja.
- `GOOGLE_CLIENT_ID`: Client ID público do aplicativo Web.
- `SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres, exclusivo deste ambiente. Nunca coloque esse valor em código, commit ou conversa.

Inicie usando o caminho absoluto do arquivo de ambiente:

```sh
npm run build
npm start -- --port 4173 --env-file /mnt/hd/Projetos/venda-de-carros/showroom/.env
```

Se mudar a porta, autorize essa origem no Google também. Abra pelo hostname `localhost` configurado no Google.

## Hospedagem

As mesmas três variáveis devem existir na configuração de ambiente do Sites. `SESSION_SECRET` é um segredo; o Client ID é público. Publicar uma versão aplica a configuração de ambiente. Nenhuma credencial é guardada em `.openai/hosting.json`.

## Sessões e permissões

- O servidor verifica assinatura RS256 com as chaves públicas do Google, emissor, Client ID, validade, nonce e e-mail verificado.
- Um desafio de login assinado expira em 5 minutos.
- Apenas `ADMIN_EMAIL` recebe a sessão administrativa.
- A sessão é assinada, expira em 8 horas e fica em cookie `HttpOnly`, `SameSite=Strict` e `Secure` em HTTPS.
- Tokens não são guardados em localStorage.
- Gravações e logout verificam a origem da requisição.
- Cabeçalhos `oai-authenticated-user-*` não autorizam operações.
- Sem configuração Google, o catálogo continua aberto e a administração permanece bloqueada.
