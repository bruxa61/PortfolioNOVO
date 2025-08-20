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
  getProjects(): Promise<ProjectWithStats[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getAchievements(): Promise<AchievementWithStats[]>;
  getAchievement(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;
  getExperiences(): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, experience: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;
  toggleProjectLike(projectId: string, userId: string): Promise<boolean>;
  toggleAchievementLike(achievementId: string, userId: string): Promise<boolean>;
  getProjectComments(projectId: string): Promise<CommentWithUser[]>;
  addProjectComment(comment: InsertProjectComment): Promise<ProjectComment>;
  getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]>;
  addAchievementComment(comment: InsertAchievementComment): Promise<AchievementComment>;
  createContact(contact: InsertContact): Promise<Contact>;
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
      console.error("Database error in getUserByEmail:", error);
      return undefined;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!db) {
      return {
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
      };
    }
    
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          id: randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return user;
    } catch (error) {
      console.error("Database error in createUser:", error);
      throw error;
    }
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
    
    try {
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
    } catch (error) {
      console.error("Database error in upsertUser:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    if (!db) {
      // For in-memory fallback, just return a basic user object
      return {
        id,
        email: userData.email || '',
        password: null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        isAdmin: userData.isAdmin || false,
        provider: 'local',
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Database error in updateUser:", error);
      throw error;
    }
  }

  async getProjects(): Promise<ProjectWithStats[]> {
    if (!db) return [];
    try {
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

  async createProject(insertProject: InsertProject): Promise<Project> {
    if (!db) throw new Error("Database not available");
    try {
      const [project] = await db.insert(projects).values(insertProject).returning();
      return project;
    } catch (error) {
      console.error("Database error in createProject:", error);
      throw error;
    }
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    if (!db) throw new Error("Database not available");
    try {
      const [project] = await db
        .update(projects)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();
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

  async getAchievements(): Promise<AchievementWithStats[]> {
    if (!db) return [];
    try {
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

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    try {
      const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
      return achievement;
    } catch (error) {
      console.error("Database error in createAchievement:", error);
      throw error;
    }
  }

  async updateAchievement(id: string, updateData: Partial<InsertAchievement>): Promise<Achievement> {
    if (!db) throw new Error("Database not available");
    try {
      const [achievement] = await db
        .update(achievements)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(achievements.id, id))
        .returning();
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

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    try {
      const [experience] = await db.insert(experiences).values(insertExperience).returning();
      return experience;
    } catch (error) {
      console.error("Database error in createExperience:", error);
      throw error;
    }
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    if (!db) throw new Error("Database not available");
    try {
      const [experience] = await db
        .update(experiences)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(experiences.id, id))
        .returning();
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
      const [existingLike] = await db
        .select()
        .from(projectLikes)
        .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

      if (existingLike) {
        await db.delete(projectLikes).where(eq(projectLikes.id, existingLike.id));
        return false;
      } else {
        await db.insert(projectLikes).values({ projectId, userId });
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
      const [existingLike] = await db
        .select()
        .from(achievementLikes)
        .where(and(eq(achievementLikes.achievementId, achievementId), eq(achievementLikes.userId, userId)));

      if (existingLike) {
        await db.delete(achievementLikes).where(eq(achievementLikes.id, existingLike.id));
        return false;
      } else {
        await db.insert(achievementLikes).values({ achievementId, userId });
        return true;
      }
    } catch (error) {
      console.error("Database error in toggleAchievementLike:", error);
      return false;
    }
  }

  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    if (!db) return [];
    try {
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
    } catch (error) {
      console.error("Database error in getProjectComments:", error);
      return [];
    }
  }

  async addProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    if (!db) throw new Error("Database not available");
    try {
      const [comment] = await db.insert(projectComments).values(insertComment).returning();
      return comment;
    } catch (error) {
      console.error("Database error in addProjectComment:", error);
      throw error;
    }
  }

  async getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]> {
    if (!db) return [];
    try {
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
    } catch (error) {
      console.error("Database error in getAchievementComments:", error);
      return [];
    }
  }

  async addAchievementComment(insertComment: InsertAchievementComment): Promise<AchievementComment> {
    if (!db) throw new Error("Database not available");
    try {
      const [comment] = await db.insert(achievementComments).values(insertComment).returning();
      return comment;
    } catch (error) {
      console.error("Database error in addAchievementComment:", error);
      throw error;
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    if (!db) throw new Error("Database not available");
    try {
      const [contact] = await db.insert(contacts).values(insertContact).returning();
      return contact;
    } catch (error) {
      console.error("Database error in createContact:", error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(notifications)
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
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error("Database error in markNotificationRead:", error);
    }
  }
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private projects: Project[] = [];
  private achievements: Achievement[] = [];
  private experiences: Experience[] = [];
  private contacts: Contact[] = [];
  private projectLikesMap = new Map<string, ProjectLike[]>();
  private projectCommentsMap = new Map<string, CommentWithUser[]>();
  private achievementLikesMap = new Map<string, any[]>();
  private achievementCommentsMap = new Map<string, AchievementCommentWithUser[]>();
  private notificationsMap = new Map<string, Notification[]>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
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
    };
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.email === "rafaelaolbo@gmail.com",
      provider: userData.provider || 'local',
      providerId: userData.providerId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProjects(): Promise<ProjectWithStats[]> {
    return this.projects
      .filter(project => project.status === 'published')
      .map(project => ({
        ...project,
        likesCount: (this.projectLikesMap.get(project.id) || []).length,
        commentsCount: (this.projectCommentsMap.get(project.id) || []).length,
      }));
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      id: randomUUID(),
      title: insertProject.title,
      description: insertProject.description,
      image: insertProject.image,
      githubUrl: insertProject.githubUrl || null,
      demoUrl: insertProject.demoUrl || null,
      technologies: insertProject.technologies || [],
      category: insertProject.category,
      tags: insertProject.tags || null,
      status: insertProject.status,
      featured: insertProject.featured || null,
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
    return this.achievements
      .filter(achievement => achievement.status === 'published')
      .map(achievement => ({
        ...achievement,
        likesCount: (this.achievementLikesMap.get(achievement.id) || []).length,
        commentsCount: (this.achievementCommentsMap.get(achievement.id) || []).length,
      }));
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    return this.achievements.find(a => a.id === id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const achievement: Achievement = {
      id: randomUUID(),
      title: insertAchievement.title,
      description: insertAchievement.description,
      image: insertAchievement.image || null,
      date: insertAchievement.date,
      category: insertAchievement.category,
      certificateUrl: insertAchievement.certificateUrl || null,
      organization: insertAchievement.organization || null,
      status: insertAchievement.status,
      featured: insertAchievement.featured || null,
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
      id: randomUUID(),
      title: insertExperience.title,
      description: insertExperience.description,
      company: insertExperience.company,
      startDate: insertExperience.startDate,
      endDate: insertExperience.endDate || null,
      location: insertExperience.location || null,
      technologies: insertExperience.technologies || null,
      status: insertExperience.status,
      current: insertExperience.current || null,
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
    const likes = this.projectLikesMap.get(projectId) || [];
    const index = likes.findIndex(like => like.userId === userId);
    if (index !== -1) {
      likes.splice(index, 1);
      return false;
    } else {
      likes.push({ id: randomUUID(), projectId, userId, createdAt: new Date() });
      this.projectLikesMap.set(projectId, likes);
      return true;
    }
  }

  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    const likes = this.achievementLikesMap.get(achievementId) || [];
    const index = likes.findIndex(like => like.userId === userId);
    if (index !== -1) {
      likes.splice(index, 1);
      return false;
    } else {
      likes.push({ id: randomUUID(), achievementId, userId, createdAt: new Date() });
      this.achievementLikesMap.set(achievementId, likes);
      return true;
    }
  }

  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    return this.projectCommentsMap.get(projectId) || [];
  }

  async addProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const comment: ProjectComment = {
      id: randomUUID(),
      projectId: insertComment.projectId,
      userId: insertComment.userId,
      content: insertComment.content,
      createdAt: new Date(),
    };
    const comments = this.projectCommentsMap.get(insertComment.projectId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      comments.push({ ...comment, user });
      this.projectCommentsMap.set(insertComment.projectId, comments);
    }
    return comment;
  }

  async getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]> {
    return this.achievementCommentsMap.get(achievementId) || [];
  }

  async addAchievementComment(insertComment: InsertAchievementComment): Promise<AchievementComment> {
    const comment: AchievementComment = {
      id: randomUUID(),
      achievementId: insertComment.achievementId,
      userId: insertComment.userId,
      content: insertComment.content,
      createdAt: new Date(),
    };
    const comments = this.achievementCommentsMap.get(insertComment.achievementId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      comments.push({ ...comment, user });
      this.achievementCommentsMap.set(insertComment.achievementId, comments);
    }
    return comment;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const contact: Contact = {
      id: randomUUID(),
      name: insertContact.name,
      email: insertContact.email,
      message: insertContact.message,
      createdAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsMap.get(userId) || [];
  }

  async markNotificationRead(id: string): Promise<void> {
    for (const userNotifications of this.notificationsMap.values()) {
      const notification = userNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        break;
      }
    }
  }
}

// Use MemStorage to avoid database schema conflicts for now
export const storage = new MemStorage();