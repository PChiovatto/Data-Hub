import {sqliteTable,text,real,integer,index} from "drizzle-orm/sqlite-core";
export const connections=sqliteTable("connections",{
 id:text("id").primaryKey(),owner:text("owner").notNull(),source:text("source").notNull(),name:text("name").notNull(),
 accountId:text("account_id").notNull(),config:text("config").notNull(),secret:text("secret").notNull(),status:text("status").notNull(),
 lastSync:text("last_sync"),error:text("error"),createdAt:text("created_at").notNull(),
},t=>[index("connections_owner").on(t.owner)]);
export const metrics=sqliteTable("metrics",{
 id:text("id").primaryKey(),owner:text("owner").notNull(),connectionId:text("connection_id").notNull(),
 source:text("source").notNull(),date:text("date").notNull(),accountId:text("account_id").notNull(),account:text("account").notNull(),
 campaignId:text("campaign_id").notNull(),campaign:text("campaign").notNull(),status:text("status").notNull(),currency:text("currency").notNull(),
 impressions:real("impressions").notNull(),clicks:real("clicks").notNull(),spend:real("spend").notNull(),conversions:real("conversions").notNull(),
 revenue:real("revenue").notNull(),sessions:real("sessions").notNull(),pageviews:real("pageviews").notNull(),position:real("position").notNull(),
},t=>[index("metrics_owner_date").on(t.owner,t.date)]);
export const reports=sqliteTable("reports",{id:text("id").primaryKey(),owner:text("owner").notNull(),name:text("name").notNull(),config:text("config").notNull(),createdAt:text("created_at").notNull()});
export const settings=sqliteTable("settings",{owner:text("owner").primaryKey(),secret:text("secret").notNull()});
export const states=sqliteTable("oauth_states",{id:text("id").primaryKey(),owner:text("owner").notNull(),connectionId:text("connection_id").notNull(),verifier:text("verifier").notNull(),expires:integer("expires").notNull()});
export const activities=sqliteTable("activities",{id:text("id").primaryKey(),owner:text("owner").notNull(),title:text("title").notNull(),detail:text("detail").notNull(),createdAt:text("created_at").notNull()});
export const dataQueries=sqliteTable("data_queries",{id:text("id").primaryKey(),owner:text("owner").notNull(),name:text("name").notNull(),config:text("config").notNull(),createdAt:text("created_at").notNull()},t=>[index("data_queries_owner").on(t.owner)]);
export const queryJobs=sqliteTable("query_jobs",{id:text("id").primaryKey(),owner:text("owner").notNull(),config:text("config").notNull(),state:text("state").notNull(),rows:text("rows").notNull(),createdAt:integer("created_at").notNull()},t=>[index("query_jobs_owner").on(t.owner)]);
