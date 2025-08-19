import { type Project, type InsertProject, type Contact, type InsertContact, type User, type UpsertUser, type ProjectLike, type InsertProjectLike, type ProjectComment, type InsertProjectComment, type ProjectWithStats, type CommentWithUser, type Achievement, type InsertAchievement, type AchievementWithStats, type AchievementComment, type InsertAchievementComment, type AchievementCommentWithUser, type Experience, type InsertExperience, type Notification } from "@shared/schema";
import { db } from "./db";
import { projects, users, projectLikes, projectComments, contacts, achievements, achievementLikes, achievementComments, experiences, notifications } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

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
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user is admin based on email
    const isAdmin = userData.email === "rafaelaolbo@gmail.com";
    
    const [user] = await db
      .insert(users)
      .values({...userData, isAdmin})
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          isAdmin,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<ProjectWithStats[]> {
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
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    const updateValues: any = { updatedAt: new Date() };
    if (updateData.title) updateValues.title = updateData.title;
    if (updateData.description) updateValues.description = updateData.description;
    if (updateData.image) updateValues.image = updateData.image;
    if (updateData.githubUrl !== undefined) updateValues.githubUrl = updateData.githubUrl;
    if (updateData.demoUrl !== undefined) updateValues.demoUrl = updateData.demoUrl;
    if (updateData.technologies) updateValues.technologies = updateData.technologies as string[];
    
    const [project] = await db
      .update(projects)
      .set(updateValues)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Like operations
  async toggleProjectLike(projectId: string, userId: string): Promise<boolean> {
    // Check if like exists
    const [existingLike] = await db
      .select()
      .from(projectLikes)
      .where(sql`${projectLikes.projectId} = ${projectId} AND ${projectLikes.userId} = ${userId}`);

    if (existingLike) {
      // Unlike
      await db
        .delete(projectLikes)
        .where(eq(projectLikes.id, existingLike.id));
      return false;
    } else {
      // Like
      await db.insert(projectLikes).values({
        projectId,
        userId,
      });
      return true;
    }
  }

  // Comment operations
  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
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
    const [comment] = await db
      .insert(projectComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Contact operations
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  // Achievement operations
  async getAchievements(): Promise<AchievementWithStats[]> {
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
      .orderBy(desc(achievements.date));

    return result;
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async updateAchievement(id: string, updateData: Partial<InsertAchievement>): Promise<Achievement> {
    const updateValues: any = { updatedAt: new Date() };
    if (updateData.title) updateValues.title = updateData.title;
    if (updateData.description) updateValues.description = updateData.description;
    if (updateData.image !== undefined) updateValues.image = updateData.image;
    if (updateData.date) updateValues.date = updateData.date;
    if (updateData.category) updateValues.category = updateData.category;
    if (updateData.certificateUrl !== undefined) updateValues.certificateUrl = updateData.certificateUrl;
    if (updateData.organization !== undefined) updateValues.organization = updateData.organization;
    if (updateData.status) updateValues.status = updateData.status;
    if (updateData.featured !== undefined) updateValues.featured = updateData.featured;
    
    const [achievement] = await db
      .update(achievements)
      .set(updateValues)
      .where(eq(achievements.id, id))
      .returning();
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  // Experience operations
  async getExperiences(): Promise<Experience[]> {
    return await db
      .select()
      .from(experiences)
      .where(eq(experiences.status, "published"))
      .orderBy(desc(experiences.startDate));
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const [experience] = await db
      .insert(experiences)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    const updateValues: any = { updatedAt: new Date() };
    if (updateData.title) updateValues.title = updateData.title;
    if (updateData.company) updateValues.company = updateData.company;
    if (updateData.description) updateValues.description = updateData.description;
    if (updateData.startDate) updateValues.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) updateValues.endDate = updateData.endDate;
    if (updateData.location !== undefined) updateValues.location = updateData.location;
    if (updateData.technologies) updateValues.technologies = updateData.technologies;
    if (updateData.current !== undefined) updateValues.current = updateData.current;
    if (updateData.status) updateValues.status = updateData.status;
    
    const [experience] = await db
      .update(experiences)
      .set(updateValues)
      .where(eq(experiences.id, id))
      .returning();
    return experience;
  }

  async deleteExperience(id: string): Promise<void> {
    await db.delete(experiences).where(eq(experiences.id, id));
  }

  // Achievement likes and comments
  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(achievementLikes)
      .where(sql`${achievementLikes.achievementId} = ${achievementId} AND ${achievementLikes.userId} = ${userId}`);

    if (existingLike) {
      await db
        .delete(achievementLikes)
        .where(eq(achievementLikes.id, existingLike.id));
      return false;
    } else {
      await db.insert(achievementLikes).values({ achievementId, userId });
      return true;
    }
  }

  async getAchievementComments(achievementId: string): Promise<AchievementCommentWithUser[]> {
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
        }
      })
      .from(achievementComments)
      .innerJoin(users, eq(achievementComments.userId, users.id))
      .where(eq(achievementComments.achievementId, achievementId))
      .orderBy(desc(achievementComments.createdAt));
  }

  async addAchievementComment(comment: InsertAchievementComment): Promise<AchievementComment> {
    const [newComment] = await db.insert(achievementComments).values(comment).returning();
    return newComment;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private projects: Project[] = [];
  private achievements: Achievement[] = [];
  private experiences: Experience[] = [];
  private contacts: Map<string, Contact> = new Map();
  private users: Map<string, User> = new Map();
  private likes: Map<string, ProjectLike[]> = new Map();
  private achievementLikes: Map<string, any[]> = new Map();
  private comments: Map<string, CommentWithUser[]> = new Map();
  private achievementComments: Map<string, AchievementCommentWithUser[]> = new Map();
  private notifications: Map<string, Notification[]> = new Map();

  constructor() {
    this.loadProjectsFromFile();
  }

  private async loadProjectsFromFile(): Promise<void> {
    try {
      const projectsPath = path.resolve(import.meta.dirname, "data", "projects.json");
      const data = await fs.readFile(projectsPath, "utf-8");
      const projectsData = JSON.parse(data);
      this.projects = projectsData.projects || [];
    } catch (error) {
      console.warn("Could not load projects from file, using empty array");
      this.projects = [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const isAdmin = userData.email === "rafaelaolbo@gmail.com";
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<ProjectWithStats[]> {
    return this.projects
      .filter(project => project.status === "published")
      .map(project => ({
        ...project,
        likesCount: this.likes.get(project.id)?.length || 0,
        commentsCount: this.comments.get(project.id)?.length || 0,
      }));
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.find(p => p.id === id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      title: insertProject.title,
      description: insertProject.description,
      image: insertProject.image,
      githubUrl: insertProject.githubUrl || null,
      demoUrl: insertProject.demoUrl || null,
      technologies: Array.isArray(insertProject.technologies) ? insertProject.technologies : [],
      category: insertProject.category || "web",
      tags: insertProject.tags || [],
      status: insertProject.status || "published",
      featured: insertProject.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project> {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    const currentProject = this.projects[projectIndex];
    this.projects[projectIndex] = {
      ...currentProject,
      title: updateData.title || currentProject.title,
      description: updateData.description || currentProject.description,
      image: updateData.image || currentProject.image,
      githubUrl: updateData.githubUrl !== undefined ? updateData.githubUrl : currentProject.githubUrl,
      demoUrl: updateData.demoUrl !== undefined ? updateData.demoUrl : currentProject.demoUrl,
      technologies: updateData.technologies ? updateData.technologies as string[] : currentProject.technologies,
      updatedAt: new Date(),
    };
    return this.projects[projectIndex];
  }

  async deleteProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id);
    this.likes.delete(id);
    this.comments.delete(id);
  }

  async toggleProjectLike(projectId: string, userId: string): Promise<boolean> {
    const projectLikes = this.likes.get(projectId) || [];
    const existingLikeIndex = projectLikes.findIndex(like => like.userId === userId);
    
    if (existingLikeIndex !== -1) {
      projectLikes.splice(existingLikeIndex, 1);
      this.likes.set(projectId, projectLikes);
      return false;
    } else {
      const like: ProjectLike = {
        id: randomUUID(),
        projectId,
        userId,
        createdAt: new Date(),
      };
      projectLikes.push(like);
      this.likes.set(projectId, projectLikes);
      return true;
    }
  }

  async getProjectComments(projectId: string): Promise<CommentWithUser[]> {
    return this.comments.get(projectId) || [];
  }

  async addProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const comment: ProjectComment = {
      ...insertComment,
      id: randomUUID(),
      createdAt: new Date(),
    };
    
    const projectComments = this.comments.get(insertComment.projectId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      const commentWithUser: CommentWithUser = { ...comment, user };
      projectComments.push(commentWithUser);
      this.comments.set(insertComment.projectId, projectComments);
    }
    
    return comment;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  // Achievement operations
  async getAchievements(): Promise<AchievementWithStats[]> {
    return this.achievements
      .filter(achievement => achievement.status === "published")
      .map(achievement => ({
        ...achievement,
        likesCount: this.achievementLikes.get(achievement.id)?.length || 0,
        commentsCount: this.achievementComments.get(achievement.id)?.length || 0,
      }));
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    return this.achievements.find(a => a.id === id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = {
      id,
      title: insertAchievement.title,
      description: insertAchievement.description,
      image: insertAchievement.image || null,
      date: insertAchievement.date,
      category: insertAchievement.category || "certification",
      certificateUrl: insertAchievement.certificateUrl || null,
      organization: insertAchievement.organization || null,
      status: insertAchievement.status || "published",
      featured: insertAchievement.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.achievements.push(achievement);
    return achievement;
  }

  async updateAchievement(id: string, updateData: Partial<InsertAchievement>): Promise<Achievement> {
    const achievementIndex = this.achievements.findIndex(a => a.id === id);
    if (achievementIndex === -1) {
      throw new Error('Achievement not found');
    }
    const currentAchievement = this.achievements[achievementIndex];
    this.achievements[achievementIndex] = {
      ...currentAchievement,
      ...updateData,
      updatedAt: new Date(),
    };
    return this.achievements[achievementIndex];
  }

  async deleteAchievement(id: string): Promise<void> {
    this.achievements = this.achievements.filter(a => a.id !== id);
    this.achievementLikes.delete(id);
    this.achievementComments.delete(id);
  }

  // Experience operations
  async getExperiences(): Promise<Experience[]> {
    return this.experiences.filter(exp => exp.status === "published");
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = randomUUID();
    const experience: Experience = {
      id,
      title: insertExperience.title,
      company: insertExperience.company,
      description: insertExperience.description,
      startDate: insertExperience.startDate,
      endDate: insertExperience.endDate || null,
      location: insertExperience.location || null,
      technologies: Array.isArray(insertExperience.technologies) ? insertExperience.technologies : [],
      current: insertExperience.current || false,
      status: insertExperience.status || "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.experiences.push(experience);
    return experience;
  }

  async updateExperience(id: string, updateData: Partial<InsertExperience>): Promise<Experience> {
    const experienceIndex = this.experiences.findIndex(e => e.id === id);
    if (experienceIndex === -1) {
      throw new Error('Experience not found');
    }
    const currentExperience = this.experiences[experienceIndex];
    this.experiences[experienceIndex] = {
      ...currentExperience,
      ...updateData,
      updatedAt: new Date(),
    };
    return this.experiences[experienceIndex];
  }

  async deleteExperience(id: string): Promise<void> {
    this.experiences = this.experiences.filter(e => e.id !== id);
  }

  // Achievement likes and comments
  async toggleAchievementLike(achievementId: string, userId: string): Promise<boolean> {
    const achievementLikes = this.achievementLikes.get(achievementId) || [];
    const existingLikeIndex = achievementLikes.findIndex(like => like.userId === userId);
    
    if (existingLikeIndex !== -1) {
      achievementLikes.splice(existingLikeIndex, 1);
      this.achievementLikes.set(achievementId, achievementLikes);
      return false;
    } else {
      const like = {
        id: randomUUID(),
        achievementId,
        userId,
        createdAt: new Date(),
      };
      achievementLikes.push(like);
      this.achievementLikes.set(achievementId, achievementLikes);
      return true;
    }
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
    
    const achievementComments = this.achievementComments.get(insertComment.achievementId) || [];
    const user = this.users.get(insertComment.userId);
    if (user) {
      const commentWithUser: AchievementCommentWithUser = { ...comment, user };
      achievementComments.push(commentWithUser);
      this.achievementComments.set(insertComment.achievementId, achievementComments);
    }
    
    return comment;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) || [];
  }

  async markNotificationRead(id: string): Promise<void> {
    // For MemStorage, we'd need to iterate through all user notifications to find and update the specific one
    for (const [userId, userNotifications] of this.notifications) {
      const notification = userNotifications.find((n: any) => n.id === id);
      if (notification) {
        notification.read = true;
        break;
      }
    }
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
