import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  AuthenticatedRequest,
  generateToken,
  requireAuth,
  requireAdmin,
} from './authMiddleware';
import {
  analyzeTextClaim,
  analyzeUrlClaim,
  analyzeImageClaim,
  extractOcrFromImage,
} from './geminiService';
import { fetchArticleFromUrl } from './urlFetcher';
import { Language, User } from '../types';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser(name, email, passwordHash);
    const token = generateToken(user);

    return res.status(201).json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userWithPass = db.getUserByEmailWithPassword(email);
    if (!userWithPass) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, userWithPass.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { passwordHash: _, ...user } = userWithPass;
    const token = generateToken(user as User);

    return res.json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

apiRouter.post('/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user: req.user });
});

// ==========================================
// 2. ANALYSIS ENDPOINTS
// ==========================================

apiRouter.post('/analyze/text', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please enter a claim or news text to analyze.' });
    }

    if (text.length < 10) {
      return res.status(400).json({ error: 'Input text is too short. Please provide a full sentence or claim.' });
    }

    const analysisData = await analyzeTextClaim(text.trim(), language as Language);
    
    const saved = db.createAnalysis({
      ...analysisData,
      userId: req.user?.id,
      userEmail: req.user?.email,
    });

    return res.json(saved);
  } catch (err: any) {
    console.error('Error in /analyze/text:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze text claim.' });
  }
});

apiRouter.post('/analyze/url', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { url, language = 'en' } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Please provide a valid article URL.' });
    }

    const cleanUrl = url.trim();

    // Step 1: Fetch content from URL
    let article;
    try {
      article = await fetchArticleFromUrl(cleanUrl);
    } catch (fetchErr: any) {
      // Return HTTP 422 error instructing user to paste article text in Text tab
      return res.status(422).json({
        error:
          fetchErr.message ||
          'Unable to reliably retrieve this webpage. Please paste the article text in the Text tab.',
      });
    }

    // Step 2: Analyze article content with Gemini
    try {
      const analysisData = await analyzeUrlClaim(cleanUrl, article.content, language as Language);

      const saved = db.createAnalysis({
        ...analysisData,
        userId: req.user?.id,
        userEmail: req.user?.email,
      });

      return res.json(saved);
    } catch (geminiErr: any) {
      console.error('Gemini URL analysis error:', geminiErr);
      const fallbackResult = db.createAnalysis({
        inputType: 'url',
        originalInput: cleanUrl,
        extractedText: article.content,
        claim: article.headline || cleanUrl,
        claimOrigin: 'ORIGINAL_CLAIM',
        verdict: 'UNVERIFIABLE',
        confidence: 0,
        riskLevel: 'MEDIUM',
        category: 'Other',
        evidenceQuality: 'INSUFFICIENT',
        summary: `Could not complete AI analysis for ${cleanUrl}.`,
        explanation: `An original factual claim could not be reliably isolated from this page (${geminiErr.message || 'AI analysis error'}). Please try copying the core claim or text directly into the Text tab.`,
        recommendedAction: 'Copy and paste the text directly into the Text tab.',
        warningSigns: ['AI analysis encountered error isolating claim'],
        evidence: [article.headline || 'Webpage content extracted'],
        sources: [{ name: 'Target URL', title: article.headline || cleanUrl, link: cleanUrl, relevance: 'Fetched article' }],
        detectedLanguage: (language as Language) || 'en',
        claimType: 'Analysis Error',
        userId: req.user?.id,
        userEmail: req.user?.email,
      });
      return res.json(fallbackResult);
    }
  } catch (err: any) {
    console.error('Error in /analyze/url:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze article URL.' });
  }
});

apiRouter.post('/analyze/ocr', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    // Strip base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const extractedText = await extractOcrFromImage(cleanBase64, mimeType);
    return res.json({ extractedText });
  } catch (err: any) {
    console.error('Error in /analyze/ocr:', err);
    return res.status(500).json({ error: err.message || 'Failed to extract text from image.' });
  }
});

apiRouter.post('/analyze/image', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', userEditedText, language = 'en' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please upload a screenshot or image.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const analysisData = await analyzeImageClaim(
      cleanBase64,
      mimeType,
      userEditedText,
      language as Language
    );

    const saved = db.createAnalysis({
      ...analysisData,
      userId: req.user?.id,
      userEmail: req.user?.email,
    });

    return res.json(saved);
  } catch (err: any) {
    console.error('Error in /analyze/image:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze image claim.' });
  }
});

// ==========================================
// 3. HISTORY ENDPOINTS
// ==========================================

apiRouter.get('/analyses', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const list = db.getAnalyses(userId, role);
  return res.json(list);
});

apiRouter.get('/analyses/:id', (req: AuthenticatedRequest, res: Response) => {
  const item = db.getAnalysisById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  return res.json(item);
});

apiRouter.delete('/analyses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteAnalysis(req.params.id, req.user?.id, req.user?.role);
    if (!success) {
      return res.status(404).json({ error: 'Analysis record not found.' });
    }
    return res.json({ message: 'Analysis record deleted successfully.' });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// ==========================================
// 4. PROFILE ENDPOINTS
// ==========================================

apiRouter.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

apiRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, preferredLanguage, theme } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  const updated = db.updateUser(req.user.id, {
    ...(name ? { name } : {}),
    ...(preferredLanguage ? { preferredLanguage } : {}),
    ...(theme ? { theme } : {}),
  });

  return res.json({ user: updated });
});

apiRouter.put('/profile/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const userWithPass = db.getUserByEmailWithPassword(req.user.email);
  if (!userWithPass) {
    return res.status(400).json({ error: 'User not found.' });
  }

  const isMatch = await bcrypt.compare(currentPassword, userWithPass.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  db.updateUserPassword(req.user.id, newHash);

  return res.json({ message: 'Password updated successfully.' });
});

// ==========================================
// 5. ADMIN ENDPOINTS
// ==========================================

apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getSystemStats();
  return res.json(stats);
});

apiRouter.get('/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  return res.json(users);
});

apiRouter.get('/admin/analyses', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const analyses = db.getAnalyses(undefined, 'admin');
  return res.json(analyses);
});

apiRouter.delete('/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  if (req.params.id === req.user?.id) {
    return res.status(400).json({ error: 'Admin cannot delete their own account.' });
  }
  const deleted = db.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found.' });
  return res.json({ message: 'User deleted successfully.' });
});

apiRouter.delete('/admin/analyses/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteAnalysis(req.params.id, undefined, 'admin');
  if (!deleted) return res.status(404).json({ error: 'Analysis record not found.' });
  return res.json({ message: 'Analysis record deleted successfully.' });
});
