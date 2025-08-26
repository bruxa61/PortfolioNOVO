import { type Project, type InsertProject, type Contact, type InsertContact, type User, type UpsertUser, type ProjectLike, type InsertProjectLike, type ProjectComment, type InsertProjectComment, type ProjectWithStats, type CommentWithUser, type Achievement, type InsertAchievement, type AchievementWithStats, type AchievementComment, type InsertAchievementComment, type AchievementCommentWithUser, type Experience, type InsertExperience, type Notification } from "@shared/schema";
import { db } from "./db";
import { projects, users, projectLikes, projectComments, contacts, achievements, achievementLikes, achievementComments, experiences, notifications } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  getProjects(): Promise<any[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: any): Promise<Project>;
  updateProject(id: string, project: any): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getAchievements(): Promise<any[]>;
  getAchievement(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: any): Promise<Achievement>;
  updateAchievement(id: string, achievement: any): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;
  getExperiences(): Promise<Experience[]>;
  createExperience(experience: any): Promise<Experience>;
  updateExperience(id: string, experience: any): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;
  toggleProjectLike(projectId: string, userId: string): Promise<boolean>;
  toggleAchievementLike(achievementId: string, userId: string): Promise<boolean>;
  getProjectComments(projectId: string): Promise<any[]>;
  addProjectComment(comment: any): Promise<ProjectComment>;
  getAchievementComments(achievementId: string): Promise<any[]>;
  addAchievementComment(comment: any): Promise<AchievementComment>;
  createContact(contact: any): Promise<Contact>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Database error in getUser:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Database error in getUserByEmail, falling back to memory:", error);
      return undefined;
    }
  }

  async createUser(userData: any): Promise<User> {
    const newUser = {
      id: randomUUID(),
      email: userData.email,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.isAdmin || false,
      provider: userData.provider || 'local',
      providerId: userData.providerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    if (!db) {
      console.log("No database connection, using memory fallback for createUser");
      return newUser;
    }

    try {
      console.log("Creating user in database:", userData.email);
      const [user] = await db.insert(users).values(newUser).returning();
      console.log("User created successfully:", user.id);
      return user;
    } catch (error: any) {
      console.error("Database error in createUser, falling back to memory:", error);
      console.warn("⚠️ Using memory storage as fallback");
      return newUser;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      return {
        id: userData.id || randomUUID(),
        email: userData.email || '',
        password: null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        isAdmin: userData.email === "rafaelaolbo@gmail.com",
        provider: userData.provider || 'local',
        providerId: userData.providerId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    }

    try {
      const isAdmin = userData.email === "rafaelaolbo@gmail.com";
      const [user] = await db.insert(users).values({
        ...userData,
        id: userData.id || randomUUID(),
        isAdmin,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email || '',
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          isAdmin,
          updatedAt: new Date(),
        },
      }).returning();
      return user;
    } catch (error) {
      console.error("Database error in upsertUser:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any): Promise<User> {
    if (!db) throw new Error("Database not available");
    try {
      const [user] = await db.update(users).set({
        ...userData,
        updatedAt: new Date(),
      }).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Database error in updateUser:", error);
      throw error;
    }
  }

  async getProjects(): Promise<any[]> {
    if (!db) return [];
    try {
      const result = await db.select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        image: projects.image,
        githubUrl: projects.githubUrl,
        demoUrl: projects.demoUrl,
        technologies: projects.technologies,
        category: projects.category,
        tags: projects.tags,
        status: projects.status,
        featured: projects.featured,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        likesCount: sql<number>`(SELECT COUNT(*) FROM ${projectLikes} WHERE ${projectLikes.projectId} = ${projects.id})`,
        commentsCount: sql<number>`(SELECT COUNT(*) FROM ${projectComments} WHERE ${projectComments.projectId} = ${projects.id})`
      }).from(projects).orderBy(desc(projects.createdAt));
      return result;
    } catch (error) {
      console.error("Database error in getProjects:", error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | undefined> {
    if (!db) return undefined;
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error) {
      console.error("Database error in getProject:", error);
      return undefined;
    }
  }

  async createProject(insertProject: any): Promise<Project> {
    if (!db) throw new Error("Database not available");
    try {
      const [project] = await db.insert(projects).values({
        id: randomUUID(),
        ...insertProject,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return project;
    } catch (error) {
      console.error("Database error in createProject:", error);
      throw error;
    }
  }

  async updateProject(id: string, updateData: any): Promise<Project> {
    if (!db) throw new Error("Database not available");
    try {
      const [project] = await db.update(projects).set({
        ...updateData,
        updatedAt: new Date(),
      }).where(eq(projects.id, id)).returning();
      return project;
    } catch (error) {
      console.error("Database error in updateProject:", error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.delete(projects).where(eq(projects.id, id));
    } catch (error) {
      console.error("Database error in deleteProject:", error);
    }
  }

  async getAchievements(): Promise<any[]> {
    if (!db) return [];
    try {
      const result = await db.select({
        id: achievements.id,
        title: achievements.title,
        description: achievements.description,
        image: achievements.image,
        date: achievements.date,
        category: achievements.category,
        certificateUrl: achievements.certificateUrl,
        organization: achievements.organization,
        status: achievements.status,
        featured: achievements.featured,
        createdAt: achievements.createdAt,
        updatedAt: achievements.updatedAt,
        likesCount: sql<number>`(SELECT COUNT(*) FROM ${achievementLikes} WHERE ${achievementLikes.achievementId} = ${achievements.id})`,
        commentsCount: sql<number>`(SELECT COUNT(*) FROM ${achievementComments} WHERE ${achievementComments.achievementId} = ${achievements.id})`
      }).from(achievements).orderBy(desc(achievements.createdAt));
      return result;
    } catch (error) {
      console.error("Database error in getAchievements:", error);
      return [];
    }
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    if (!db) return undefined;
    try {
      const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
      return achievement;
    } catch (error) {
      console.error("Database error in getAchievement:", error);
      return undefined;
    }
  }

  async createAchievement(insertAchievement: any): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    try {
      const [achievement] = await db.insert(achievements).values({
        id: randomUUID(),
        ...insertAchievement,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return achievement;
    } catch (error) {
      console.error("Database error in createAchievement:", error);
      throw error;
    }
  }

  async updateAchievement(id: string, updateData: any): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    try {
      const [achievement] = await db.update(achievements).set({
        ...updateData,
        updatedAt: new Date(),
      }).where(eq(achievements.id, id)).returning();
      return achievement;
    } catch (error) {
      console.error("Database error in updateAchievement:", error);
      throw error;
    }
  }

  async deleteAchievement(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.delete(achievements).where(eq(achievements.id, id));
    } catch (error) {
      console.error("Database error in deleteAchievement:", error);
    }
  }

  async getExperiences(): Promise<Experience[]> {
    if (!db) return [];
    try {
      return await db.select().from(experiences).orderBy(desc(experiences.startDate));
    } catch (error) {
      console.error("Database error in getExperiences:", error);
      return [];
    }
  }

  async createExperience(insertExperience: any): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    try {
      const [experience] = await db.insert(experiences).values({
        id: randomUUID(),
        ...insertExperience,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return experience;
    } catch (error) {
      console.error("Database error in createExperience:", error);
      throw error;
    }
  }

  async updateExperience(id: string, updateData: any): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    try {
      const [experience] = await db.update(experiences).set({
        ...updateData,
        updatedAt: new Date(),
      }).where(eq(experiences.id, id)).returning();
      return experience;
    } catch (error) {
      console.error("Database error in updateExperience:", error);
      throw error;
    }
  }

  async deleteExperience(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.delete(experiences).where(eq(experiences.id, id));
    } catch (error) {
      console.error("Database error in deleteExperience:", error);
    }
  }

  async toggleProjectLike(projectId: string, userId: string): Promise<boolean> {
    if (!db) return false;
    try {
      const [existingLike] = await db.select().from(projectLikes)
        .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

      if (existingLike) {
        await db.delete(projectLikes).where(eq(projectLikes.id, existingLike.id));
        return false;
      } else {
        await db.insert(projectLikes).values({
          id: randomUUID(),
          projectId,
          userId,
          createdAt: new Date(),
        });
        return true;
      }
    } catch (error) {
      console.error("Database error in toggleProjectLike:", error);
      return false;
    }
  }

  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    if (!db) return false;
    try {
      const [existingLike] = await db.select().from(achievementLikes)
        .where(and(eq(achievementLikes.achievementId, achievementId), eq(achievementLikes.userId, userId)));

      if (existingLike) {
        await db.delete(achievementLikes).where(eq(achievementLikes.id, existingLike.id));
        return false;
      } else {
        await db.insert(achievementLikes).values({
          id: randomUUID(),
          achievementId,
          userId,
          createdAt: new Date(),
        });
        return true;
      }
    } catch (error) {
      console.error("Database error in toggleAchievementLike:", error);
      return false;
    }
  }

  async getProjectComments(projectId: string): Promise<any[]> {
    if (!db) return [];
    try {
      return await db.select({
        id: projectComments.id,
        projectId: projectComments.projectId,
        userId: projectComments.userId,
        content: projectComments.content,
        createdAt: projectComments.createdAt,
        user: {
          id: users.id,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
          provider: users.provider,
          providerId: users.providerId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      }).from(projectComments)
        .innerJoin(users, eq(projectComments.userId, users.id))
        .where(eq(projectComments.projectId, projectId))
        .orderBy(desc(projectComments.createdAt));
    } catch (error) {
      console.error("Database error in getProjectComments:", error);
      return [];
    }
  }

  async addProjectComment(insertComment: any): Promise<ProjectComment> {
    if (!db) throw new Error("Database not available");
    try {
      const [comment] = await db.insert(projectComments).values({
        id: randomUUID(),
        ...insertComment,
        createdAt: new Date(),
      }).returning();
      return comment;
    } catch (error) {
      console.error("Database error in addProjectComment:", error);
      throw error;
    }
  }

  async getAchievementComments(achievementId: string): Promise<any[]> {
    if (!db) return [];
    try {
      return await db.select({
        id: achievementComments.id,
        achievementId: achievementComments.achievementId,
        userId: achievementComments.userId,
        content: achievementComments.content,
        createdAt: achievementComments.createdAt,
        user: {
          id: users.id,
          email: users.email,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
          provider: users.provider,
          providerId: users.providerId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      }).from(achievementComments)
        .innerJoin(users, eq(achievementComments.userId, users.id))
        .where(eq(achievementComments.achievementId, achievementId))
        .orderBy(desc(achievementComments.createdAt));
    } catch (error) {
      console.error("Database error in getAchievementComments:", error);
      return [];
    }
  }

  async addAchievementComment(insertComment: any): Promise<AchievementComment> {
    if (!db) throw new Error("Database not available");
    try {
      const [comment] = await db.insert(achievementComments).values({
        id: randomUUID(),
        ...insertComment,
        createdAt: new Date(),
      }).returning();
      return comment;
    } catch (error) {
      console.error("Database error in addAchievementComment:", error);
      throw error;
    }
  }

  async createContact(insertContact: any): Promise<Contact> {
    if (!db) throw new Error("Database not available");
    try {
      const [contact] = await db.insert(contacts).values({
        id: randomUUID(),
        ...insertContact,
        createdAt: new Date(),
      }).returning();
      return contact;
    } catch (error) {
      console.error("Database error in createContact:", error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    if (!db) return [];
    try {
      return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error("Database error in getNotifications:", error);
      return [];
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    if (!db) return;
    try {
      await db.update(notifications).set({ read: true })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error("Database error in markNotificationRead:", error);
    }
  }
}

export const storage = new DatabaseStorage();