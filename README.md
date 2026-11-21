# Data Hub — documentação do sistema

O Data Hub é uma implementação própria de um fluxo de integração de dados: conectar uma fonte, selecionar contas, montar uma consulta, visualizar as linhas e escolher um destino. A aplicação abre no Google Ad Manager. A interface foi reorganizada a partir do fluxo de onboarding e dos guias de destinos fornecidos como referência.

## Como usar

1. Em **Adicionar dados**, escolha uma plataforma na lateral.
2. Clique em **Conceder acesso**. Na primeira utilização de uma fonte Google, configure seu aplicativo Google Cloud em Configurações.
3. Autorize o acesso na plataforma e selecione as contas disponíveis. É possível consultar até 10 contas da mesma fonte por vez.
4. Em **Prévia e destino**, escolha as contas, o período e os campos. Os campos disponíveis mudam de acordo com a fonte.
5. Clique em **Atualizar prévia**. O sistema consulta a origem e mostra as linhas retornadas.
6. Confira as colunas e use CSV, JSON, Google Sheets ou BigQuery. **Salvar consulta** guarda a configuração para reutilização.

**Explorar com dados de exemplo** permite conferir o fluxo sem conectar uma conta. Os exemplos aparecem identificados na tela e nos nomes dos arquivos baixados. Destinos online e consultas salvas exigem dados/configurações reais. Consultas com dados reais também podem retornar zero linhas.

## Fontes implementadas

| Fonte | Autorização | Dados disponíveis nesta versão |
| --- | --- | --- |
| Google Ad Manager | OAuth Google ou access token | Redes acessíveis, data, pedidos, itens de linha, criativos, país, impressões, cliques e receita do servidor |
| Google Ads | OAuth Google ou access token + developer token | Contas diretamente acessíveis, campanhas diárias, status, moeda, impressões, cliques, custo, conversões, valor de conversão, CTR e CPC |
| Facebook Ads / Meta | Token com ads_read | Contas acessíveis, campanhas diárias, moeda, impressões, cliques, custo, conversões, valor de compras, CTR e CPC |
| Google Analytics 4 | OAuth Google ou access token | Propriedades acessíveis, canal, sessões, visualizações, eventos principais e receita |
| Google Search Console | OAuth Google ou access token | Propriedades acessíveis, páginas, cliques, impressões, CTR e posição média |

Os campos disponíveis na interface são o catálogo efetivamente implementado. Esta versão não contém os 141 campos do conector Google Ad Manager do Windsor nem centenas de conectores. Os clientes públicos do Windsor não fornecem seu backend completo. A aplicação consulta as APIs dos provedores diretamente; não exige uma chave Windsor. REA não é uma dependência de execução desta implementação.

### Google Ad Manager e Google Ads

Google Ad Manager é usado por publishers para monetização e gerenciamento de inventário publicitário. Google Ads é usado por anunciantes para campanhas e investimento. A interface e as consultas mantêm os produtos separados.

No Ad Manager, a descoberta usa `GET /v1/networks`. A prévia cria um relatório com visibilidade `HIDDEN`, dimensões/métricas selecionadas, intervalo fixo e tipo `HISTORICAL`; inicia a execução assíncrona; consulta a operação e busca as linhas com `fetchRows`. Esses relatórios são recursos da rede no Google; não há exclusão automática deles nesta versão. O processamento pode levar mais tempo: use **Continuar consulta** se a tela informar que o Google ainda está trabalhando.

As receitas do Ad Manager preservam o valor retornado pela API. O relatório solicita a moeda configurada na conexão (USD por padrão) e usa o fuso da rede. Tipos de dimensão e métrica precisam ser compatíveis segundo o Google; a API informa quando a combinação não é permitida. IDs inteiros grandes são preservados como texto.

No Google Ads, a descoberta lista contas diretamente acessíveis pelo usuário autenticado. Para subcontas de MCC, a conexão manual pelo ID está disponível; configurações avançadas como loginCustomerId continuam aceitas na API de conexões. Tokens precisam ter acesso efetivo à conta.

## Configurar o Google

1. Crie um cliente OAuth do tipo **Aplicativo Web** no Google Cloud.
2. Habilite as APIs que vai usar: Google Ad Manager API, Google Ads API, Google Analytics Admin API e Data API, Search Console API, Google Sheets API e/ou BigQuery API.
3. Cadastre a URI exibida em Configurações, terminada em `/api/oauth/callback`, nas URIs de redirecionamento autorizadas.
4. Configure a tela de consentimento. Se o aplicativo estiver em teste, inclua os usuários de teste.
5. Salve o Client ID e Client Secret na aplicação e autorize cada fonte ou destino.

