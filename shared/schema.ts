import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // For local authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  provider: varchar("provider").default("local"), // local, google, replit
  providerId: varchar("provider_id"), // For OAuth providers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  technologies: json("technologies").$type<string[]>().notNull(),
  category: varchar("category").notNull().default("web"),
  tags: json("tags").$type<string[]>().default([]),
  status: varchar("status").notNull().default("published"), // published, draft
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  date: timestamp("date").notNull(),
  category: varchar("category").notNull().default("certification"),
  certificateUrl: text("certificate_url"),
  organization: text("organization"),
  status: varchar("status").notNull().default("published"), // published, draft
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  technologies: json("technologies").$type<string[]>().default([]),
  current: boolean("current").default(false),
  status: varchar("status").notNull().default("published"), // published, draft
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectLikes = pgTable("project_likes", {
  id: integer("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectComments = pgTable("project_comments", {
  id: integer("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievementLikes = pgTable("achievement_likes", {
  id: integer("id").primaryKey(),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievementComments = pgTable("achievement_comments", {
  id: integer("id").primaryKey(),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // comment, like
  entityType: varchar("entity_type").notNull(), // project, achievement
  entityId: integer("entity_id").notNull(),
  fromUserId: integer("from_user_id").references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projectLikes: many(projectLikes),
  projectComments: many(projectComments),
  achievementLikes: many(achievementLikes),
  achievementComments: many(achievementComments),
  notifications: many(notifications),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  likes: many(projectLikes),
  comments: many(projectComments),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  likes: many(achievementLikes),
  comments: many(achievementComments),
}));

export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id],
  }),
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectComments.userId],
    references: [users.id],
  }),
}));

export const achievementLikesRelations = relations(achievementLikes, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementLikes.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [achievementLikes.userId],
    references: [users.id],
  }),
}));

export const achievementCommentsRelations = relations(achievementComments, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementComments.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [achievementComments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertProjectLikeSchema = createInsertSchema(projectLikes).omit({
  id: true,
  createdAt: true,
});

export const insertProjectCommentSchema = createInsertSchema(projectComments).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementLikeSchema = createInsertSchema(achievementLikes).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementCommentSchema = createInsertSchema(achievementComments).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertProjectLike = z.infer<typeof insertProjectLikeSchema>;
export type ProjectLike = typeof projectLikes.$inferSelect;
export type InsertProjectComment = z.infer<typeof insertProjectCommentSchema>;
export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertAchievementLike = z.infer<typeof insertAchievementLikeSchema>;
export type AchievementLike = typeof achievementLikes.$inferSelect;
export type InsertAchievementComment = z.infer<typeof insertAchievementCommentSchema>;
export type AchievementComment = typeof achievementComments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type ProjectWithStats = Project & {
  likesCount: number;
  commentsCount: number;
  userLiked?: boolean;
};

export type AchievementWithStats = Achievement & {
  likesCount: number;
  commentsCount: number;
  userLiked?: boolean;
};

export type CommentWithUser = ProjectComment & {
  user: User;
};

export type AchievementCommentWithUser = AchievementComment & {
  user: User;
};

// Authentication schemas for validation
export const registerUserSchema = createInsertSchema(users, {
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isAdmin: true,
  provider: true,
  providerId: true,
});

export const loginUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
