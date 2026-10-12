CREATE TABLE `studio_idempotency` (
	`owner_site_user_id` text NOT NULL,
	`key` text NOT NULL,
	`fingerprint` text NOT NULL,
	`result_json` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`owner_site_user_id`, `key`),
	FOREIGN KEY (`owner_site_user_id`) REFERENCES `studio_users`(`site_user_id`) ON UPDATE no action ON DELETE cascade
);
