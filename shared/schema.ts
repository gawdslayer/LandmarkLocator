import { pgTable, text, serial, real, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const landmarks = pgTable("landmarks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  type: text("type").notNull(),
  wikipediaUrl: text("wikipedia_url"),
  wikipediaPageId: integer("wikipedia_page_id"),
  imageUrl: text("image_url"),
  opened: text("opened"),
  categories: text("categories").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  radius: real("radius"),
  resultCount: integer("result_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLandmarkSchema = createInsertSchema(landmarks).omit({
  id: true,
  createdAt: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
});

export type InsertLandmark = z.infer<typeof insertLandmarkSchema>;
export type Landmark = typeof landmarks.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
