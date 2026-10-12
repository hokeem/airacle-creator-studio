import { sql } from "drizzle-orm";
import { index, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => text(name).notNull().default(sql`CURRENT_TIMESTAMP`);

export const studioUsers = sqliteTable("studio_users", {
  siteUserId: text("site_user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const studioProfiles = sqliteTable("studio_profiles", {
  ownerSiteUserId: text("owner_site_user_id").primaryKey().references(() => studioUsers.siteUserId, { onDelete: "cascade" }),
  region: text("region").notNull().default(""),
  language: text("language").notNull().default(""),
  topicsJson: text("topics_json").notNull().default("[]"),
  socialUrl: text("social_url").notNull().default(""),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const studioApplicationDrafts = sqliteTable("studio_application_drafts", {
  ownerSiteUserId: text("owner_site_user_id").notNull().references(() => studioUsers.siteUserId, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}, (table) => [primaryKey({ columns: [table.ownerSiteUserId, table.campaignId] })]);

export const studioApplications = sqliteTable("studio_applications", {
  id: text("id").primaryKey(),
  ownerSiteUserId: text("owner_site_user_id").notNull().references(() => studioUsers.siteUserId, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull(),
  note: text("note").notNull(),
  status: text("status", { enum: ["submitted", "withdrawn"] }).notNull().default("submitted"),
  submittedAt: timestamp("submitted_at"),
  withdrawnAt: text("withdrawn_at"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
}, (table) => [
  uniqueIndex("studio_applications_owner_campaign_unique").on(table.ownerSiteUserId, table.campaignId),
  index("studio_applications_owner_created_index").on(table.ownerSiteUserId, table.createdAt),
]);

export const studioIdempotency = sqliteTable("studio_idempotency", {
  ownerSiteUserId: text("owner_site_user_id").notNull().references(() => studioUsers.siteUserId, { onDelete: "cascade" }),
  key: text("key").notNull(),
  fingerprint: text("fingerprint").notNull(),
  resultJson: text("result_json").notNull(),
  state: text("state", { enum: ["pending", "completed"] }).notNull().default("completed"),
  createdAt: timestamp("created_at"),
}, (table) => [primaryKey({ columns: [table.ownerSiteUserId, table.key] })]);
