import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, AnalysisResult } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'verifact_db.json');

// Mongoose Schema & Models for MongoDB
let isMongoConnected = false;

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferredLanguage: { type: String, default: 'en' },
  theme: { type: String, default: 'dark' },
  createdAt: { type: String, required: true },
  passwordHash: { type: String, required: true },
});

const analysisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  userEmail: { type: String },
  inputType: { type: String, enum: ['text', 'url', 'image'], required: true },
  originalInput: { type: String, required: true },
  extractedText: { type: String },
  articleUrl: { type: String },
  articleTitle: { type: String },
  claim: { type: String, required: true },
  originalClaim: { type: String },
  claimOrigin: { type: String },
  isFactCheckArticle: { type: Boolean, default: false },
  factCheckContext: { type: String },
  factCheckDetails: { type: Object },
  sourceCredibility: { type: Object },
  sourceName: { type: String },
  isMultipleClaimsDetected: { type: Boolean, default: false },
  subClaims: { type: Array },
  verdict: { type: String, required: true },
  confidence: { type: Number, required: true },
  riskLevel: { type: String, required: true },
  category: { type: String, required: true },
  evidenceQuality: { type: String, required: true },
  summary: { type: String, required: true },
  explanation: { type: String, required: true },
  warningSigns: { type: Array, default: [] },
  evidence: { type: Array, default: [] },
  sources: { type: Array, default: [] },
  recommendedAction: { type: String, required: true },
  detectedLanguage: { type: String, default: 'en' },
  claimType: { type: String, default: 'General Claim' },
  createdAt: { type: String, required: true },
});

const MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);
const MongoAnalysisModel = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);

// Try connecting to MongoDB if MONGODB_URI is provided
async function initMongo() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[Database] MONGODB_URI not provided. Using persistent local JSON database.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[Database] Connected successfully to MongoDB!');
  } catch (err: any) {
    console.warn(`[Database] MongoDB connection failed: ${err.message}. Falling back to persistent local JSON database.`);
    isMongoConnected = false;
  }
}

// Fire async mongo initialization
initMongo();

interface LocalDBData {
  users: (User & { passwordHash: string })[];
  analyses: AnalysisResult[];
}

// Pre-seeded initial demo analyses and admin account
const INITIAL_ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);
const INITIAL_USER_PASSWORD_HASH = bcrypt.hashSync('user123', 10);

