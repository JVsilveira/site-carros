import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const vehicles = sqliteTable('vehicles', { id: text('id').primaryKey(), data: text('data').notNull(), createdAt: integer('created_at').notNull() });
export const settings = sqliteTable('settings', { id: text('id').primaryKey(), data: text('data').notNull() });
