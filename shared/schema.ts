import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Mood types
export const moodTypes = ["happy", "calm", "neutral", "tired", "sad"] as const;
export type MoodType = typeof moodTypes[number];

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  mood: text("mood").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  sentiment: integer("sentiment"),
  energy: integer("energy"),
  wordCount: integer("word_count"),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  mood: true,
  content: true,
  userId: true,
});

export const updateJournalEntrySchema = createInsertSchema(journalEntries).pick({
  mood: true,
  content: true,
  sentiment: true,
  energy: true,
  wordCount: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type UpdateJournalEntry = z.infer<typeof updateJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

// Mood Analysis
export interface MoodAnalysis {
  sentiment: number;
  energy: number;
  summary: string;
  keywords: string[];
}

// For the OpenAI API response
export interface OpenAIMoodAnalysisResponse {
  sentiment: number;
  energy: number;
  summary: string;
  keywords: string[];
}
