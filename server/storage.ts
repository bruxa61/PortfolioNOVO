import { type Project, type InsertProject, type Contact, type InsertContact } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  createContact(contact: InsertContact): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private projects: Project[] = [];
  private contacts: Map<string, Contact> = new Map();

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

  async getProjects(): Promise<Project[]> {
    return this.projects;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = {
      ...insertContact,
      id,
      createdAt: new Date().toISOString(),
    };
    this.contacts.set(id, contact);
    return contact;
  }
}

export const storage = new MemStorage();
