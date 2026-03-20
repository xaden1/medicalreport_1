# 🔐 MedProof Security Guide

Comprehensive security best practices, policies, and implementation guidelines for MedProof.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Secrets Management](#secrets-management)
7. [Compliance & Privacy](#compliance--privacy)
8. [Incident Response](#incident-response)
9. [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Principle of Least Privilege** - Users/services get minimum required access
3. **Secure by Default** - Security enabled without additional configuration
4. **Security through Obscurity** - Hide implementation details, not just rely on obscurity

### Threat Model

**Assets Protected:**
- Patient medical data (highly sensitive)
- User identity information
- Blockchain transactions
- API credentials and keys

**Threat Sources:**
- Unauthorized access (network attacks)
- Data theft (breaches)
- Data manipulation (integrity)
- System unavailability (DoS)
- Malicious insiders
- Supply chain attacks

**Risk Tiers:**
- 🔴 Critical: Patient data exposure, system unavailability
- 🟠 High: Unauthorized transactions, privacy violation
- 🟡 Medium: Data exposure of non-sensitive fields
- 🟢 Low: Denial of service, information disclosure

---

## Authentication & Authorization

### JWT Implementation

```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      // Short-lived token: 15 minutes
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Generate refresh token (long-lived: 7 days)
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Refresh token endpoint
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = generateToken({ id: decoded.id });
    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

module.exports = { generateToken, generateRefreshToken, verifyToken };
```

### Password Security

```javascript
const bcrypt = require('bcrypt');

// Hash password before storing
async function hashPassword(password) {
  // NIST recommends: minimum 12 characters, complexity requirements
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters');
  }
  
  const salt = await bcrypt.genSalt(12);  // Cost factor of 12
  return bcrypt.hash(password, salt);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Usage
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Check password strength
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(password)) {
    return res.status(400).json({
      error: 'Password must contain: uppercase, lowercase, number, special char, 12+ chars'
    });
  }
  
  const hashedPassword = await hashPassword(password);
  // Store hashedPassword in database
});
```

### Role-Based Access Control (RBAC)

```javascript
// backend/middleware/rbac.js

// Define roles and permissions
const rolePermissions = {
  admin: [
    'view_all_reports',
    'delete_user',
    'manage_contracts',
    'view_audit_logs'
  ],
  doctor: [
    'create_report',
    'view_own_reports',
    'verify_reports'
  ],
  patient: [
    'view_own_reports',
    'share_report',
    'consent_research'
  ],
  researcher: [
    'view_consented_data',
    'export_data'
  ]
};

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userPermissions = rolePermissions[req.user.role] || [];
    const hasPermission = requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage
app.delete('/users/:id',
  verifyToken,
  authorize('delete_user'),
  deleteUserHandler
);

module.exports = { authorize };
```

### Multi-Factor Authentication (MFA)

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Setup MFA
app.post('/mfa/setup', verifyToken, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `MedProof (${req.user.email})`,
    issuer: 'MedProof',
    length: 32
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({
    secret: secret.base32,
    qrCode: qrCode,
    message: 'Scan QR code with authenticator app'
  });
});

// Verify MFA token
app.post('/mfa/verify', verifyToken, (req, res) => {
  const { token } = req.body;
  const user = getUser(req.user.id);
  
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: token,
    window: 2  // Allow 2 time windows for clock skew
  });
  
  if (verified) {
    res.json({ message: 'MFA enabled' });
  } else {
    res.status(400).json({ error: 'Invalid token' });
  }
});
```

---

## Data Protection

### Encryption at Rest

```javascript
// backend/services/encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');  // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:encrypted:authTag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

function decrypt(encryptedText) {
  const [ivHex, encrypted, authTagHex] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
const encryptedReport = encrypt(reportData);
const decryptedReport = decrypt(encryptedReport);

module.exports = { encrypt, decrypt };
```

### Encryption in Transit

```javascript
// HTTPS/TLS Configuration
app.use((req, res, next) => {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// HSTS Header
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// TLS Configuration (Node.js)
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  minVersion: 'TLSv1.2',
  ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256'
};

https.createServer(options, app).listen(process.env.PORT);
```

### Database Encryption

```javascript
// Encrypt sensitive PII fields
async function storePatientData(patient) {
  return {
    id: patient.id,
    ssn: encrypt(patient.ssn),  // Encrypted
    dateOfBirth: encrypt(patient.dateOfBirth),  // Encrypted
    firstName: encrypt(patient.firstName),  // Encrypted
    lastName: encrypt(patient.lastName),  // Encrypted
    email: patient.email  // Not encrypted (used for lookups)
  };
}

// Retrieve and decrypt
async function getPatientData(patientId) {
  const patient = await db.query('SELECT * FROM patients WHERE id = $1', [patientId]);
  
  return {
    ...patient,
    ssn: decrypt(patient.ssn),
    dateOfBirth: decrypt(patient.dateOfBirth),
    firstName: decrypt(patient.firstName),
    lastName: decrypt(patient.lastName)
  };
}
```

---

## API Security

### Input Validation & Sanitization

```javascript
// backend/middleware/validationSchemas.js
const Joi = require('joi');

// Whitelist approach: define what's allowed
const uploadReportSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  reportType: Joi.string().valid('laboratory', 'imaging', 'pathology').required(),
  fileHash: Joi.string().hex().length(64).required(),  // SHA-256
  fileSize: Joi.number().max(100 * 1024 * 1024).required(),  // Max 100MB
  description: Joi.string().max(5000).optional(),
  // Prevent JSON injection
  metadata: Joi.object().unknown(false).optional()
}).unknown(false);  // Reject unknown fields

function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // Return all errors
      stripUnknown: true  // Remove unknown fields
    });
    
    if (error) {
      const details = error.details.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({ error: 'Validation failed', details });
    }
    
    req.validatedData = value;
    next();
  };
}

