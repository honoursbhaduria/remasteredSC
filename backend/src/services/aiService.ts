import axios from 'axios';
import config from '../config/config';
import logger from '../middleware/logger';

export interface AIAnalysisRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIAnalysisResponse {
  result: string;
  model: string;
  tokensUsed?: number;
  provider: string;
}

class AIService {
  /**
   * Analyze event using configured AI provider
   */
  async analyzeEvent(eventData: any): Promise<AIAnalysisResponse> {
    if (!config.featureFlags.aiAnalysis) {
      throw new Error('AI analysis feature is disabled');
    }

    const prompt = this.buildEventAnalysisPrompt(eventData);
    
    // Prioritize Google Gemini Flash 2.5 for speed and cost
    if (config.ai.google.apiKey) {
      return await this.analyzeWithGemini(prompt);
    } else if (config.ai.openai.apiKey) {
      return await this.analyzeWithOpenAI(prompt);
    } else if (config.ai.anthropic.apiKey) {
      return await this.analyzeWithClaude(prompt);
    } else {
      throw new Error('No AI provider configured. Please add GOOGLE_AI_API_KEY to .env');
    }
  }

  /**
   * Classify event using AI
   */
  async classifyEvent(eventData: any): Promise<{
    category: string;
    confidence: number;
    mitreAttack?: string[];
    reasoning: string;
  }> {
    if (!config.featureFlags.autoClassification) {
      throw new Error('Auto classification feature is disabled');
    }

    const prompt = this.buildClassificationPrompt(eventData);
    const response = await this.getAICompletion({ prompt });

    try {
      const parsed = JSON.parse(response.result);
      return {
        category: parsed.category || 'Unknown',
        confidence: parsed.confidence || 0.5,
        mitreAttack: parsed.mitreAttack || [],
        reasoning: parsed.reasoning || response.result,
      };
    } catch (error) {
      logger.error('Failed to parse AI classification response', { error });
      return {
        category: 'Unknown',
        confidence: 0.5,
        reasoning: response.result,
      };
    }
  }

  /**
   * Generate attack story narrative
   */
  async generateStory(events: any[]): Promise<string> {
    const prompt = this.buildStoryPrompt(events);
    const response = await this.getAICompletion({ 
      prompt,
      maxTokens: config.ai.openai.maxTokens,
    });
    return response.result;
  }

  /**
   * Get AI completion from configured provider
   */
  private async getAICompletion(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Prioritize Google Gemini Flash 2.5 (fastest and most cost-effective)
    if (config.ai.google.apiKey) {
      return await this.analyzeWithGemini(request.prompt, request.maxTokens);
    } else if (config.ai.openai.apiKey) {
      return await this.analyzeWithOpenAI(request.prompt, request.maxTokens, request.temperature);
    } else if (config.ai.anthropic.apiKey) {
      return await this.analyzeWithClaude(request.prompt, request.maxTokens);
    } else {
      throw new Error('No AI provider configured. Please add GOOGLE_AI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to .env');
    }
  }

  /**
   * OpenAI GPT Analysis
   */
  private async analyzeWithOpenAI(
    prompt: string,
    maxTokens?: number,
    temperature?: number
  ): Promise<AIAnalysisResponse> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: config.ai.openai.model,
          messages: [
            {
              role: 'system',
              content: 'You are a cybersecurity expert analyzing log events and forensic evidence. Provide detailed, technical analysis.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens || config.ai.openai.maxTokens,
          temperature: temperature || config.ai.openai.temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.ai.openai.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        result: response.data.choices[0].message.content,
        model: config.ai.openai.model,
        tokensUsed: response.data.usage?.total_tokens,
        provider: 'OpenAI',
      };
    } catch (error: any) {
      logger.error('OpenAI API error', { error: error.message });
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  /**
   * Anthropic Claude Analysis
   */
  private async analyzeWithClaude(
    prompt: string,
    maxTokens?: number
  ): Promise<AIAnalysisResponse> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: config.ai.anthropic.model,
          max_tokens: maxTokens || config.ai.anthropic.maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': config.ai.anthropic.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        result: response.data.content[0].text,
        model: config.ai.anthropic.model,
        provider: 'Anthropic Claude',
      };
    } catch (error: any) {
      logger.error('Claude API error', { error: error.message });
      throw new Error(`Claude analysis failed: ${error.message}`);
    }
  }

  /**
   * Google Gemini Flash 2.5 Analysis
   */
  private async analyzeWithGemini(
    prompt: string,
    maxTokens?: number
  ): Promise<AIAnalysisResponse> {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.ai.google.model}:generateContent`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: maxTokens || 2048,
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: config.ai.google.apiKey,
          },
        }
      );

      return {
        result: response.data.candidates[0].content.parts[0].text,
        model: config.ai.google.model,
        tokensUsed: response.data.usageMetadata?.totalTokenCount,
        provider: 'Google Gemini Flash 2.5',
      };
    } catch (error: any) {
      logger.error('Gemini API error', { 
        error: error.message,
        response: error.response?.data 
      });
      throw new Error(`Gemini Flash 2.5 analysis failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Build prompts for different analysis types
   */
  private buildEventAnalysisPrompt(eventData: any): string {
    return `Analyze the following security event and provide detailed insights:

Event Type: ${eventData.type || 'Unknown'}
Timestamp: ${eventData.timestamp || 'Unknown'}
Source: ${eventData.source || 'Unknown'}
Details: ${JSON.stringify(eventData.details || {}, null, 2)}

Provide:
1. What this event indicates
2. Potential security implications
3. Recommended actions
4. Related MITRE ATT&CK techniques (if applicable)`;
  }

  private buildClassificationPrompt(eventData: any): string {
    return `Classify the following security event and respond with ONLY a JSON object:

Event: ${JSON.stringify(eventData, null, 2)}

Respond with JSON in this exact format:
{
  "category": "one of: Malware, Intrusion, Data Exfiltration, Reconnaissance, Privilege Escalation, Persistence, Defense Evasion, Lateral Movement, Command and Control, Impact, Unknown",
  "confidence": 0.0-1.0,
  "mitreAttack": ["T1566", "T1059"],
  "reasoning": "brief explanation"
}`;
  }

  private buildStoryPrompt(events: any[]): string {
    const eventsSummary = events.map((e, i) => 
      `${i + 1}. [${e.timestamp}] ${e.type}: ${e.description || JSON.stringify(e)}`
    ).join('\n');

    return `Create a coherent narrative of the following security events as an attack story:

${eventsSummary}

Write a clear, chronological narrative that:
1. Explains what happened
2. Identifies the attack phases
3. Highlights key indicators
4. Suggests the attacker's objectives
5. Recommends remediation steps

Write in professional security analyst tone.`;
  }
}

export default new AIService();
