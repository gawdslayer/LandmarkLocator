import { landmarks, searches, users, type Landmark, type InsertLandmark, type Search, type InsertSearch, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Landmark methods
  getLandmark(id: number): Promise<Landmark | undefined>;
  getLandmarksByBounds(north: number, south: number, east: number, west: number): Promise<Landmark[]>;
  createLandmark(landmark: InsertLandmark): Promise<Landmark>;
  updateLandmark(id: number, landmark: Partial<InsertLandmark>): Promise<Landmark | undefined>;
  searchLandmarksByTitle(query: string): Promise<Landmark[]>;
  
  // Search methods
  createSearch(search: InsertSearch): Promise<Search>;
  getRecentSearches(limit?: number): Promise<Search[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private landmarks: Map<number, Landmark>;
  private searches: Map<number, Search>;
  private currentUserId: number;
  private currentLandmarkId: number;
  private currentSearchId: number;

  constructor() {
    this.users = new Map();
    this.landmarks = new Map();
    this.searches = new Map();
    this.currentUserId = 1;
    this.currentLandmarkId = 1;
    this.currentSearchId = 1;
  }

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

  async getLandmark(id: number): Promise<Landmark | undefined> {
    return this.landmarks.get(id);
  }

  async getLandmarksByBounds(north: number, south: number, east: number, west: number): Promise<Landmark[]> {
    return Array.from(this.landmarks.values()).filter(
      (landmark) => 
        landmark.lat >= south && 
        landmark.lat <= north && 
        landmark.lng >= west && 
        landmark.lng <= east
    );
  }

  async createLandmark(insertLandmark: InsertLandmark): Promise<Landmark> {
    const id = this.currentLandmarkId++;
    const landmark: Landmark = { 
      ...insertLandmark, 
      id,
      createdAt: new Date()
    };
    this.landmarks.set(id, landmark);
    return landmark;
  }

  async updateLandmark(id: number, updateData: Partial<InsertLandmark>): Promise<Landmark | undefined> {
    const existing = this.landmarks.get(id);
    if (!existing) return undefined;
    
    const updated: Landmark = { ...existing, ...updateData };
    this.landmarks.set(id, updated);
    return updated;
  }

  async searchLandmarksByTitle(query: string): Promise<Landmark[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.landmarks.values()).filter(
      (landmark) => 
        landmark.title.toLowerCase().includes(lowerQuery) ||
        (landmark.description && landmark.description.toLowerCase().includes(lowerQuery))
    );
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = this.currentSearchId++;
    const search: Search = { 
      ...insertSearch, 
      id,
      createdAt: new Date()
    };
    this.searches.set(id, search);
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<Search[]> {
    return Array.from(this.searches.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
