import { 
  InsertJournalEntry, 
  JournalEntry, 
  UpdateJournalEntry, 
  User, 
  InsertUser 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  updateJournalEntry(id: number, entry: UpdateJournalEntry): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]>;
  deleteJournalEntry(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private currentUserId: number;
  private currentJournalId: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.currentUserId = 1;
    this.currentJournalId = 1;
    
    // Create a default user for testing
    const defaultUser: InsertUser = {
      username: "test",
      password: "password"
    };
    this.createUser(defaultUser);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Journal operations
  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalId++;
    const date = new Date();
    const newEntry: JournalEntry = { 
      ...entry, 
      id, 
      date,
      sentiment: null,
      energy: null,
      wordCount: entry.content ? entry.content.split(/\s+/).filter(Boolean).length : 0
    };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async updateJournalEntry(id: number, updates: UpdateJournalEntry): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;

    const updatedEntry: JournalEntry = { ...entry, ...updates };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getRecentJournalEntries(userId: number, limit: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }
}

export const storage = new MemStorage();
