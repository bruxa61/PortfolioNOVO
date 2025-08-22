import { DatabaseStorage, MemStorage } from "./storage-simple";
import { type User, type Project, type Achievement, type Contact } from "@shared/schema";

/**
 * Hybrid storage that tries database first, falls back to memory
 * Always ensures the app works even if database fails
 */
export class HybridStorage {
  private dbStorage: DatabaseStorage;
  private memStorage: MemStorage;
  private useMemory: boolean = false;

  constructor() {
    this.dbStorage = new DatabaseStorage();
    this.memStorage = new MemStorage();
  }

  private async safeDbOperation<T>(operation: () => Promise<T>, fallbackOperation: () => Promise<T>): Promise<T> {
    if (this.useMemory) {
      return fallbackOperation();
    }

    try {
      const result = await operation();
      return result;
    } catch (error) {
      console.warn("Database operation failed, switching to memory storage permanently:", error);
      this.useMemory = true;
      return fallbackOperation();
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.safeDbOperation(
      () => this.dbStorage.createUser(userData),
      () => this.memStorage.createUser(userData)
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.safeDbOperation(
      () => this.dbStorage.getUserByEmail(email),
      () => this.memStorage.getUserByEmail(email)
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.safeDbOperation(
      () => this.dbStorage.getUser(id),
      () => this.memStorage.getUser(id)
    );
  }

  async getProjects(): Promise<any[]> {
    return this.safeDbOperation(
      () => this.dbStorage.getProjects(),
      () => this.memStorage.getProjects()
    );
  }

  async getAchievements(): Promise<any[]> {
    return this.safeDbOperation(
      () => this.dbStorage.getAchievements(),
      () => this.memStorage.getAchievements()
    );
  }

  async createContact(contact: any): Promise<Contact> {
    return this.safeDbOperation(
      () => this.dbStorage.createContact(contact),
      () => this.memStorage.createContact(contact)
    );
  }

  // Add all other methods with same pattern...
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.safeDbOperation(
      () => this.dbStorage.updateUser(id, userData),
      () => this.memStorage.updateUser(id, userData)
    );
  }

  async upsertUser(userData: any): Promise<User> {
    return this.safeDbOperation(
      () => this.dbStorage.upsertUser(userData),
      () => this.memStorage.upsertUser(userData)
    );
  }
}