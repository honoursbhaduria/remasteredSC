import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  host: string;

  // Frontend
  frontendUrl: string;
  corsOrigin: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;

  // File Upload
  uploadDir: string;
  maxFileSize: number;
  allowedFileTypes: string[];

  // AI/ML APIs
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic: {
    apiKey: string;
    model: string;
  };
  googleAI: {
    apiKey: string;
    model: string;
  };
  huggingface: {
    apiKey: string;
    model: string;
  };
  azureOpenAI: {
    apiKey: string;
    endpoint: string;
    deployment: string;
    apiVersion: string;
  };

  // MITRE ATT&CK
  mitreAttack: {
    apiUrl: string;
    apiKey: string;
  };

  // Threat Intelligence
  virusTotal: {
    apiKey: string;
    apiUrl: string;
  };
  abuseIPDB: {
    apiKey: string;
    apiUrl: string;
  };
  alienVault: {
    apiKey: string;
    apiUrl: string;
  };
  shodan: {
    apiKey: string;
    apiUrl: string;
  };

  // SIEM Integration
  splunk: {
    host: string;
    port: number;
    username: string;
    password: string;
    apiToken: string;
  };
  elasticsearch: {
    node: string;
    username: string;
    password: string;
    index: string;
  };

  // Email
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
  };

  // Cloud Storage
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  azure: {
    storageConnectionString: string;
    container: string;
  };
  gcp: {
    projectId: string;
    bucket: string;
    keyfilePath: string;
  };

  // Cryptography
  crypto: {
    hashAlgorithm: string;
    encryptionKey: string;
    encryptionIv: string;
  };

  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };

  // Logging
  logging: {
    level: string;
    filePath: string;
    maxSize: number;
    maxFiles: number;
  };

  // Webhooks
  webhooks: {
    slack: string;
    discord: string;
    teams: string;
  };

  // Monitoring
  sentry: {
    dsn: string;
    environment: string;
  };
  newRelic: {
    licenseKey: string;
    appName: string;
  };

  // Session
  session: {
    secret: string;
    name: string;
    maxAge: number;
  };

  // Feature Flags
  features: {
    aiAnalysis: boolean;
    emailNotifications: boolean;
    cloudStorage: boolean;
    blockchainAudit: boolean;
    rateLimiting: boolean;
    apiDocs: boolean;
  };

  // API
  api: {
    version: string;
    prefix: string;
  };
  apiVersion: string;

  // Upload Configuration
  upload: {
    path: string;
    maxSize: number;
    allowedTypes: string[];
  };

  // Encryption
  encryption: {
    algorithm: string;
    key: string;
  };

  // AI Configuration (alias)
  ai: {
    openai: {
      apiKey: string;
      model: string;
      maxTokens: number;
      temperature: number;
    };
    anthropic: {
      apiKey: string;
      model: string;
      maxTokens: number;
    };
    google: {
      apiKey: string;
      model: string;
    };
  };

  // Threat Intel (alias)
  threatIntel: {
    virustotal: {
      apiKey: string;
      apiUrl: string;
    };
    abuseipdb: {
      apiKey: string;
      apiUrl: string;
    };
    greynoise: {
      apiKey: string;
      apiUrl: string;
    };
  };

  // Feature Flags (alias)
  featureFlags: {
    aiAnalysis: boolean;
    autoClassification: boolean;
    notifications: boolean;
    cloudStorage: boolean;
    threatIntelligence: boolean;
    siemIntegration: boolean;
    realTimeAlerts: boolean;
    advancedExport: boolean;
  };

  // Debug
  debug: boolean;
  verboseLogging: boolean;
  enableSwagger: boolean;
  swaggerUrl: string;
}

