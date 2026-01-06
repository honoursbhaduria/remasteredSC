const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseUrl: string;
  private userId: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load token from localStorage on init
    const token = localStorage.getItem('authToken');
    if (token) {
      this.userId = localStorage.getItem('userId');
    }
  }
  //  i don;t know why it is not showing 
  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-auth-token'] = token;
    }

    if (this.userId) {
      headers['x-user-id'] = this.userId;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string, role: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    if (data.user) {
      this.setUserId(data.user.id);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Cases endpoints
  async getCases() {
    return this.request('/cases');
  }

  async getCaseById(id: string) {
    return this.request(`/cases/${id}`);
  }

  async createCase(caseData: any) {
    return this.request('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async updateCase(id: string, caseData: any) {
    return this.request(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
  }

  // Evidence endpoints
  async getRawEvidence(caseId?: string) {
    const query = caseId ? `?caseId=${caseId}` : '';
    return this.request(`/evidence/raw${query}`);
  }

  async getFilteredArtifacts(caseId?: string, threshold?: number) {
    const params = new URLSearchParams();
    if (caseId) params.append('caseId', caseId);
    if (threshold !== undefined) params.append('threshold', threshold.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/evidence/filtered${query}`);
  }

  async markAsFalsePositive(id: string) {
    return this.request(`/evidence/${id}/false-positive`, { method: 'PATCH' });
  }

  async excludeFromStory(id: string) {
    return this.request(`/evidence/${id}/exclude-story`, { method: 'PATCH' });
  }

  // Data endpoints
  async getAttackStory(caseId: string) {
    return this.request(`/data/story/${caseId}`);
  }

  async getEvidenceFiles(caseId?: string) {
    const query = caseId ? `?caseId=${caseId}` : '';
    return this.request(`/data/files${query}`);
  }

  async getChainOfCustody(evidenceId?: string) {
    const query = evidenceId ? `?evidenceId=${evidenceId}` : '';
    return this.request(`/data/chain-of-custody${query}`);
  }

  async getSystemStats() {
    return this.request('/data/system-stats');
  }

  async getNotes(caseId?: string) {
    const query = caseId ? `?caseId=${caseId}` : '';
    return this.request(`/data/notes${query}`);
  }

  async addNote(note: any) {
    return this.request('/data/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async getDecisions(caseId?: string) {
    const query = caseId ? `?caseId=${caseId}` : '';
    return this.request(`/data/decisions${query}`);
  }

  async addDecision(decision: any) {
    return this.request('/data/decisions', {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  }

  // ML/AI endpoints
  async analyzeEvent(event: any, caseId?: string) {
    return this.request('/ml/analyze', {
      method: 'POST',
      body: JSON.stringify({ event, caseId }),
    });
  }

  async classifyEvent(event: any) {
    return this.request('/ml/classify', {
      method: 'POST',
      body: JSON.stringify({ event }),
    });
  }

  async generateStory(events: any[], caseId?: string) {
    return this.request('/ml/generate-story', {
      method: 'POST',
      body: JSON.stringify({ events, caseId }),
    });
  }

  async batchAnalyzeEvents(events: any[], caseId?: string) {
    return this.request('/ml/batch-analyze', {
      method: 'POST',
      body: JSON.stringify({ events, caseId }),
    });
  }

  async checkIPReputation(ip: string) {
    return this.request(`/ml/threat-intel/ip/${ip}`);
  }

  async checkFileHash(hash: string) {
    return this.request(`/ml/threat-intel/hash/${hash}`);
  }

  async checkDomain(domain: string) {
    return this.request(`/ml/threat-intel/domain/${domain}`);
  }

  async getMLHealth() {
    return this.request('/ml/health');
  }

  // File upload endpoint
  async uploadEvidenceFile(caseId: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}/evidence/upload`);
      
      const token = localStorage.getItem('authToken');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-auth-token', token);
      }
      if (this.userId) {
        xhr.setRequestHeader('x-user-id', this.userId);
      }

      xhr.send(formData);
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