const INITIAL_DATA: LocalDBData = {
  users: [
    {
      id: 'admin-001',
      name: 'System Admin',
      email: 'admin@verifact.ai',
      role: 'admin',
      preferredLanguage: 'en',
      theme: 'dark',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: INITIAL_ADMIN_PASSWORD_HASH,
    },
    {
      id: 'user-001',
      name: 'Pooja User',
      email: 'pooja2306007@gmail.com',
      role: 'user',
      preferredLanguage: 'en',
      theme: 'dark',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      passwordHash: INITIAL_USER_PASSWORD_HASH,
    },
  ],
  analyses: [
    {
      id: 'ana-001',
      userId: 'user-001',
      userEmail: 'pooja2306007@gmail.com',
      inputType: 'text',
      originalInput: 'NASA has announced that Earth will experience three days of complete darkness because of a solar storm.',
      claim: 'Earth will experience 3 days of total darkness due to a massive solar storm according to NASA.',
      isFactCheckArticle: false,
      verdict: 'FAKE',
      confidence: 98,
      riskLevel: 'HIGH',
      category: 'Science',
      evidenceQuality: 'STRONG',
      summary: 'This is a recurring internet hoax that circulates every few years misattributing false statements to NASA.',
      explanation: 'NASA has made no such announcement. While geomagnetic storms can affect power grids and satellite communications, solar activity cannot block sunlight or cause 72 hours of global darkness across the entire planet.',
      warningSigns: [
        'Sensational headline designed to provoke fear and panic',
        'Fabricated official authority citation (NASA)',
        'Lack of official links, astronomical data, or press releases',
        'Physically impossible scenario (solar activity blocking all sunlight)'
      ],
      evidence: [
        'Official NASA press releases and solar activity bulletins confirm no dark period predictions.',
        'Fact-checking organizations (Snopes, AP News) have repeatedly debunked this exact claim since 2012.',
        'Basic planetary physics dictates solar storms increase auroral brightness rather than obscuring sunlight.'
      ],
      sources: [
        {
          name: 'NASA Solar System Exploration',
          title: 'Solar Storms and Space Weather Facts',
          link: 'https://science.nasa.gov/sun/solar-storms',
          relevance: 'Official Space Agency Bulletin on Solar Activity',
          trustworthiness: 99
        },
        {
          name: 'Snopes Fact Check',
          title: 'Will Earth Experience Total Darkness Due to Solar Storm?',
          link: 'https://www.snopes.com/fact-check/solar-storm-darkness/',
          relevance: 'Independent Fact Check Verification',
          trustworthiness: 95
        }
      ],
      recommendedAction: 'Do not share or circulate this message on social media. Refer to official scientific agencies for space weather alerts.',
      detectedLanguage: 'en',
      claimType: 'Viral Internet Hoax',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ana-002',
      userId: 'user-001',
      userEmail: 'pooja2306007@gmail.com',
      inputType: 'text',
      originalInput: 'Water freezes at 0 degrees Celsius under standard atmospheric pressure.',
      claim: 'Pure water freezes at 0°C under standard atmospheric pressure.',
      isFactCheckArticle: false,
      verdict: 'REAL',
      confidence: 99,
      riskLevel: 'LOW',
      category: 'Science',
      evidenceQuality: 'STRONG',
      summary: 'This is a fundamental scientific law and standard physical metric.',
      explanation: 'The freezing point of pure liquid water at 1 atmosphere of pressure (101.325 kPa) is defined as 0 degrees Celsius (273.15 Kelvin).',
      warningSigns: [],
      evidence: [
        'International Temperature Scale (ITS-90) definition.',
        'Standard physical chemistry reference literature and textbook measurements.'
      ],
      sources: [
        {
          name: 'NIST Chemistry WebBook',
          title: 'Thermophysical Properties of Water',
          link: 'https://webbook.nist.gov/',
          relevance: 'National Institute of Standards and Technology',
          trustworthiness: 100
        }
      ],
      recommendedAction: 'This factual scientific statement is verified and safe to reference.',
      detectedLanguage: 'en',
      claimType: 'Established Scientific Fact',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ana-003',
      userId: 'admin-001',
      userEmail: 'admin@verifact.ai',
      inputType: 'url',
      originalInput: 'https://factcheck.example.org/claim-miracle-cure-diabetes-cinnamon',
      extractedText: 'Fact Check: Viral videos claim that drinking warm cinnamon tea every morning permanently cures Type 1 and Type 2 diabetes within 7 days. Verdict: False. Medical experts clarify that while cinnamon may modestly assist insulin sensitivity, it cannot cure diabetes.',
      claim: 'Drinking warm cinnamon tea permanently cures Type 1 and Type 2 diabetes within 7 days.',
      isFactCheckArticle: true,
      factCheckContext: 'Analyzed from a Fact-Checking article examining viral health claims on TikTok and Facebook.',
      verdict: 'FAKE',
      confidence: 96,
      riskLevel: 'CRITICAL',
      category: 'Health',
      evidenceQuality: 'STRONG',
      summary: 'The original claim that cinnamon cures diabetes in 7 days is dangerously false health advice.',
      explanation: 'There is no scientific or clinical evidence that cinnamon or any herbal tea can cure diabetes. Discontinuing prescribed insulin or medication based on this claim can lead to fatal ketoacidosis or diabetic coma.',
      warningSigns: [
        'Promises a rapid "miracle cure" for chronic medical conditions',
        'Recommends stopping standard medical treatments',
        'Lacks clinical trial backing or peer-reviewed medical publications'
      ],
      evidence: [
        'American Diabetes Association explicit guidelines stating no dietary supplement cures diabetes.',
        'Endocrine Society medical advisories against unverified herbal remedies.'
      ],
      sources: [
        {
          name: 'American Diabetes Association',
          title: 'Diabetes Myth Busters & Unproven Treatments',
          link: 'https://diabetes.org/',
          relevance: 'Official Medical Association Statement',
          trustworthiness: 98
        }
      ],
      recommendedAction: 'Consult a board-certified endocrinologist. Do not alter diabetes medication based on viral social media posts.',
      detectedLanguage: 'en',
      claimType: 'Dangerous Health Misinformation',
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    }
  ]
};

// Helper functions for persistent local JSON storage
function ensureDBExists(): LocalDBData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db file, resetting to initial data:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
    return INITIAL_DATA;
  }
}

