import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table (Linked to Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow()
});

// 2. Conversations Table
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  scholarId: text('scholar_id').notNull(),
  title: text('title').notNull(),
  mode: text('mode').default('standard'), // 'standard' | 'live_api'
  createdAt: timestamp('created_at').defaultNow()
});

// 3. Messages Table (Chat history with scholar)
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id),
  sender: text('sender').notNull(), // 'scholar' | 'user'
  scholarId: text('scholar_id'),
  scholarName: text('scholar_name'),
  text: text('text').notNull(),
  isAudio: boolean('is_audio').default(false),
  audioDuration: text('audio_duration'),
  highlight: text('highlight'),
  referenceDoc: text('reference_doc'),
  createdAt: timestamp('created_at').defaultNow()
});

// 4. Audio Memos Table (Codex)
export const audioMemos = pgTable('audio_memos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  scholarId: text('scholar_id').notNull(),
  scholarName: text('scholar_name').notNull(),
  category: text('category').notNull(),
  topic: text('topic').notNull(),
  title: text('title').notNull(),
  quoteExcerpt: text('quote_excerpt').notNull(),
  duration: text('duration').notNull(),
  tag: text('tag').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 5. Student Vocal Notes Table
export const studentNotes = pgTable('student_notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  duration: text('duration').notNull(),
  studentTranscript: text('student_transcript').notNull(),
  feedbackScholarId: text('feedback_scholar_id').notNull(),
  feedbackScholarName: text('feedback_scholar_name').notNull(),
  feedbackStatus: text('feedback_status').notNull(),
  feedbackText: text('feedback_text').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  audioMemos: many(audioMemos),
  studentNotes: many(studentNotes)
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  author: one(users, {
    fields: [conversations.userId],
    references: [users.id]
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  })
}));
