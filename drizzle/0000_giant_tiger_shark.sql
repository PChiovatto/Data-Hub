CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`source` text NOT NULL,
	`name` text NOT NULL,
	`account_id` text NOT NULL,
	`config` text NOT NULL,
	`secret` text NOT NULL,
	`status` text NOT NULL,
	`last_sync` text,
	`error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `connections_owner` ON `connections` (`owner`);--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`connection_id` text NOT NULL,
	`source` text NOT NULL,
	`date` text NOT NULL,
	`account_id` text NOT NULL,
	`account` text NOT NULL,
	`campaign_id` text NOT NULL,
	`campaign` text NOT NULL,
	`status` text NOT NULL,
	`currency` text NOT NULL,
	`impressions` real NOT NULL,
	`clicks` real NOT NULL,
	`spend` real NOT NULL,
	`conversions` real NOT NULL,
	`revenue` real NOT NULL,
	`sessions` real NOT NULL,
	`pageviews` real NOT NULL,
	`position` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `metrics_owner_date` ON `metrics` (`owner`,`date`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`owner` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`connection_id` text NOT NULL,
	`verifier` text NOT NULL,
	`expires` integer NOT NULL
);
