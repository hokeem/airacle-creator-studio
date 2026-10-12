CREATE TABLE `studio_application_drafts` (
	`owner_site_user_id` text NOT NULL,
	`campaign_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_site_user_id`, `campaign_id`),
	FOREIGN KEY (`owner_site_user_id`) REFERENCES `studio_users`(`site_user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `studio_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_site_user_id` text NOT NULL,
	`campaign_id` text NOT NULL,
	`note` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`withdrawn_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_site_user_id`) REFERENCES `studio_users`(`site_user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `studio_applications_owner_campaign_unique` ON `studio_applications` (`owner_site_user_id`,`campaign_id`);--> statement-breakpoint
CREATE INDEX `studio_applications_owner_created_index` ON `studio_applications` (`owner_site_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `studio_profiles` (
	`owner_site_user_id` text PRIMARY KEY NOT NULL,
	`region` text DEFAULT '' NOT NULL,
	`language` text DEFAULT '' NOT NULL,
	`topics_json` text DEFAULT '[]' NOT NULL,
	`social_url` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_site_user_id`) REFERENCES `studio_users`(`site_user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `studio_users` (
	`site_user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
