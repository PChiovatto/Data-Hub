CREATE TABLE `data_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `data_queries_owner` ON `data_queries` (`owner`);--> statement-breakpoint
CREATE TABLE `query_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`config` text NOT NULL,
	`state` text NOT NULL,
	`rows` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `query_jobs_owner` ON `query_jobs` (`owner`);