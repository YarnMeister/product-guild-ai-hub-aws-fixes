import { pgTable, serial, text, timestamp, integer, jsonb, boolean, varchar, uuid, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  currentRank: integer('current_rank').default(1),
  joinedAt: timestamp('joined_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

export const tracks = pgTable('tracks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  prerequisiteTrackIds: text('prerequisite_track_ids').array().notNull().default([]),
  sortOrder: integer('sort_order').notNull(),
  maturityLevel: integer('maturity_level').notNull().default(2),
  rankLabel: text('rank_label').notNull().default('AI Collaborator'),
});

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  estimatedTime: integer('estimated_time'),
  isRequired: boolean('is_required').default(false),
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow(),
  trackId: text('track_id').references(() => tracks.id),
});

export const userLessonProgress = pgTable('user_lesson_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  userUuid: uuid('user_uuid').references(() => users.uuid),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id),
  completedAt: timestamp('completed_at').defaultNow(),
});

export const challenges = pgTable('side_quests', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  difficulty: integer('difficulty'),
  isRequired: boolean('is_required').default(false),
  imageUrl: text('image_url'),
  estimatedTime: integer('estimated_time'),
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow(),
  trackId: text('track_id').references(() => tracks.id),
});

export const trackProgress = pgTable('track_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  trackId: text('track_id').notNull().references(() => tracks.id),
  completedAt: timestamp('completed_at'),
}, (t) => ({
  userTrackUnique: unique().on(t.userId, t.trackId),
}));

export const userBadges = pgTable('user_badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  userUuid: uuid('user_uuid').references(() => users.uuid),
  challengeId: integer('side_quest_id').notNull().references(() => challenges.id),
  rankEarned: integer('rank_earned'),
  earnedAt: timestamp('earned_at').defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userUuid: uuid('user_uuid').references(() => users.uuid),
  eventType: text('event_type').notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type TrackProgress = typeof trackProgress.$inferSelect;