| Produto | Escopo solicitado |
| --- | --- |
| Google Ad Manager | `https://www.googleapis.com/auth/admanager` |
| Google Ads | `https://www.googleapis.com/auth/adwords` |
| Google Analytics 4 | `https://www.googleapis.com/auth/analytics.readonly` |
| Search Console | `https://www.googleapis.com/auth/webmasters.readonly` |
| Google Sheets | `https://www.googleapis.com/auth/drive.file` |
| BigQuery | `https://www.googleapis.com/auth/bigquery.insertdata` |

A autorização Google usa state com expiração, PKCE e refresh token. Tokens manuais temporários não são renovados automaticamente. O token do Meta deve ser substituído quando expirar. As senhas dos provedores são inseridas somente nas páginas oficiais dos provedores.

## Consulta, dimensões e métricas

O período máximo por consulta é de 90 dias. A prévia aceita até 5.000 linhas. Se exceder esse limite, reduza o período ou as dimensões. Alterar campos, contas ou datas invalida a prévia anterior para exportação: é necessário atualizar novamente.

Uma dimensão define a separação das linhas; uma métrica define um valor numérico. Por exemplo, remover a data de uma consulta de campanhas agrega os dias no período. CTR e CPC são calculados a partir dos valores de base, não pela média simples das taxas. A posição média do Search Console é ponderada pelas impressões. Receitas e custos em moedas distintas só podem aparecer juntos com a dimensão Moeda, para manter os valores separados.

As fontes são consultadas separadamente. Esta versão não mistura métricas de anúncio, Analytics e busca em um único total. Atribuição de conversões segue cada provedor e não representa pessoas únicas entre plataformas.

## Destinos

| Destino | Funcionamento |
| --- | --- |
| CSV / Excel | Download com exatamente as colunas da prévia. Textos que podem ser interpretados como fórmula são neutralizados. |
| JSON | Download das linhas e dos campos selecionados, com números e textos preservados. |
| Google Sheets | Cria uma nova planilha na conta autorizada com cabeçalhos e linhas da prévia. Textos são enviados como texto literal. Não atualiza uma planilha já existente. |
| Google BigQuery | Acrescenta as linhas da prévia em uma tabela existente. Exige projeto, dataset, tabela, esquema compatível e permissão de inserção. Não cria a tabela. IDs de inserção estáveis por execução reduzem duplicações em reenvios, sujeitos às garantias do BigQuery. |
| Power BI / Tableau | Importação do arquivo CSV. Power BI: Obter dados > Texto/CSV. Tableau: Conectar > Arquivo de texto. Sem atualização automática nesta versão. |

BigQuery está sujeito às tarifas e permissões do Google Cloud. Uma falha depois de lotes já aceitos pode deixar uma exportação parcial; a mensagem informa o progresso. Os destinos online exportam somente um resultado real guardado no servidor, pertencente ao usuário autenticado. Uma prévia expira após 15 minutos e pode ser consultada novamente.

Ainda não estão implementados: Snowflake, S3/Azure Blob, conectores SQL diretos, MCP para ChatGPT/Claude, outros conectores do catálogo Windsor, agendamento e sincronização automática. O endpoint interno de consultas exige a sessão privada da aplicação; não é uma API pública para acesso anônimo por ferramentas de BI.

## Consultas salvas e API interna

**Salvar consulta** guarda fonte, contas, campos e datas fixas; não guarda tokens na configuração da consulta. Abrir uma consulta restaura seus filtros. Atualizar prévia executa a consulta novamente. A execução é manual. Até 100 consultas salvas por usuário.

Todos os endpoints respeitam o usuário autenticado. Escritas exigem o cabeçalho `x-prc-action: 1` e a origem correta quando informada.

| Método e rota | Função |
| --- | --- |
| `GET /api/pipeline` | Conexões públicas, consultas salvas e contas com dados importados |
| `POST /api/connections` | Configurar OAuth ou token; `autoDiscover: true` autoriza antes de escolher uma conta |
| `POST /api/oauth/start` | Iniciar OAuth da conexão |
| `GET /api/oauth/callback` | Concluir a autorização |
| `POST /api/pipeline/discover` | Listar contas acessíveis da conexão |
| `POST /api/pipeline/select` | Selecionar e salvar contas comprovadas pela descoberta |
| `POST /api/pipeline/preview` | Executar uma configuração de consulta |
| `POST /api/pipeline/poll` | Acompanhar relatório assíncrono por ID de execução |
| `POST /api/pipeline/queries` | Salvar configuração |
| `POST /api/pipeline/queries/:id/run` | Executar consulta salva |
| `POST /api/pipeline/export` | Exportar um resultado real ao Sheets ou BigQuery |

