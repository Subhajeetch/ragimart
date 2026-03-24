DROP TABLE `categories`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `users` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `date_of_birth` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone_verified` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `default_address_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `email_notifications` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `sms_notifications` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currency` text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `locale` text DEFAULT 'en-US' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `loyalty_points` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ragi_coins` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referral_code` text;--> statement-breakpoint
ALTER TABLE `users` ADD `referred_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `total_spent` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `total_orders` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `average_order_value` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_vip_user` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banned_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `is_verified_seller` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `admin_notes` text;--> statement-breakpoint
ALTER TABLE `users` ADD `is_deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_ip` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_active_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `login_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);