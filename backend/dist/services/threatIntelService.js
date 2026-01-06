"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../middleware/logger"));
class ThreatIntelService {
    /**
     * Check IP address reputation across multiple sources
     */
    async checkIPReputation(ipAddress) {
        if (!config_1.default.featureFlags.threatIntelligence) {
            throw new Error('Threat intelligence feature is disabled');
        }
        const results = {
            ipAddress,
            sources: [],
            lastChecked: new Date(),
        };
        try {
            // Check VirusTotal
            if (config_1.default.threatIntel.virustotal.apiKey) {
                const vtData = await this.checkVirusTotal('ip-addresses', ipAddress);
                results.sources.push({ provider: 'VirusTotal', data: vtData });
            }
            // Check AbuseIPDB
            if (config_1.default.threatIntel.abuseipdb.apiKey) {
                const abuseData = await this.checkAbuseIPDB(ipAddress);
                results.sources.push({ provider: 'AbuseIPDB', data: abuseData });
            }
            // Check GreyNoise
            if (config_1.default.threatIntel.greynoise.apiKey) {
                const greynoiseData = await this.checkGreyNoise(ipAddress);
                results.sources.push({ provider: 'GreyNoise', data: greynoiseData });
            }
            // Calculate aggregate reputation
            results.reputation = this.calculateReputation(results.sources);
            return results;
        }
        catch (error) {
            logger_1.default.error('IP reputation check failed', { error: error.message, ipAddress });
            throw error;
        }
    }
    /**
     * Check file hash reputation
     */
    async checkFileHash(hash) {
        if (!config_1.default.featureFlags.threatIntelligence) {
            throw new Error('Threat intelligence feature is disabled');
        }
        const results = {
            fileHash: hash,
            sources: [],
            lastChecked: new Date(),
        };
        try {
            // Check VirusTotal
            if (config_1.default.threatIntel.virustotal.apiKey) {
                const vtData = await this.checkVirusTotal('files', hash);
                results.sources.push({ provider: 'VirusTotal', data: vtData });
            }
            results.reputation = this.calculateReputation(results.sources);
            return results;
        }
        catch (error) {
            logger_1.default.error('File hash check failed', { error: error.message, hash });
            throw error;
        }
    }
    /**
     * Check domain reputation
     */
    async checkDomain(domain) {
        if (!config_1.default.featureFlags.threatIntelligence) {
            throw new Error('Threat intelligence feature is disabled');
        }
        const results = {
            domain,
            sources: [],
            lastChecked: new Date(),
        };
        try {
            // Check VirusTotal
            if (config_1.default.threatIntel.virustotal.apiKey) {
                const vtData = await this.checkVirusTotal('domains', domain);
                results.sources.push({ provider: 'VirusTotal', data: vtData });
            }
            results.reputation = this.calculateReputation(results.sources);
            return results;
        }
        catch (error) {
            logger_1.default.error('Domain check failed', { error: error.message, domain });
            throw error;
        }
    }
    /**
     * VirusTotal API integration
     */
    async checkVirusTotal(resource, identifier) {
        try {
            const response = await axios_1.default.get(`${config_1.default.threatIntel.virustotal.apiUrl}/${resource}/${identifier}`, {
                headers: {
                    'x-apikey': config_1.default.threatIntel.virustotal.apiKey,
                },
            });
            return {
                malicious: response.data.data?.attributes?.last_analysis_stats?.malicious || 0,
                suspicious: response.data.data?.attributes?.last_analysis_stats?.suspicious || 0,
                harmless: response.data.data?.attributes?.last_analysis_stats?.harmless || 0,
                total: response.data.data?.attributes?.last_analysis_stats?.malicious +
                    response.data.data?.attributes?.last_analysis_stats?.suspicious +
                    response.data.data?.attributes?.last_analysis_stats?.harmless || 0,
                reputation: response.data.data?.attributes?.reputation,
            };
        }
        catch (error) {
            if (error.response?.status === 404) {
                return { notFound: true };
            }
            logger_1.default.error('VirusTotal API error', { error: error.message });
            throw error;
        }
    }
    /**
     * AbuseIPDB API integration
     */
    async checkAbuseIPDB(ipAddress) {
        try {
            const response = await axios_1.default.get(`${config_1.default.threatIntel.abuseipdb.apiUrl}/check`, {
                params: {
                    ipAddress,
                    maxAgeInDays: 90,
                    verbose: true,
                },
                headers: {
                    'Key': config_1.default.threatIntel.abuseipdb.apiKey,
                    'Accept': 'application/json',
                },
            });
            return {
                abuseConfidenceScore: response.data.data?.abuseConfidenceScore || 0,
                totalReports: response.data.data?.totalReports || 0,
                isWhitelisted: response.data.data?.isWhitelisted || false,
                isTor: response.data.data?.isTor || false,
                countryCode: response.data.data?.countryCode,
            };
        }
        catch (error) {
            logger_1.default.error('AbuseIPDB API error', { error: error.message });
            throw error;
        }
    }
    /**
     * GreyNoise API integration
     */
    async checkGreyNoise(ipAddress) {
        try {
            const response = await axios_1.default.get(`${config_1.default.threatIntel.greynoise.apiUrl}/community/${ipAddress}`, {
                headers: {
                    'key': config_1.default.threatIntel.greynoise.apiKey,
                },
            });
            return {
                noise: response.data?.noise || false,
                riot: response.data?.riot || false,
                classification: response.data?.classification,
                name: response.data?.name,
                link: response.data?.link,
            };
        }
        catch (error) {
            if (error.response?.status === 404) {
                return { notFound: true };
            }
            logger_1.default.error('GreyNoise API error', { error: error.message });
            throw error;
        }
    }
    /**
     * Calculate aggregate reputation from multiple sources
     */
    calculateReputation(sources) {
        let totalScore = 0;
        let count = 0;
        for (const source of sources) {
            if (source.provider === 'VirusTotal' && !source.data.notFound) {
                const vtScore = source.data.malicious / Math.max(source.data.total, 1);
                totalScore += vtScore;
                count++;
            }
            if (source.provider === 'AbuseIPDB') {
                const abuseScore = source.data.abuseConfidenceScore / 100;
                totalScore += abuseScore;
                count++;
            }
            if (source.provider === 'GreyNoise' && !source.data.notFound) {
                if (source.data.classification === 'malicious') {
                    totalScore += 1;
                    count++;
                }
                else if (source.data.classification === 'benign') {
                    totalScore += 0;
                    count++;
                }
            }
        }
        const avgScore = count > 0 ? totalScore / count : 0;
        let category = 'Unknown';
        if (avgScore >= 0.7)
            category = 'Malicious';
        else if (avgScore >= 0.4)
            category = 'Suspicious';
        else if (avgScore >= 0.1)
            category = 'Potentially Malicious';
        else
            category = 'Clean';
        return {
            score: avgScore,
            category,
            isMalicious: avgScore >= 0.7,
        };
    }
    /**
     * Get MITRE ATT&CK technique information
     */
    async getMitreAttackInfo(techniqueId) {
        try {
            // For now, return mock data. In production, integrate with MITRE ATT&CK API
            return {
                id: techniqueId,
                name: 'Technique Name',
                description: 'Technique description from MITRE ATT&CK',
                tactics: [],
                url: `https://attack.mitre.org/techniques/${techniqueId}`,
            };
        }
        catch (error) {
            logger_1.default.error('MITRE ATT&CK lookup failed', { error: error.message });
            throw error;
        }
    }
}
exports.default = new ThreatIntelService();
