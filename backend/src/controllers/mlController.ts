import { Request, Response } from 'express';
import aiService from '../services/aiService';
import threatIntelService from '../services/threatIntelService';
import logger from '../middleware/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Analyze event using ML/AI model
 */
export const analyzeEvent = async (req: Request, res: Response) => {
  try {
    const { event, caseId } = req.body;

    if (!event) {
      throw new AppError('Event data is required', 400);
    }

    const analysis = await aiService.analyzeEvent(event);

    // Log the analysis
    logger.info('Event analyzed', {
      caseId,
      eventId: event.id,
      provider: analysis.provider,
      userId: (req as any).userId,
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    logger.error('Event analysis failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Classify event using ML model
 */
export const classifyEvent = async (req: Request, res: Response) => {
  try {
    const { event } = req.body;

    if (!event) {
      throw new AppError('Event data is required', 400);
    }

    const classification = await aiService.classifyEvent(event);

    res.json({
      success: true,
      classification,
    });
  } catch (error: any) {
    logger.error('Event classification failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Generate attack story from events
 */
export const generateStory = async (req: Request, res: Response) => {
  try {
    const { events, caseId } = req.body;

    if (!events || !Array.isArray(events)) {
      throw new AppError('Events array is required', 400);
    }

    const story = await aiService.generateStory(events);

    logger.info('Attack story generated', {
      caseId,
      eventCount: events.length,
      userId: (req as any).userId,
    });

    res.json({
      success: true,
      story,
    });
  } catch (error: any) {
    logger.error('Story generation failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Check IP reputation using threat intelligence
 */
export const checkIPReputation = async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;

    if (!ip) {
      throw new AppError('IP address is required', 400);
    }

    const reputation = await threatIntelService.checkIPReputation(ip);

    res.json({
      success: true,
      reputation,
    });
  } catch (error: any) {
    logger.error('IP reputation check failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Check file hash reputation
 */
export const checkFileHash = async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      throw new AppError('File hash is required', 400);
    }

    const reputation = await threatIntelService.checkFileHash(hash);

    res.json({
      success: true,
      reputation,
    });
  } catch (error: any) {
    logger.error('File hash check failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Check domain reputation
 */
export const checkDomain = async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      throw new AppError('Domain is required', 400);
    }

    const reputation = await threatIntelService.checkDomain(domain);

    res.json({
      success: true,
      reputation,
    });
  } catch (error: any) {
    logger.error('Domain check failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Batch analyze multiple events
 */
export const batchAnalyzeEvents = async (req: Request, res: Response) => {
  try {
    const { events, caseId } = req.body;

    if (!events || !Array.isArray(events)) {
      throw new AppError('Events array is required', 400);
    }

    const results = await Promise.allSettled(
      events.map((event) => aiService.analyzeEvent(event))
    );

    const analyses = results.map((result, index) => ({
      eventId: events[index].id,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? (result.reason as Error).message : null,
    }));

    logger.info('Batch analysis completed', {
      caseId,
      totalEvents: events.length,
      successful: analyses.filter((a) => a.success).length,
      userId: (req as any).userId,
    });

    res.json({
      success: true,
      analyses,
    });
  } catch (error: any) {
    logger.error('Batch analysis failed', { error: error.message });
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get ML model health and configuration
 */
export const getMLHealth = async (req: Request, res: Response) => {
  try {
    const config = {
      aiAnalysis: process.env.FEATURE_AI_ANALYSIS === 'true',
      autoClassification: process.env.FEATURE_AUTO_CLASSIFICATION === 'true',
      threatIntelligence: process.env.FEATURE_THREAT_INTELLIGENCE === 'true',
      providers: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        google: !!process.env.GOOGLE_AI_API_KEY,
      },
      threatIntelSources: {
        virustotal: !!process.env.VIRUSTOTAL_API_KEY,
        abuseipdb: !!process.env.ABUSEIPDB_API_KEY,
        greynoise: !!process.env.GREYNOISE_API_KEY,
      },
    };

    res.json({
      success: true,
      status: 'operational',
      config,
    });
  } catch (error: any) {
    logger.error('ML health check failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