function saveDB(data: LocalDBData) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  getDbMode: (): string => {
    return isMongoConnected ? 'mongodb' : 'persistent-json';
  },

  // User Operations
  getUsers: (): User[] => {
    const data = ensureDBExists();
    return data.users.map(({ passwordHash, ...user }) => user as User);
  },
  
  getUserById: (id: string): User | null => {
    const data = ensureDBExists();
    const found = data.users.find(u => u.id === id);
    if (!found) return null;
    const { passwordHash, ...user } = found;
    return user as User;
  },

  getUserByEmailWithPassword: (email: string) => {
    const data = ensureDBExists();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  createUser: async (name: string, email: string, passwordHash: string) => {
    const data = ensureDBExists();
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email is already registered.');
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'user' as const,
      preferredLanguage: 'en' as const,
      theme: 'dark' as const,
      createdAt: new Date().toISOString(),
      passwordHash
    };
    data.users.push(newUser);
    saveDB(data);

    if (isMongoConnected) {
      try {
        await MongoUserModel.create(newUser);
      } catch (err) {
        console.warn('MongoDB UserModel sync error:', err);
      }
    }

    const { passwordHash: _, ...userWithoutPass } = newUser;
    return userWithoutPass;
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const data = ensureDBExists();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    saveDB(data);

    if (isMongoConnected) {
      MongoUserModel.updateOne({ id }, { $set: updates }).catch(err => console.warn('MongoDB updateUser error:', err));
    }

    const { passwordHash, ...updated } = data.users[index];
    return updated;
  },

  updateUserPassword: (id: string, passwordHash: string) => {
    const data = ensureDBExists();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    data.users[index].passwordHash = passwordHash;
    saveDB(data);

    if (isMongoConnected) {
      MongoUserModel.updateOne({ id }, { $set: { passwordHash } }).catch(err => console.warn('MongoDB updatePassword error:', err));
    }

    return true;
  },

  deleteUser: (id: string) => {
    const data = ensureDBExists();
    data.users = data.users.filter(u => u.id !== id);
    data.analyses = data.analyses.filter(a => a.userId !== id);
    saveDB(data);

    if (isMongoConnected) {
      MongoUserModel.deleteOne({ id }).catch(err => console.warn('MongoDB deleteUser error:', err));
      MongoAnalysisModel.deleteMany({ userId: id }).catch(err => console.warn('MongoDB deleteUserAnalyses error:', err));
    }

    return true;
  },

  // Analysis Operations
  getAnalyses: (userId?: string, role?: string) => {
    const data = ensureDBExists();
    if (role === 'admin') {
      return data.analyses;
    }
    if (userId) {
      return data.analyses.filter(a => a.userId === userId || !a.userId);
    }
    return data.analyses.filter(a => !a.userId);
  },

  getAnalysisById: (id: string) => {
    const data = ensureDBExists();
    return data.analyses.find(a => a.id === id) || null;
  },

  createAnalysis: (analysisData: Omit<AnalysisResult, 'id' | 'createdAt'>) => {
    const data = ensureDBExists();
    const newAnalysis: AnalysisResult = {
      ...analysisData,
      id: `ana-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    data.analyses.unshift(newAnalysis);
    saveDB(data);

    if (isMongoConnected) {
      MongoAnalysisModel.create(newAnalysis).catch(err => console.warn('MongoDB createAnalysis error:', err));
    }

    return newAnalysis;
  },

  deleteAnalysis: (id: string, userId?: string, role?: string) => {
    const data = ensureDBExists();
    const index = data.analyses.findIndex(a => a.id === id);
    if (index === -1) return false;

    if (role !== 'admin' && userId && data.analyses[index].userId !== userId) {
      throw new Error('Unauthorized to delete this analysis record.');
    }

    data.analyses.splice(index, 1);
    saveDB(data);

    if (isMongoConnected) {
      MongoAnalysisModel.deleteOne({ id }).catch(err => console.warn('MongoDB deleteAnalysis error:', err));
    }

    return true;
  },

  // Stats calculation
  getSystemStats: () => {
    const data = ensureDBExists();
    const totalAnalyses = data.analyses.length;
    const totalUsers = data.users.length;
    
    let fakeCount = 0;
    let realCount = 0;
    let misleadingCount = 0;
    let unverifiableCount = 0;
    let confidenceSum = 0;

    const riskDistribution: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };

    const categoryDistribution: Record<string, number> = {};

    data.analyses.forEach(a => {
      if (a.verdict === 'FAKE' || a.verdict === 'MOSTLY_FALSE') fakeCount++;
      else if (a.verdict === 'REAL' || a.verdict === 'MOSTLY_REAL') realCount++;
      else if (a.verdict === 'MISLEADING') misleadingCount++;
      else if (a.verdict === 'UNVERIFIABLE') unverifiableCount++;

      confidenceSum += a.confidence || 0;

      if (a.riskLevel && riskDistribution[a.riskLevel] !== undefined) {
        riskDistribution[a.riskLevel]++;
      }

      const cat = a.category || 'Other';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });

    const avgConfidence = totalAnalyses > 0 ? Math.round(confidenceSum / totalAnalyses) : 0;

    // Last 7 days analyses count
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }

    data.analyses.forEach(a => {
      const dateStr = a.createdAt.split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    });

    const dailyAnalyses = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return {
      totalAnalyses,
      totalUsers,
      fakeCount,
      realCount,
      misleadingCount,
      unverifiableCount,
      avgConfidence,
      riskDistribution,
      categoryDistribution,
      dailyAnalyses
    };
  }
};