// HTML/SQL escape
const sanitize = (str) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'\/]/g, m => map[m]);
};

module.exports = { uploadReportSchema, validateInput, sanitize };
```

### Rate Limiting

```javascript
// Tiered rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,  // Return info in RateLimit-* headers
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === '/health';
  },
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.id || req.ip;
  }
});

// Different limits for different endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 login attempts
  skipSuccessfulRequests: true
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10  // 10 uploads per hour
});

app.use('/api/', limiter);
app.post('/login', authLimiter, loginHandler);
app.post('/upload', uploadLimiter, uploadHandler);
```

### API Key Security

```javascript
// Generate secure API keys
function generateApiKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Store hashed API key
const apiKeyHash = crypto
  .createHash('sha256')
  .update(apiKey)
  .digest('hex');

// Validate API key
function validateApiKey(providedKey) {
  const hash = crypto
    .createHash('sha256')
    .update(providedKey)
    .digest('hex');
  
  return db.query(
    'SELECT * FROM api_keys WHERE key_hash = $1 AND revoked = false',
    [hash]
  );
}

// Middleware
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const key = validateApiKey(apiKey);
  if (!key) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.apiKey = key;
  next();
}

app.use('/api/v1/', requireApiKey);
```

### CORS Configuration

```javascript
// backend/middleware/security.js
export const corsOptions = {
  // Whitelist allowed origins
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://medproof.dev',
      'https://app.medproof.dev',
      'https://admin.medproof.dev'
    ];
    
    // Allow requests with no origin (mobile apps, curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Only allow required credentials
  credentials: true,
  
  // Only allow required methods
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  
  // Only allow required headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  
  // Expose only necessary headers
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  
  // Preflight cache duration
  maxAge: 3600
};

app.use(cors(corsOptions));
```

---

## Infrastructure Security

### Security Headers

```javascript
// backend/middleware/security.js
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://horizon-testnet.stellar.org; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  next();
}

app.use(securityHeaders);
```

### Firewall Rules

```bash
# Network security group rules (AWS/Azure)

# Allow HTTPS only
Inbound Rules:
- Protocol: TCP, Port: 443, Source: 0.0.0.0/0 (HTTPS)
- Protocol: TCP, Port: 22, Source: Admin-IP-Only (SSH)
- Protocol: TCP, Port: 5432, Source: App-Server-IP (Database)

# Deny all other inbound
- Protocol: All, Source: 0.0.0.0/0 (DENY)

# Outbound Rules
- Protocol: TCP, Port: 443, Destination: 0.0.0.0/0 (HTTPS outbound)
- Protocol: TCP, Port: 53, Destination: 0.0.0.0/0 (DNS)
```

### WAF (Web Application Firewall)

```javascript
// AWS WAF IP reputation list
// Google reCAPTCHA integration
// OWASP ModSecurity rules
```

---

## Secrets Management

### Environment Variables

```bash
# .env (never commit, use .env.example instead)
# Production-grade secrets handling

# Encryption Keys
ENCRYPTION_KEY=<64-char-hex-key>  # AES-256 key
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>

