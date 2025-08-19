import { type Project, type InsertProject, type Contact, type InsertContact, type User, type UpsertUser, type ProjectLike, type InsertProjectLike, type ProjectComment, type InsertProjectComment, type ProjectWithStats, type CommentWithUser } from "@shared/schema";
import { db } from "./db";
import { projects, users, projectLikes, projectComments, contacts } from "@shared/schema";
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
  // Like operations
  toggleProjectLike(projectId: string, userId: string): Promise<boolean>;
  // Comment operations
  getProjectComments(projectId: string): Promise<CommentWithUser[]>;
  addProjectComment(comment: InsertProjectComment): Promise<ProjectComment>;
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
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
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        likesCount: sql<number>`CAST(COUNT(DISTINCT ${projectLikes.id}) AS INTEGER)`,
        commentsCount: sql<number>`CAST(COUNT(DISTINCT ${projectComments.id}) AS INTEGER)`,
      })
      .from(projects)
      .leftJoin(projectLikes, eq(projects.id, projectLikes.projectId))
      .leftJoin(projectComments, eq(projects.id, projectComments.projectId))
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
      .values({
        title: insertProject.title,
        description: insertProject.description,
        image: insertProject.image,
        githubUrl: insertProject.githubUrl || null,
        demoUrl: insertProject.demoUrl || null,
        technologies: insertProject.technologies as string[]
      })
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
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private projects: Project[] = [];
  private contacts: Map<string, Contact> = new Map();
  private users: Map<string, User> = new Map();
  private likes: Map<string, ProjectLike[]> = new Map();
  private comments: Map<string, CommentWithUser[]> = new Map();

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
    return this.projects.map(project => ({
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
      technologies: Array.from(insertProject.technologies) as string[],
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
      technologies: updateData.technologies ? Array.from(updateData.technologies) as string[] : currentProject.technologies,
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
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