const config: Config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || 'localhost',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // File Upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '.evtx,.log,.csv,.json,.pcap').split(','),

  // AI/ML APIs
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
  },
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    model: process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    model: process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-2-70b-chat-hf',
  },
  azureOpenAI: {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  },

  // MITRE ATT&CK
  mitreAttack: {
    apiUrl: process.env.MITRE_ATTACK_API_URL || 'https://attack.mitre.org/api/v1',
    apiKey: process.env.MITRE_API_KEY || '',
  },

  // Threat Intelligence
  virusTotal: {
    apiKey: process.env.VIRUSTOTAL_API_KEY || '',
    apiUrl: process.env.VIRUSTOTAL_API_URL || 'https://www.virustotal.com/api/v3',
  },
  abuseIPDB: {
    apiKey: process.env.ABUSEIPDB_API_KEY || '',
    apiUrl: process.env.ABUSEIPDB_API_URL || 'https://api.abuseipdb.com/api/v2',
  },
  alienVault: {
    apiKey: process.env.ALIENVAULT_OTX_API_KEY || '',
    apiUrl: process.env.ALIENVAULT_OTX_API_URL || 'https://otx.alienvault.com/api/v1',
  },
  shodan: {
    apiKey: process.env.SHODAN_API_KEY || '',
    apiUrl: process.env.SHODAN_API_URL || 'https://api.shodan.io',
  },

  // SIEM Integration
  splunk: {
    host: process.env.SPLUNK_HOST || '',
    port: parseInt(process.env.SPLUNK_PORT || '8089', 10),
    username: process.env.SPLUNK_USERNAME || '',
    password: process.env.SPLUNK_PASSWORD || '',
    apiToken: process.env.SPLUNK_API_TOKEN || '',
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || '',
    index: process.env.ELASTICSEARCH_INDEX || 'forensics-logs',
  },

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@forensics-platform.com',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@forensics-platform.com',
  },

  // Cloud Storage
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
  azure: {
    storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    container: process.env.AZURE_STORAGE_CONTAINER || 'evidence-files',
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || '',
    bucket: process.env.GCP_STORAGE_BUCKET || '',
    keyfilePath: process.env.GCP_KEYFILE_PATH || './gcp-service-account-key.json',
  },

  // Cryptography
  crypto: {
    hashAlgorithm: process.env.HASH_ALGORITHM || 'sha256',
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-key-32-characters!!!',
    encryptionIv: process.env.ENCRYPTION_IV || 'default-iv-16ch',
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },

  // Webhooks
  webhooks: {
    slack: process.env.SLACK_WEBHOOK_URL || '',
    discord: process.env.DISCORD_WEBHOOK_URL || '',
    teams: process.env.TEAMS_WEBHOOK_URL || '',
  },

  // Monitoring
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
  newRelic: {
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
    appName: process.env.NEW_RELIC_APP_NAME || 'Forensics-Investigation-Platform',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    name: process.env.SESSION_NAME || 'forensics_session',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  },

  // Feature Flags
  features: {
    aiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    cloudStorage: process.env.ENABLE_CLOUD_STORAGE === 'true',
    blockchainAudit: process.env.ENABLE_BLOCKCHAIN_AUDIT === 'true',
    rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
    apiDocs: process.env.ENABLE_API_DOCS === 'true',
  },

  // API
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
  },

  // Debug
  debug: process.env.DEBUG === 'true',
  verboseLogging: process.env.VERBOSE_LOGGING === 'true',
  enableSwagger: process.env.ENABLE_SWAGGER_UI === 'true',
  swaggerUrl: process.env.SWAGGER_URL || '/api-docs',

  // API Version (shortcut)
  apiVersion: process.env.API_VERSION || 'v1',

  // Upload Configuration
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'log,txt,json,csv,xml,pcap,cap,evtx,etl,zip').split(','),
  },

  // Encryption
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'sha256',
    key: process.env.ENCRYPTION_KEY || 'default-key-32-characters!!!',
  },

  // AI Configuration (aliases for easier access)
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000', 10),
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY || '',
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
    },
  },

  // Threat Intel (aliases for easier access)
  threatIntel: {
    virustotal: {
      apiKey: process.env.VIRUSTOTAL_API_KEY || '',
      apiUrl: process.env.VIRUSTOTAL_API_URL || 'https://www.virustotal.com/api/v3',
    },
    abuseipdb: {
      apiKey: process.env.ABUSEIPDB_API_KEY || '',
      apiUrl: process.env.ABUSEIPDB_API_URL || 'https://api.abuseipdb.com/api/v2',
    },
    greynoise: {
      apiKey: process.env.GREYNOISE_API_KEY || '',
      apiUrl: process.env.GREYNOISE_API_URL || 'https://api.greynoise.io/v3',
    },
  },

  // Feature Flags (aliases for easier access)
  featureFlags: {
    aiAnalysis: process.env.FEATURE_AI_ANALYSIS === 'true',
    autoClassification: process.env.FEATURE_AUTO_CLASSIFICATION === 'true',
    notifications: process.env.FEATURE_NOTIFICATIONS === 'true',
    cloudStorage: process.env.FEATURE_CLOUD_STORAGE === 'true',
    threatIntelligence: process.env.FEATURE_THREAT_INTELLIGENCE === 'true',
    siemIntegration: process.env.FEATURE_SIEM_INTEGRATION === 'true',
    realTimeAlerts: process.env.FEATURE_REAL_TIME_ALERTS === 'true',
    advancedExport: process.env.FEATURE_ADVANCED_EXPORT === 'true',
  },
};

export default config;
