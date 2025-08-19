import { type Project, type InsertProject, type Contact, type InsertContact, type User, type UpsertUser, type ProjectLike, type InsertProjectLike, type ProjectComment, type InsertProjectComment, type ProjectWithStats, type CommentWithUser, type Achievement, type InsertAchievement, type AchievementWithStats, type AchievementComment, type InsertAchievementComment, type AchievementCommentWithUser, type Experience, type InsertExperience, type Notification } from "@shared/schema";
import { db } from "./db";
import { projects, users, projectLikes, projectComments, contacts, achievements, achievementLikes, achievementComments, experiences, notifications } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Project operations
  getProjects(): Promise<ProjectWithStats[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  // Achievement operations
  getAchievements(): Promise<AchievementWithStats[]>;
  getAchievement(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;
  // Experience operations
  getExperiences(): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, experience: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;
  // Like operations
  toggleProjectLike(projectId: string, userId: string): Promise<boolean>;
  toggleAchievementLike(achievementId: string, userId: string): Promise<boolean>;
  // Comment operations
  getProjectComments(projectId: string): Promise<CommentWithUser[]>;
  addProjectComment(comment: InsertProjectComment): Promise<ProjectComment>;
  getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]>;
  addAchievementComment(comment: InsertAchievementComment): Promise<AchievementComment>;
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) {
      return {
        id: userData.id || randomUUID(),
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        isAdmin: userData.email === "rafaelaolbo@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    const isAdmin = userData.email === "rafaelaolbo@gmail.com";
    const [user] = await db
      .insert(users)
      .values({...userData, isAdmin})
      .onConflictDoUpdate({
        target: users.id,
        set: { ...userData, isAdmin, updatedAt: new Date() },
      })
      .returning();
    return user;
  }

  async getProjects(): Promise<ProjectWithStats[]> {
    if (!db) return [];
    const result = await db
      .select({
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
        likesCount: sql<number>`CAST(COUNT(DISTINCT ${projectLikes.id}) AS INTEGER)`,
        commentsCount: sql<number>`CAST(COUNT(DISTINCT ${projectComments.id}) AS INTEGER)`,
      })
      .from(projects)
      .leftJoin(projectLikes, eq(projects.id, projectLikes.projectId))
      .leftJoin(projectComments, eq(projects.id, projectComments.projectId))
      .where(eq(projects.status, "published"))
      .groupBy(projects.id)
      .orderBy(desc(projects.createdAt));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    if (!db) return undefined;
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    if (!db) throw new Error("Database not available");
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    if (!db) throw new Error("Database not available");
    const [project] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    if (!db) return;
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getAchievements(): Promise<AchievementWithStats[]> {
    if (!db) return [];
    const result = await db
      .select({
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
        likesCount: sql<number>`CAST(COUNT(DISTINCT ${achievementLikes.id}) AS INTEGER)`,
        commentsCount: sql<number>`CAST(COUNT(DISTINCT ${achievementComments.id}) AS INTEGER)`,
      })
      .from(achievements)
      .leftJoin(achievementLikes, eq(achievements.id, achievementLikes.achievementId))
      .leftJoin(achievementComments, eq(achievements.id, achievementComments.achievementId))
      .where(eq(achievements.status, "published"))
      .groupBy(achievements.id)
      .orderBy(desc(achievements.createdAt));
    return result;
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    if (!db) return undefined;
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async updateAchievement(id: string, updateData: Partial<InsertAchievement>): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    const [achievement] = await db
      .update(achievements)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(achievements.id, id))
      .returning();
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    if (!db) return;
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  async getExperiences(): Promise<Experience[]> {
    if (!db) return [];
    return await db.select().from(experiences).orderBy(desc(experiences.startDate));
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    const [experience] = await db.insert(experiences).values(insertExperience).returning();
    return experience;
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    const [experience] = await db
      .update(experiences)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(experiences.id, id))
      .returning();
    return experience;
  }

  async deleteExperience(id: string): Promise<void> {
    if (!db) return;
    await db.delete(experiences).where(eq(experiences.id, id));
  }

  async toggleProjectLike(projectId: string, userId: string): Promise<boolean> {
    if (!db) return false;
    const [existingLike] = await db
      .select()
      .from(projectLikes)
      .where(eq(projectLikes.projectId, projectId))
      .where(eq(projectLikes.userId, userId));

    if (existingLike) {
      await db.delete(projectLikes).where(eq(projectLikes.id, existingLike.id));
      return false;
    } else {
      await db.insert(projectLikes).values({ projectId, userId });
      return true;
    }
  }

  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    if (!db) return false;
    const [existingLike] = await db
      .select()
      .from(achievementLikes)
      .where(eq(achievementLikes.achievementId, achievementId))
      .where(eq(achievementLikes.userId, userId));

    if (existingLike) {
      await db.delete(achievementLikes).where(eq(achievementLikes.id, existingLike.id));
      return false;
    } else {
      await db.insert(achievementLikes).values({ achievementId, userId });
      return true;
    }
  }

  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    if (!db) return [];
    return await db
      .select({
        id: projectComments.id,
        projectId: projectComments.projectId,
        userId: projectComments.userId,
        content: projectComments.content,
        createdAt: projectComments.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(projectComments)
      .innerJoin(users, eq(projectComments.userId, users.id))
      .where(eq(projectComments.projectId, projectId))
      .orderBy(desc(projectComments.createdAt));
  }

  async addProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    if (!db) throw new Error("Database not available");
    const [comment] = await db.insert(projectComments).values(insertComment).returning();
    return comment;
  }

  async getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]> {
    if (!db) return [];
    return await db
      .select({
        id: achievementComments.id,
        achievementId: achievementComments.achievementId,
        userId: achievementComments.userId,
        content: achievementComments.content,
        createdAt: achievementComments.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(achievementComments)
      .innerJoin(users, eq(achievementComments.userId, users.id))
      .where(eq(achievementComments.achievementId, achievementId))
      .orderBy(desc(achievementComments.createdAt));
  }

  async addAchievementComment(insertComment: InsertAchievementComment): Promise<AchievementComment> {
    if (!db) throw new Error("Database not available");
    const [comment] = await db.insert(achievementComments).values(insertComment).returning();
    return comment;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    if (!db) throw new Error("Database not available");
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    if (!db) return [];
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    if (!db) return;
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private projects: Project[] = [];
  private achievements: Achievement[] = [];
  private experiences: Experience[] = [];
  private contacts: Contact[] = [];
  private projectLikes = new Map<string, ProjectLike[]>();
  private projectComments = new Map<string, CommentWithUser[]>();
  private achievementLikes = new Map<string, any[]>();
  private achievementComments = new Map<string, AchievementCommentWithUser[]>();
  private notifications = new Map<string, Notification[]>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.email === "rafaelaolbo@gmail.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getProjects(): Promise<ProjectWithStats[]> {
    return this.projects.map(project => ({
      ...project,
      likesCount: (this.projectLikes.get(project.id) || []).length,
      commentsCount: (this.projectComments.get(project.id) || []).length,
    }));
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      ...insertProject,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');
    this.projects[index] = { ...this.projects[index], ...updateData, updatedAt: new Date() };
    return this.projects[index];
  }

  async deleteProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id);
  }

  async getAchievements(): Promise<AchievementWithStats[]> {
    return this.achievements.map(achievement => ({
      ...achievement,
      likesCount: (this.achievementLikes.get(achievement.id) || []).length,
      commentsCount: (this.achievementComments.get(achievement.id) || []).length,
    }));
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    return this.achievements.find(a => a.id === id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const achievement: Achievement = {
      ...insertAchievement,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.achievements.push(achievement);
    return achievement;
  }

  async updateAchievement(id: string, updateData: Partial<InsertAchievement>): Promise<Achievement> {
    const index = this.achievements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Achievement not found');
    this.achievements[index] = { ...this.achievements[index], ...updateData, updatedAt: new Date() };
    return this.achievements[index];
  }

  async deleteAchievement(id: string): Promise<void> {
    this.achievements = this.achievements.filter(a => a.id !== id);
  }

  async getExperiences(): Promise<Experience[]> {
    return this.experiences;
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const experience: Experience = {
      ...insertExperience,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.experiences.push(experience);
    return experience;
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    const index = this.experiences.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Experience not found');
    this.experiences[index] = { ...this.experiences[index], ...updateData, updatedAt: new Date() };
    return this.experiences[index];
  }

  async deleteExperience(id: string): Promise<void> {
    this.experiences = this.experiences.filter(e => e.id !== id);
  }

  async toggleProjectLike(projectId: string, userId: string): Promise<boolean> {
    const likes = this.projectLikes.get(projectId) || [];
    const index = likes.findIndex(like => like.userId === userId);
    if (index !== -1) {
      likes.splice(index, 1);
      return false;
    } else {
      likes.push({ id: randomUUID(), projectId, userId, createdAt: new Date() });
      this.projectLikes.set(projectId, likes);
      return true;
    }
  }

  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    const likes = this.achievementLikes.get(achievementId) || [];
    const index = likes.findIndex(like => like.userId === userId);
    if (index !== -1) {
      likes.splice(index, 1);
      return false;
    } else {
      likes.push({ id: randomUUID(), achievementId, userId, createdAt: new Date() });
      this.achievementLikes.set(achievementId, likes);
      return true;
    }
  }

  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    return this.projectComments.get(projectId) || [];
  }

  async addProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const comment: ProjectComment = {
      ...insertComment,
      id: randomUUID(),
      createdAt: new Date(),
    };
    const comments = this.projectComments.get(insertComment.projectId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      comments.push({ ...comment, user });
      this.projectComments.set(insertComment.projectId, comments);
    }
    return comment;
  }

  async getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]> {
    return this.achievementComments.get(achievementId) || [];
  }

  async addAchievementComment(insertComment: InsertAchievementComment): Promise<AchievementComment> {
    const comment: AchievementComment = {
      ...insertComment,
      id: randomUUID(),
      createdAt: new Date(),
    };
    const comments = this.achievementComments.get(insertComment.achievementId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      comments.push({ ...comment, user });
      this.achievementComments.set(insertComment.achievementId, comments);
    }
    return comment;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      ...insertContact,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }

  async markNotificationRead(id: string): Promise<void> {
    for (const [userId, userNotifications] of this.notifications) {
      const notification = userNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        break;
      }
    }
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();