# Database
DATABASE_URL=postgresql://user:password@host:5432/db
DATABASE_ENCRYPTION_KEY=<key>

# Blockchain
STELLAR_SECRET_KEY=<private-key>  # Never share!
STELLAR_ACCOUNT_ID=<public-key>
SOROBAN_CONTRACT_ADDRESS=<address>

# Third-party services
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<key>
SENDGRID_API_KEY=<key>

# Security
SENTRY_DSN=<dsn>
SLACK_WEBHOOK_URL=<url>

# Feature flags
ENABLE_RATE_LIMITING=true
ENABLE_API_KEY_VALIDATION=true
REQUIRE_MFA=false
```

### Secrets Rotation

```javascript
// Rotate secrets periodically
const schedule = require('node-schedule');

// Rotate JWT secrets monthly
schedule.scheduleJob('0 0 1 * *', async () => {
  console.log('Rotating JWT secrets...');
  
  // 1. Generate new secret
  const newSecret = generateRandomSecret();
  
  // 2. Store new secret with timestamp
  await secretsManager.create({
    name: 'jwt-secret-' + Date.now(),
    value: newSecret,
    createdAt: new Date()
  });
  
  // 3. Update application to use new secret
  // 4. After 30 days, revoke old secret
});

// Rotate API keys
schedule.scheduleJob('0 0 * * 0', async () => {
  console.log('Auditing API keys...');
  
  const oldKeys = await db.query(
    'SELECT * FROM api_keys WHERE created_at < NOW() - INTERVAL 90 DAYs'
  );
  
  for (const key of oldKeys) {
    console.warn(`API key ${key.id} is 90+ days old, recommend rotation`);
  }
});
```

### Secret Storage Solutions

**Development:** .env file (local, never committed)
**Staging:** Cloud secrets manager (AWS Secrets Manager, Azure Key Vault)
**Production:** Dedicated secrets manager with audit logs

```javascript
// AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  return new Promise((resolve, reject) => {
    secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data.SecretString));
      }
    });
  });
}

