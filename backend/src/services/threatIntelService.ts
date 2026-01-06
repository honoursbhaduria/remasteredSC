import axios from 'axios';
import config from '../config/config';
import logger from '../middleware/logger';

export interface ThreatIntelligence {
  ipAddress?: string;
  domain?: string;
  fileHash?: string;
  reputation?: {
    score: number;
    category: string;
    isMalicious: boolean;
  };
  sources: {
    provider: string;
    data: any;
  }[];
  lastChecked: Date;
}

class ThreatIntelService {
  /**
   * Check IP address reputation across multiple sources
   */
  async checkIPReputation(ipAddress: string): Promise<ThreatIntelligence> {
    if (!config.featureFlags.threatIntelligence) {
      throw new Error('Threat intelligence feature is disabled');
    }

    const results: ThreatIntelligence = {
      ipAddress,
      sources: [],
      lastChecked: new Date(),
    };

    try {
      // Check VirusTotal
      if (config.threatIntel.virustotal.apiKey) {
        const vtData = await this.checkVirusTotal('ip-addresses', ipAddress);
        results.sources.push({ provider: 'VirusTotal', data: vtData });
      }

      // Check AbuseIPDB
      if (config.threatIntel.abuseipdb.apiKey) {
        const abuseData = await this.checkAbuseIPDB(ipAddress);
        results.sources.push({ provider: 'AbuseIPDB', data: abuseData });
      }

      // Check GreyNoise
      if (config.threatIntel.greynoise.apiKey) {
        const greynoiseData = await this.checkGreyNoise(ipAddress);
        results.sources.push({ provider: 'GreyNoise', data: greynoiseData });
      }

      // Calculate aggregate reputation
      results.reputation = this.calculateReputation(results.sources);

      return results;
    } catch (error: any) {
      logger.error('IP reputation check failed', { error: error.message, ipAddress });
      throw error;
    }
  }

  /**
   * Check file hash reputation
   */
  async checkFileHash(hash: string): Promise<ThreatIntelligence> {
    if (!config.featureFlags.threatIntelligence) {
      throw new Error('Threat intelligence feature is disabled');
    }

    const results: ThreatIntelligence = {
      fileHash: hash,
      sources: [],
      lastChecked: new Date(),
    };

    try {
      // Check VirusTotal
      if (config.threatIntel.virustotal.apiKey) {
        const vtData = await this.checkVirusTotal('files', hash);
        results.sources.push({ provider: 'VirusTotal', data: vtData });
      }

      results.reputation = this.calculateReputation(results.sources);

      return results;
    } catch (error: any) {
      logger.error('File hash check failed', { error: error.message, hash });
      throw error;
    }
  }

  /**
   * Check domain reputation
   */
  async checkDomain(domain: string): Promise<ThreatIntelligence> {
    if (!config.featureFlags.threatIntelligence) {
      throw new Error('Threat intelligence feature is disabled');
    }

    const results: ThreatIntelligence = {
      domain,
      sources: [],
      lastChecked: new Date(),
    };

    try {
      // Check VirusTotal
      if (config.threatIntel.virustotal.apiKey) {
        const vtData = await this.checkVirusTotal('domains', domain);
        results.sources.push({ provider: 'VirusTotal', data: vtData });
      }

      results.reputation = this.calculateReputation(results.sources);

      return results;
    } catch (error: any) {
      logger.error('Domain check failed', { error: error.message, domain });
      throw error;
    }
  }

  /**
   * VirusTotal API integration
   */
  private async checkVirusTotal(resource: string, identifier: string): Promise<any> {
    try {
      const response = await axios.get(
        `${config.threatIntel.virustotal.apiUrl}/${resource}/${identifier}`,
        {
          headers: {
            'x-apikey': config.threatIntel.virustotal.apiKey,
          },
        }
      );

      return {
        malicious: response.data.data?.attributes?.last_analysis_stats?.malicious || 0,
        suspicious: response.data.data?.attributes?.last_analysis_stats?.suspicious || 0,
        harmless: response.data.data?.attributes?.last_analysis_stats?.harmless || 0,
        total: response.data.data?.attributes?.last_analysis_stats?.malicious +
               response.data.data?.attributes?.last_analysis_stats?.suspicious +
               response.data.data?.attributes?.last_analysis_stats?.harmless || 0,
        reputation: response.data.data?.attributes?.reputation,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { notFound: true };
      }
      logger.error('VirusTotal API error', { error: error.message });
      throw error;
    }
  }

  /**
   * AbuseIPDB API integration
   */
  private async checkAbuseIPDB(ipAddress: string): Promise<any> {
    try {
      const response = await axios.get(
        `${config.threatIntel.abuseipdb.apiUrl}/check`,
        {
          params: {
            ipAddress,
            maxAgeInDays: 90,
            verbose: true,
          },
          headers: {
            'Key': config.threatIntel.abuseipdb.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      return {
        abuseConfidenceScore: response.data.data?.abuseConfidenceScore || 0,
        totalReports: response.data.data?.totalReports || 0,
        isWhitelisted: response.data.data?.isWhitelisted || false,
        isTor: response.data.data?.isTor || false,
        countryCode: response.data.data?.countryCode,
      };
    } catch (error: any) {
      logger.error('AbuseIPDB API error', { error: error.message });
      throw error;
    }
  }

  /**
   * GreyNoise API integration
   */
  private async checkGreyNoise(ipAddress: string): Promise<any> {
    try {
      const response = await axios.get(
        `${config.threatIntel.greynoise.apiUrl}/community/${ipAddress}`,
        {
          headers: {
            'key': config.threatIntel.greynoise.apiKey,
          },
        }
      );

      return {
        noise: response.data?.noise || false,
        riot: response.data?.riot || false,
        classification: response.data?.classification,
        name: response.data?.name,
        link: response.data?.link,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { notFound: true };
      }
      logger.error('GreyNoise API error', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate aggregate reputation from multiple sources
   */
  private calculateReputation(sources: Array<{ provider: string; data: any }>): {
    score: number;
    category: string;
    isMalicious: boolean;
  } {
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
        } else if (source.data.classification === 'benign') {
          totalScore += 0;
          count++;
        }
      }
    }

    const avgScore = count > 0 ? totalScore / count : 0;
    
    let category = 'Unknown';
    if (avgScore >= 0.7) category = 'Malicious';
    else if (avgScore >= 0.4) category = 'Suspicious';
    else if (avgScore >= 0.1) category = 'Potentially Malicious';
    else category = 'Clean';

    return {
      score: avgScore,
      category,
      isMalicious: avgScore >= 0.7,
    };
  }

  /**
   * Get MITRE ATT&CK technique information
   */
  async getMitreAttackInfo(techniqueId: string): Promise<any> {
    try {
      // For now, return mock data. In production, integrate with MITRE ATT&CK API
      return {
        id: techniqueId,
        name: 'Technique Name',
        description: 'Technique description from MITRE ATT&CK',
        tactics: [],
        url: `https://attack.mitre.org/techniques/${techniqueId}`,
      };
    } catch (error: any) {
      logger.error('MITRE ATT&CK lookup failed', { error: error.message });
      throw error;
    }
  }
}

export default new ThreatIntelService();
