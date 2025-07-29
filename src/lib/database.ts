import Dexie, { Table } from 'dexie';

// User roles
export type UserRole = 'farmer' | 'buyer' | 'government';

// Language options
export type Language = 'en' | 'sw' | 'ki';

// Theme options
export type Theme = 'light' | 'dark' | 'colorblind';

// Aflatoxin risk levels
export type RiskLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';

// User data interface
export interface User {
  id?: number;
  phone: string;
  role: UserRole;
  language: Language;
  theme: Theme;
  hasUpgraded: boolean;
  createdAt: Date;
  lastSeen: Date;
  gamificationPoints: number;
  scanStreak: number;
  lastScanDate?: Date;
  currentTier: string;
  badges: string[];
}

// Scan data for farmers
export interface FarmerScan {
  id?: number;
  userId: number;
  timestamp: Date;
  // Auto-filled features
  gpsLat: number;
  gpsLng: number;
  soilMoistureDeficit: number;
  highDayTemp: number;
  highHumidity: number;
  erraticRainfall: number;
  soilTexture: number;
  ndvi: number;
  // User-selected features
  cropGenotype: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  fertilisation: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  cropResidue: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  lackIrrigation: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  insects: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  soilPH: 'very-high' | 'high' | 'medium' | 'less' | 'very-less';
  // Results
  riskLevel: RiskLevel;
  recommendedActions: string[];
  confidence: number;
  synced: boolean;
}

// Buyer scan data
export interface BuyerScan {
  id?: number;
  userId: number;
  timestamp: Date;
  imageData: string; // Base64 encoded image
  // TensorFlow.js results
  aflatoxinDetected: boolean;
  confidence: number;
  // Likert scale questions (1-5)
  transportConditions: number;
  storageQuality: number;
  environmentalFactors: number;
  // Final classification
  finalScore: RiskLevel;
  synced: boolean;
}

// Community posts
export interface CommunityPost {
  id?: number;
  userId: number;
  timestamp: Date;
  content: string;
  language: Language;
  region: string;
  likes: number;
  replies: number;
  anonymous: boolean;
  synced: boolean;
}

// Chat messages with AI
export interface ChatMessage {
  id?: number;
  userId: number;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  language: Language;
  hasAudio: boolean;
  audioData?: string; // Base64 MP3
  relatedImages?: string[]; // URLs or base64
}

// Offline queue for sync
export interface SyncQueue {
  id?: number;
  action: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

// Gamification data
export interface GamificationEvent {
  id?: number;
  userId: number;
  eventType: 'scan' | 'streak' | 'badge' | 'tier';
  timestamp: Date;
  points: number;
  description: string;
  badgeName?: string;
}

// Government analytics data
export interface AnalyticsData {
  id?: number;
  timestamp: Date;
  region: string;
  season: string;
  contaminationLevel: RiskLevel;
  scanCount: number;
  farmerCount: number;
  avgRiskScore: number;
  synced: boolean;
}

export class AflaGuardDB extends Dexie {
  users!: Table<User>;
  farmerScans!: Table<FarmerScan>;
  buyerScans!: Table<BuyerScan>;
  communityPosts!: Table<CommunityPost>;
  chatMessages!: Table<ChatMessage>;
  syncQueue!: Table<SyncQueue>;
  gamificationEvents!: Table<GamificationEvent>;
  analyticsData!: Table<AnalyticsData>;

  constructor() {
    super('AflaGuardDB');
    
    this.version(1).stores({
      users: '++id, phone, role, language, lastSeen',
      farmerScans: '++id, userId, timestamp, riskLevel, synced',
      buyerScans: '++id, userId, timestamp, finalScore, synced',
      communityPosts: '++id, userId, timestamp, language, region, synced',
      chatMessages: '++id, userId, timestamp, role, language',
      syncQueue: '++id, action, timestamp',
      gamificationEvents: '++id, userId, eventType, timestamp',
      analyticsData: '++id, timestamp, region, season, contaminationLevel, synced'
    });
  }
}

export const db = new AflaGuardDB();

// Database helper functions
export class DatabaseService {
  static async getCurrentUser(): Promise<User | undefined> {
    const users = await db.users.orderBy('lastSeen').reverse().limit(1).toArray();
    return users[0];
  }

  static async updateUserActivity(userId: number): Promise<void> {
    await db.users.update(userId, { lastSeen: new Date() });
  }

  static async addGamificationPoints(userId: number, points: number, eventType: string, description: string): Promise<void> {
    const user = await db.users.get(userId);
    if (!user) return;

    // Update user points
    const newPoints = user.gamificationPoints + points;
    await db.users.update(userId, { gamificationPoints: newPoints });

    // Add event record
    await db.gamificationEvents.add({
      userId,
      eventType: eventType as any,
      timestamp: new Date(),
      points,
      description
    });

    // Check for tier upgrades
    await this.checkTierUpgrade(userId, newPoints);
  }

  static async updateScanStreak(userId: number): Promise<void> {
    const user = await db.users.get(userId);
    if (!user) return;

    const today = new Date();
    const lastScan = user.lastScanDate;
    
    let newStreak = 1;
    if (lastScan) {
      const daysDiff = Math.floor((today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak = user.scanStreak + 1;
      } else if (daysDiff === 0) {
        newStreak = user.scanStreak; // Same day
      }
    }

    await db.users.update(userId, {
      scanStreak: newStreak,
      lastScanDate: today
    });

    // 15-day streak reward
    if (newStreak === 15) {
      await this.addGamificationPoints(userId, 0, 'streak', '15-day streak completed! 500 KES reward earned.');
    }
  }

  static async checkTierUpgrade(userId: number, totalPoints: number): Promise<void> {
    const tierThresholds = [
      { min: 1, max: 3, name: 'Curious Scout' },
      { min: 4, max: 7, name: 'Eager Tiller' },
      { min: 8, max: 12, name: 'Keen Observer' },
      { min: 13, max: 20, name: 'Thoughtful Planner' },
      { min: 21, max: Infinity, name: 'Diligent Fieldhand' }
    ];

    // Get scan count for tier calculation
    const scanCount = await db.farmerScans.where('userId').equals(userId).count() +
                     await db.buyerScans.where('userId').equals(userId).count();

    const tier = tierThresholds.find(t => scanCount >= t.min && scanCount <= t.max);
    if (tier) {
      const user = await db.users.get(userId);
      if (user && user.currentTier !== tier.name) {
        await db.users.update(userId, { currentTier: tier.name });
        await this.addGamificationPoints(userId, 0, 'tier', `Tier upgraded to ${tier.name}!`);
      }
    }
  }

  static async addToSyncQueue(action: string, data: any): Promise<void> {
    await db.syncQueue.add({
      action,
      data,
      timestamp: new Date(),
      retryCount: 0
    });
  }

  static async processSyncQueue(): Promise<void> {
    const items = await db.syncQueue.where('retryCount').below(3).toArray();
    
    for (const item of items) {
      try {
        // Process sync action (would call backend API)
        console.log('Syncing:', item.action, item.data);
        
        // Remove from queue on success
        await db.syncQueue.delete(item.id!);
      } catch (error) {
        // Increment retry count
        await db.syncQueue.update(item.id!, { retryCount: item.retryCount + 1 });
      }
    }
  }
}