// Usage
const dbPassword = await getSecret('prod/database-password');
```

---

## Compliance & Privacy

### HIPAA Compliance (Healthcare)

**Required Controls:**
1. Access controls - verify patient/doctor relationships
2. Audit logging - track who accessed what and when
3. Encryption - at rest and in transit
4. Data retention - follow retention schedules
5. Breach notification - 60-day breach notification requirement

```javascript
// HIPAA audit logging
async function logAuditEvent(event) {
  await db.query(
    `INSERT INTO audit_logs 
     (user_id, action, resource, timestamp, ip_address, results)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.userId,
      event.action,  // 'view_report', 'edit_patient', etc.
      event.resource,  // What was accessed
      new Date(),
      event.ipAddress,
      event.results  // Success/failure
    ]
  );
}

// Log all sensitive operations
app.get('/patients/:id/reports', (req, res) => {
  // Verify user has permission to view
  if (!canViewPatient(req.user, req.params.id)) {
    logAuditEvent({
      userId: req.user.id,
      action: 'unauthorized_access',
      resource: `patient:${req.params.id}`,
      ipAddress: req.ip,
      results: 'denied'
    });
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  logAuditEvent({
    userId: req.user.id,
    action: 'view_reports',
    resource: `patient:${req.params.id}`,
    ipAddress: req.ip,
    results: 'success'
  });
  
  // Return reports...
});
```

### GDPR Compliance

**Required Controls:**
1. Data minimization - collect only necessary data
2. Consent management - explicit consent for data use
3. Right to access - users can download their data
4. Right to deletion - users can request deletion
5. Privacy by design - encrypt by default

```javascript
// Right to Access
app.get('/user/data-export', verifyToken, async (req, res) => {
  const user = req.user;
  
  // Collect all user data
  const data = {
    profile: await db.query('SELECT * FROM users WHERE id = $1', [user.id]),
    reports: await db.query('SELECT * FROM reports WHERE user_id = $1', [user.id]),
    timeline: await db.query('SELECT * FROM timeline WHERE user_id = $1', [user.id]),
    consents: await db.query('SELECT * FROM consents WHERE user_id = $1', [user.id]),
    loginHistory: await db.query('SELECT * FROM login_logs WHERE user_id = $1', [user.id])
  };
  
  // Export as JSON
  res.json(data);
  
  // Log export
  logAuditEvent({
    userId: user.id,
    action: 'data_export',
    resource: 'self',
    results: 'success'
  });
});

// Right to Deletion
app.delete('/user/delete-account', verifyToken, async (req, res) => {
  const { password } = req.body;
  const user = req.user;
  
  // Verify password
  if (!await verifyPassword(password, user.passwordHash)) {
    return res.status(403).json({ error: 'Invalid password' });
  }
  
  // Archive data before deletion
  await db.query(
    'INSERT INTO deleted_users (id, email, data) VALUES ($1, $2, $3)',
    [user.id, user.email, JSON.stringify(getUserData(user.id))]
  );
  
  // Delete user data in 30 days (GDPR allows grace period)
  schedule.scheduleJob(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), () => {
    db.query('DELETE FROM users WHERE id = $1', [user.id]);
  });
});
```

---

## Incident Response

### Breach Response Plan

**1. Detection & Analysis (0-1 hour)**
```
- Monitor for anomalies
- Check logs for unauthorized access
- Verify breach occurred and scope
- Alert security team immediately
```

**2. Containment (1-4 hours)**
```
- Isolate affected systems
- Revoke compromised credentials
- Enable additional logging
- Notify management and legal
```

**3. Notification (4-24 hours)**
```
- Notify affected users (GDPR requires without undue delay)
- Contact law enforcement if necessary
- Notify media if widespread
- Contact regulatory bodies (HIPAA within 60 days)
```

**4. Recovery & Post-Incident**
```
- Analyze root cause
- Patch vulnerabilities
- Improve security controls
- Document lessons learned
- Follow up with users after 30 days
```

```javascript
// Incident response script
async function handleSecurityBreach(breachType, affectedUsers) {
  // 1. Log incident
  await db.query(
    `INSERT INTO security_incidents 
     (type, affected_users, timestamp, status)
     VALUES ($1, $2, $3, $4)`,
    [breachType, affectedUsers.length, new Date(), 'detected']
  );
  
  // 2. Alert security team
  await sendSlackAlert(
    `⚠️ Security Incident: ${breachType}`,
    '🔴 critical'
  );
  
  // 3. Revoke potentially compromised credentials
  for (const user of affectedUsers) {
    await invalidateAllTokens(user.id);
    await resetPassword(user.id);
  }
  
  // 4. Force re-authentication
  await invalidateAllSessions();
  
  // 5. Begin investigation
  await logIncidentDetails(breachType, affectedUsers);
}
```

---

## Security Checklist

### Before Production Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS/TLS enabled with modern protocols
- [ ] HSTS header configured
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] CORS whitelist configured (not *)
- [ ] Rate limiting enabled
- [ ] Input validation and sanitization implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection enabled
- [ ] XSS protection implemented
- [ ] Authentication (JWT or session-based)
- [ ] Authorization (RBAC) implemented
- [ ] Audit logging configured
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies up-to-date and scanned (`npm audit`)
- [ ] Secrets not in commit history (`git log`)
- [ ] Database encryption enabled
- [ ] Backups configured and tested
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Security training completed for team

### Ongoing Security

- [ ] Daily: Monitor security logs
- [ ] Weekly: Review access logs for anomalies
- [ ] Monthly: Update dependencies and patches
- [ ] Monthly: Rotate secrets/API keys
- [ ] Quarterly: Security audit and penetration test
- [ ] Quarterly: Review and update incident response plan
- [ ] Annually: Full security assessment
- [ ] As needed: Apply emergency patches

---

## Security Tools & Services

**Dependency Scanning:**
- npm audit
- Snyk (snyk.io)
- WhiteSource (whitesourcesoftware.com)

**SAST (Static Analysis):**
- SonarQube (sonarqube.org)
- Checkmarx
- Fortify

**DAST (Dynamic Testing):**
- Burp Suite (portswigger.net)
- OWASP ZAP
- Veracode

**Cloud Security:**
- AWS GuardDuty
- Azure Defender
- Google Cloud Security Command Centre

**Monitoring:**
- Sentry (sentry.io) - Error tracking
- Datadog (datadog.com) - Monitoring
- CloudFlare (cloudflare.com) - DDoS protection

---

## Contact & Escalation

**Security vulnerabilities found?**

Please report to: **security@medproof.dev**

Include:
- Description of vulnerability
- Proof of concept
- Potential impact
- Suggested fix

We commit to:
- Acknowledging within 24 hours
- Providing update within 7 days
- Crediting researcher (with permission)

---

**Last Updated:** March 16, 2026