Exemplo de configuração enviada em `query` para a prévia:

```json
{
  "source": "google_ad_manager",
  "accountIds": ["ID_DA_CONEXAO_SALVA"],
  "fields": ["date", "account_name", "line_item_name", "impressions", "clicks"],
  "from": "2026-01-01",
  "to": "2026-01-07",
  "mode": "live"
}
```

`accountIds` contém IDs internos das conexões autorizadas, não os códigos de rede. A resposta contém `jobId`, `done`, `rows`, `query` e `fetchedAt`. Se `done` for falso, consulte `/api/pipeline/poll` com `{ "id": "jobId retornado" }` até terminar. Cada execução pertence ao usuário que a criou.

## Importação CSV

A importação aceita Google Ads, Meta Ads, GA4 e Search Console, com até 5 MB e 5.000 linhas. Baixe o modelo na interface. São obrigatórios `date`, `source`, `campaign` e pelo menos uma métrica. Datas usam YYYY-MM-DD. Fontes: `google_ads`, `meta_ads`, `ga4`, `search_console`. Repetir a mesma fonte, conta, data e campanha atualiza a observação anterior. O modo **Dados importados** consulta somente os dados já guardados para o usuário.

## Armazenamento e proteção

A aplicação usa React/Vinext, Cloudflare Workers e D1. Conexões, configurações, dados importados e consultas são vinculados ao proprietário. Credenciais são cifradas com AES-GCM no servidor, com chave derivada da variável secreta `DATA_ENCRYPTION_KEY`. Mantenha essa chave estável: trocar a chave impede a leitura das credenciais já salvas. As rotas de leitura não devolvem os tokens ao navegador. Desconectar remove a credencial e preserva os dados já importados.

O site publicado permanece privado, com a mesma audiência anterior. O painel analítico inicial foi substituído por este fluxo de fontes, consultas e destinos. A migração adiciona `data_queries` e `query_jobs` sem remover as tabelas e os registros existentes.

## Executar localmente

Requisitos: Node.js 22.13 ou superior e npm. O código usa o runtime local do Cloudflare via Wrangler; não é um servidor PHP.

```bash
npm ci
```

Crie `.dev.vars` localmente com `DATA_ENCRYPTION_KEY` contendo pelo menos 32 caracteres aleatórios. Não envie esse arquivo ao Git. Para gerar um valor local, use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e copie o resultado somente para seu arquivo local.

Prepare o build e aplique cada migração SQL na ordem:

```bash
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_giant_tiger_shark.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_late_vapor.sql
npm run dev
```

Use a URL local exibida pelo comando. No desenvolvimento, existe uma identidade local de teste; produção exige autenticação. Configure o cliente Google com a URI local correta se quiser autorizar provedores durante o desenvolvimento. Para uma instalação em VPS, use o runtime compatível com Cloudflare/Wrangler ou adapte os bindings D1 e a autenticação a um servidor e banco permanentes; o pacote atual de produção é destinado ao Workers.

## Verificação

Tipos: `node ./node_modules/typescript/bin/tsc --noEmit`

Testes: `node --experimental-strip-types --test tests/core.test.mjs tests/pipeline.test.mjs`

Os testes usam respostas simuladas para conferir descoberta de contas, paginação, campos, execução assíncrona do Ad Manager, agregação, moeda, precisão de IDs e exportações. A autorização e a coleta em contas reais dependem das credenciais e permissões do proprietário e precisam ser validadas nessas contas. O teste visual local cobre navegação, prévia de exemplo e importação/consulta/exportação de dados CSV.

## Referências fornecidas

- Onboarding: https://onboard.windsor.ai/app/google_ad_manager
- Destinos: https://windsor.ai/destination-guides/
- Repositórios: https://github.com/orgs/windsor-ai/repositories
- REA Tools: https://rea.tools/

## Documentação das APIs

- https://developers.google.com/ad-manager/api/beta/reports
- https://developers.google.com/ad-manager/api/beta/reference/rest/v1/networks/list
- https://developers.google.com/ad-manager/api/beta/reference/rest/v1/networks.reports
- https://developers.google.com/google-ads/api/docs/account-management/listing-accounts
- https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/accountSummaries/list
- https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport
- https://developers.google.com/webmaster-tools/v1/sites/list
- https://developers.facebook.com/docs/marketing-api/insights/
- https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/create
- https://docs.cloud.google.com/bigquery/docs/reference/rest/v2/tabledata/insertAll
