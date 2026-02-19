import { type User, type InsertUser } from "@shared/schema";

// This file is kept to satisfy template requirements but we are using Firebase
// effectively as our "storage" for the critical parts (users, orders).
// We can use this for temporary in-memory storage if needed, or just keep it minimal.

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = "mock-id"; 
    const user: User = { ...insertUser, id, role: "admin" }; // Default role
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
