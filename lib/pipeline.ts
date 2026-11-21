import {validDate,csvCell,shift} from "./core.ts";
import type {Row,Source} from "./core.ts";

export type ConnectorId=Source|"google_ad_manager";
export type Field={id:string;label:string;kind:"dimension"|"metric";description:string;api?:string};
export type Query={source:ConnectorId;accountIds:string[];fields:string[];from:string;to:string;mode:"live"|"stored"};
export type DataRow=Record<string,string|number|boolean|null>;
export const CONNECTORS:{id:ConnectorId;name:string;short:string;color:string;category:string;description:string}[]=[
 {id:"google_ad_manager",name:"Google Ad Manager",short:"G",color:"#586bfa",category:"Publishers",description:"Extraia dados de monetização das suas redes, pedidos e itens de linha."},
 {id:"google_ads",name:"Google Ads",short:"A",color:"#4285f4",category:"Publicidade",description:"Conecte suas contas e consulte campanhas, custos e conversões."},
 {id:"meta_ads",name:"Facebook Ads / Meta",short:"∞",color:"#0866ff",category:"Publicidade",description:"Consulte resultados diários das suas campanhas no Facebook e Instagram."},
 {id:"ga4",name:"Google Analytics 4",short:"▥",color:"#e59400",category:"Analytics",description:"Selecione propriedades e extraia sessões, canais, eventos e receita."},
 {id:"search_console",name:"Google Search Console",short:"▰",color:"#22a167",category:"Busca orgânica",description:"Extraia cliques, impressões e posição das páginas das suas propriedades."},
];
const dim=(id:string,label:string,description:string,api?:string):Field=>({id,label,description,api,kind:"dimension"});
const metric=(id:string,label:string,description:string,api?:string):Field=>({id,label,description,api,kind:"metric"});
const common=[dim("datasource","Fonte de dados","Identificador do conector que retornou a linha."),dim("account_id","ID da conta","Identificador da conta ou rede consultada."),dim("account_name","Nome da conta","Nome da conta ou rede consultada."),dim("date","Data","Data do resultado no fuso utilizado pela plataforma.")];
const paid=[dim("campaign_id","ID da campanha","Identificador da campanha."),dim("campaign","Campanha","Nome da campanha."),dim("currency","Moeda","Código ISO da moeda dos valores financeiros."),metric("impressions","Impressões","Quantidade de impressões reportadas pela origem."),metric("clicks","Cliques","Quantidade de cliques reportados pela origem."),metric("spend","Investimento","Custo reportado na moeda da conta."),metric("conversions","Conversões","Conversões atribuídas pela plataforma."),metric("revenue","Valor de conversão","Valor de conversão ou compras reportado pela origem."),metric("ctr","CTR (%)","Cliques divididos por impressões, multiplicados por 100."),metric("cpc","CPC","Investimento dividido por cliques.")];
export const FIELDS:Record<ConnectorId,Field[]>={
 google_ad_manager:[...common.map(f=>f.id==="date"?{...f,api:"DATE"}:f),dim("currency","Moeda","Moeda solicitada para o relatório."),
 dim("order_name","Pedido","Nome do pedido associado ao item de linha.","ORDER_NAME"),
 dim("order_id","ID do pedido","Identificador do pedido.","ORDER_ID"),
 dim("line_item_name","Item de linha","Nome do item de linha que veiculou o anúncio.","LINE_ITEM_NAME"),
 dim("line_item_id","ID do item de linha","Identificador do item de linha.","LINE_ITEM_ID"),
 dim("country","País","País do pedido de anúncio.","COUNTRY_NAME"),
 dim("creative_name","Criativo","Nome do criativo.","CREATIVE_NAME"),
 dim("creative_id","ID do criativo","Identificador do criativo.","CREATIVE_ID"),
 metric("impressions","Impressões do servidor","Impressões entregues pelo servidor de anúncios.","AD_SERVER_IMPRESSIONS"),
 metric("clicks","Cliques do servidor","Cliques entregues pelo servidor de anúncios.","AD_SERVER_CLICKS"),
 metric("ad_server_revenue","Receita do servidor","Receita CPM, CPC e CPD, no formato e moeda retornados pela API do Google.","AD_SERVER_REVENUE")],
 google_ads:[...common,...paid,dim("status","Status","Status atual da campanha.")],
 meta_ads:[...common,...paid],
 ga4:[...common,dim("channel","Canal","Grupo de canais padrão da sessão."),dim("currency","Moeda","Moeda solicitada para o relatório."),metric("sessions","Sessões","Sessões registradas na propriedade."),metric("pageviews","Visualizações","Visualizações de páginas e telas."),metric("conversions","Eventos principais","Eventos principais reportados pelo GA4."),metric("revenue","Receita total","Receita total reportada pelo GA4.")],
 search_console:[...common,dim("page","Página","URL da página no resultado de busca."),metric("impressions","Impressões","Impressões nos resultados da pesquisa."),metric("clicks","Cliques","Cliques nos resultados da pesquisa."),metric("ctr","CTR (%)","Cliques divididos por impressões, multiplicados por 100."),metric("position","Posição média","Posição média ponderada pelas impressões.")],
};
export const DEFAULT_FIELDS:Record<ConnectorId,string[]>={google_ad_manager:["date","account_name","line_item_name","impressions","clicks"],google_ads:["date","account_name","campaign","currency","impressions","clicks","spend"],meta_ads:["date","account_name","campaign","currency","impressions","clicks","spend"],ga4:["date","account_name","channel","sessions","pageviews"],search_console:["date","account_name","page","impressions","clicks","position"]};
export function validateQuery(value:unknown):Query{
 const q=value as Query;if(!q||!Object.hasOwn(FIELDS,q.source)||!validDate(q.from)||!validDate(q.to)||q.from>q.to||(Date.parse(q.to)-Date.parse(q.from))/86400000>89)throw new Error("Escolha um período de até 90 dias.");
 if(!Array.isArray(q.fields)||!q.fields.length||q.fields.length>30||new Set(q.fields).size!==q.fields.length||q.fields.some(id=>!FIELDS[q.source].some(f=>f.id===id)))throw new Error("Selecione campos válidos para a fonte.");
 if(!q.fields.some(id=>FIELDS[q.source].find(f=>f.id===id)?.kind==="metric"))throw new Error("Selecione pelo menos uma métrica.");
 if(!Array.isArray(q.accountIds)||!q.accountIds.length||q.accountIds.length>10||q.accountIds.some(id=>typeof id!=="string"||id.length>500))throw new Error("Selecione entre 1 e 10 contas.");
 if(!["live","stored"].includes(q.mode))throw new Error("Modo de consulta inválido.");
 if(q.source==="google_ad_manager"&&q.mode==="stored")throw new Error("Google Ad Manager consulta a API diretamente.");
 return{source:q.source,fields:[...q.fields],accountIds:[...new Set(q.accountIds)],from:q.from,to:q.to,mode:q.mode};
}
const rowValue=(r:Row,id:string):string|number=>({datasource:r.source,account_id:r.accountId,account_name:r.account,campaign_id:r.campaignId,campaign:r.campaign,channel:r.campaign,page:r.campaign}[id]??r[id as keyof Row]??"") as string|number;
export function projectRows(rows:Row[],q:Query):DataRow[]{
 const defs=FIELDS[q.source],dimensions=q.fields.filter(id=>defs.find(f=>f.id===id)?.kind==="dimension");
 const relevant=rows.filter(r=>r.source===q.source&&r.date>=q.from&&r.date<=q.to);
 if(q.fields.some(id=>["spend","revenue","cpc"].includes(id))&&!q.fields.includes("currency")&&new Set(relevant.map(r=>r.currency)).size>1)throw new Error("Selecione o campo Moeda para consultar contas com moedas diferentes.");
 const groups=new Map<string,{r:DataRow;clicks:number;impressions:number;spend:number;position:number}>();
 for(const row of relevant){const values=dimensions.map(id=>rowValue(row,id)),key=JSON.stringify(values);let g=groups.get(key);if(!g){g={r:Object.fromEntries(dimensions.map((id,i)=>[id,values[i]])),clicks:0,impressions:0,spend:0,position:0};groups.set(key,g);}g.clicks+=row.clicks;g.impressions+=row.impressions;g.spend+=row.spend;g.position+=row.position*row.impressions;for(const id of q.fields)if(defs.find(f=>f.id===id)?.kind==="metric"&&!["ctr","cpc","position"].includes(id))g.r[id]=Number(g.r[id]||0)+Number(rowValue(row,id)||0);}
 return [...groups.values()].map(g=>Object.fromEntries(q.fields.map(id=>[id,id==="ctr"?(g.impressions?g.clicks/g.impressions*100:0):id==="cpc"?(g.clicks?g.spend/g.clicks:0):id==="position"?(g.impressions?g.position/g.impressions:0):g.r[id]??null])));
}
export function dataCsv(fields:string[],rows:DataRow[]){return"\uFEFF"+[fields.join(","),...rows.map(r=>fields.map(id=>csvCell(r[id])).join(","))].join("\r\n");}
export function exampleRows(source:ConnectorId,fields:string[],from:string,to:string):DataRow[]{
 const output:DataRow[]=[];for(let d=0;d<Math.min(8,(Date.parse(to)-Date.parse(from))/86400000+1);d++)for(let i=0;i<2;i++){const impressions=1480+d*83+i*620,clicks=42+d*3+i*16;const row:DataRow={datasource:source,date:shift(from,d),account_id:"exemplo-001",account_name:"Conta de exemplo",order_name:["Portal · Display","Portal · Notícias"][i],order_id:String(100+i),line_item_name:["Homepage · 300×250","Artigos · 728×90"][i],line_item_id:String(200+i),creative_id:String(300+i),creative_name:"Criativo de exemplo "+(i+1),country:"United States",campaign:"Campanha de exemplo "+(i+1),campaign_id:String(400+i),currency:"USD",status:"ENABLED",channel:["Organic Search","Direct"][i],page:"https://example.com/"+(i?"news":""),impressions,clicks,spend:82.4+i*15,conversions:3+i,revenue:100+i*50,sessions:110+i*32,pageviews:248+i*46,position:4.2+i,ad_server_revenue:9.35+i*4,ctr:clicks/impressions*100,cpc:(82.4+i*15)/clicks};output.push(Object.fromEntries(fields.map(id=>[id,row[id]??null])));}return output;
}
