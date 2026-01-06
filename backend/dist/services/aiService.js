"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../middleware/logger"));
class AIService {
    /**
     * Analyze event using configured AI provider
     */
    async analyzeEvent(eventData) {
        if (!config_1.default.featureFlags.aiAnalysis) {
            throw new Error('AI analysis feature is disabled');
        }
        const prompt = this.buildEventAnalysisPrompt(eventData);
        // Try OpenAI first, fallback to other providers
        if (config_1.default.ai.openai.apiKey) {
            return await this.analyzeWithOpenAI(prompt);
        }
        else if (config_1.default.ai.anthropic.apiKey) {
            return await this.analyzeWithClaude(prompt);
        }
        else if (config_1.default.ai.google.apiKey) {
            return await this.analyzeWithGemini(prompt);
        }
        else {
            throw new Error('No AI provider configured. Please add API key to .env');
        }
    }
    /**
     * Classify event using AI
     */
    async classifyEvent(eventData) {
        if (!config_1.default.featureFlags.autoClassification) {
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
        }
        catch (error) {
            logger_1.default.error('Failed to parse AI classification response', { error });
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
    async generateStory(events) {
        const prompt = this.buildStoryPrompt(events);
        const response = await this.getAICompletion({
            prompt,
            maxTokens: config_1.default.ai.openai.maxTokens,
        });
        return response.result;
    }
    /**
     * Get AI completion from configured provider
     */
    async getAICompletion(request) {
        if (config_1.default.ai.openai.apiKey) {
            return await this.analyzeWithOpenAI(request.prompt, request.maxTokens, request.temperature);
        }
        else if (config_1.default.ai.anthropic.apiKey) {
            return await this.analyzeWithClaude(request.prompt, request.maxTokens);
        }
        else if (config_1.default.ai.google.apiKey) {
            return await this.analyzeWithGemini(request.prompt);
        }
        else {
            throw new Error('No AI provider configured');
        }
    }
    /**
     * OpenAI GPT Analysis
     */
    async analyzeWithOpenAI(prompt, maxTokens, temperature) {
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: config_1.default.ai.openai.model,
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
                max_tokens: maxTokens || config_1.default.ai.openai.maxTokens,
                temperature: temperature || config_1.default.ai.openai.temperature,
            }, {
                headers: {
                    'Authorization': `Bearer ${config_1.default.ai.openai.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                result: response.data.choices[0].message.content,
                model: config_1.default.ai.openai.model,
                tokensUsed: response.data.usage?.total_tokens,
                provider: 'OpenAI',
            };
        }
        catch (error) {
            logger_1.default.error('OpenAI API error', { error: error.message });
            throw new Error(`OpenAI analysis failed: ${error.message}`);
        }
    }
    /**
     * Anthropic Claude Analysis
     */
    async analyzeWithClaude(prompt, maxTokens) {
        try {
            const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: config_1.default.ai.anthropic.model,
                max_tokens: maxTokens || config_1.default.ai.anthropic.maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }, {
                headers: {
                    'x-api-key': config_1.default.ai.anthropic.apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json',
                },
            });
            return {
                result: response.data.content[0].text,
                model: config_1.default.ai.anthropic.model,
                provider: 'Anthropic Claude',
            };
        }
        catch (error) {
            logger_1.default.error('Claude API error', { error: error.message });
            throw new Error(`Claude analysis failed: ${error.message}`);
        }
    }
    /**
     * Google Gemini Analysis
     */
    async analyzeWithGemini(prompt) {
        try {
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1/models/${config_1.default.ai.google.model}:generateContent`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    key: config_1.default.ai.google.apiKey,
                },
            });
            return {
                result: response.data.candidates[0].content.parts[0].text,
                model: config_1.default.ai.google.model,
                provider: 'Google Gemini',
            };
        }
        catch (error) {
            logger_1.default.error('Gemini API error', { error: error.message });
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }
    /**
     * Build prompts for different analysis types
     */
    buildEventAnalysisPrompt(eventData) {
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
    buildClassificationPrompt(eventData) {
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
    buildStoryPrompt(events) {
        const eventsSummary = events.map((e, i) => `${i + 1}. [${e.timestamp}] ${e.type}: ${e.description || JSON.stringify(e)}`).join('\n');
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
exports.default = new AIService();
