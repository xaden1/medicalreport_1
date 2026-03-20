# 📊 MedProof Monitoring & Observability Guide

Comprehensive logging, monitoring, and observability setup for production.

---

## Table of Contents

1. [Logging Strategy](#logging-strategy)
2. [Metrics & Monitoring](#metrics--monitoring)
3. [Error Tracking](#error-tracking)
4. [Performance Monitoring](#performance-monitoring)
5. [Alerting](#alerting)
6. [Health Checks](#health-checks)
7. [Dashboards](#dashboards)

---

## Logging Strategy

### Logging Levels

```
TRACE (0) → DEBUG (1) → INFO (2) → WARN (3) → ERROR (4) → FATAL (5)
```

**Configuration:**
```env
LOG_LEVEL=info                    # Production
LOG_LEVEL=debug                   # Development
LOG_FORMAT=json                   # Structured logging
LOG_RETENTION_DAYS=30             # Log retention
```

### Structured Logging Example

```javascript
// Backend logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'error' : 'info',
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      user_id: req.user?.id,
      request_id: req.id,
      error: res.error?.message
    }));
  });
  
  next();
};
```

### Log Aggregation Setup

#### Using CloudWatch (AWS)

```bash
npm install --save aws-sdk

echo '[
  {
    "log_group_name": "/aws/lambda/medproof-backend",
    "log_stream_name": "production",
    "source": "/var/log/nodejs/medproof.log"
  }
]' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

systemctl restart amazon-cloudwatch-agent
```

#### Using ELK Stack (Self-hosted)

**docker-compose extension:**
```yaml
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

**logstash.conf:**
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "nodejs" {
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "medproof-%{+YYYY.MM.dd}"
  }
}
```

---

## Metrics & Monitoring

### Key Metrics

**Application:**
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate (errors/sec)
- Active connections
- Cache hit ratio

**Infrastructure:**
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth
- Database connections

### Prometheus Setup

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'medproof-backend'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    scheme: 'https'
    tls_config:
      insecure_skip_verify: true
```

**Express Prometheus Middleware:**
```javascript
const prometheus = require('prom-client');
const register = prometheus.register;

// Create metrics
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.labels(req.method, req.route?.path, res.statusCode).inc();
    httpRequestDuration.labels(req.method, req.route?.path, res.statusCode).observe(duration);
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

**docker-compose addition:**
```yaml
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

volumes:
  prometheus_data:
```

### Grafana Dashboards

**docker-compose addition:**
```yaml
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  grafana_data:
```

**Dashboard JSON (import in Grafana):**
```json
{
  "dashboard": {
    "title": "MedProof API Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=\"500\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## Error Tracking

### Sentry Setup

```bash
npm install --save @sentry/node
```

**server.js integration:**
```javascript
const Sentry = require("@sentry/node");

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({
      request: true,
      serverName: true,
      transaction: true,
      user: ['id', 'email']
    }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection()
  ]
});

// Attach to Express
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handling
app.use(Sentry.Handlers.errorHandler());

// Capture exceptions
process.on('unhandledRejection', (reason, promise) => {
  Sentry.captureException(new Error(`Unhandled Rejection: ${reason}`));
});
```

**.env configuration:**
```env
SENTRY_DSN=https://your-key@sentry.io/your-project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACE_SAMPLE_RATE=0.1
```

### Rollbar Integration

```bash
npm install --save rollbar
```

```javascript
const Rollbar = require('rollbar');

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production'
});

// Middleware
app.use(rollbar.errorHandler());

// Capture errors
try {
  // code
} catch (error) {
  rollbar.error(error, (err) => {
    if (err) console.log('Failed to report to Rollbar');
  });
}
```

---

## Performance Monitoring

### APM Setup (Application Performance Monitoring)

#### New Relic

```bash
npm install --save newrelic
```

**newrelic.js:**
```javascript
exports.config = {
  app_name: ['MedProof'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  agent_enabled: process.env.NODE_ENV === 'production'
};
```

**server.js (first import):**
```javascript
require('newrelic');
const express = require('express');
// ... rest of code
```

#### DataDog

```bash
npm install --save dd-trace
```

```javascript
const tracer = require('dd-trace').init({
  enabled: process.env.NODE_ENV === 'production',
  env: process.env.NODE_ENV,
  service: 'medproof-api',
  version: process.env.APP_VERSION,
  logInjection: true,
  profiler: true
});

const express = require('express');
const app = express();

app.use(tracer.middleware());
```

### Database Query Monitoring

```javascript
// Monitor slow queries
const queryStartTime = Date.now();

db.query(sql, (error, results) => {
  const duration = Date.now() - queryStartTime;
  
  if (duration > 1000) {
    console.warn({
      level: 'warn',
      message: 'Slow database query',
      duration_ms: duration,
      query: sql.substring(0, 100),
      timestamp: new Date().toISOString()
    });
  }
  
  // Continue...
});
```

---

## Alerting

### Alert Rules

```yaml
groups:
  - name: MedProof Alerts
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code="500"}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        annotations:
          summary: "High response time detected"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 5m
        annotations:
          summary: "High memory usage: {{ $value }}MB"

      - alert: DatabaseConnectionDown
        expr: mysql_up == 0
        for: 1m
        annotations:
          summary: "Database connection lost"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} < 5368709120
        for: 5m
        annotations:
          summary: "Low disk space: {{ $value | humanize }}B available"
```

### Alert Channels

#### Slack Integration

```javascript
const axios = require('axios');

async function sendSlackAlert(message, severity = 'warning') {
  const color = {
    'critical': 'danger',
    'warning': 'warning',
    'info': 'good'
  }[severity] || 'warning';
  
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    attachments: [{
      color: color,
      title: message,
      text: `Time: ${new Date().toISOString()}`,
      footer: 'MedProof Monitoring'
    }]
  });
}

// Usage
const errorRate = await getErrorRate();
if (errorRate > 0.05) {
  sendSlackAlert(`High error rate: ${(errorRate * 100).toFixed(2)}%`, 'critical');
}
```

#### PagerDuty Integration

```bash
npm install --save pdpipe
```

```javascript
const PDClient = require('pdpipe').EventBridge;

const pd = new PDClient({
  integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY
});

function triggerIncident(title, severity = 'error') {
  pd.enqueue({
    routing_key: process.env.PAGERDUTY_ROUTING_KEY,
    event_action: 'trigger',
    payload: {
      summary: title,
      severity: severity,
      source: 'MedProof API',
      timestamp: new Date().toISOString()
    }
  });
}
```

#### Email Alerts

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASSWORD
  }
});

async function sendEmailAlert(title, details) {
  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_FROM,
    to: process.env.ALERT_EMAIL_TO,
    subject: `[${process.env.NODE_ENV.toUpperCase()}] ${title}`,
    html: `
      <h2>${title}</h2>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(details, null, 2)}</pre>
    `
  });
}
```

---

## Health Checks

### Backend Health Endpoint

```javascript
app.get('/health', (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };
  
  // Database check
  db.ping((error) => {
    health.checks.database = error ? 'DOWN' : 'UP';
  });
  
  // Redis check
  redis.ping((error) => {
    health.checks.redis = error ? 'DOWN' : 'UP';
  });
  
  // Stellar network check
  stellar.checkNetworkHealth().then((status) => {
    health.checks.stellar = status ? 'UP' : 'DOWN';
  });
  
  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
  };
  
  res.json(health);
});

// Detailed health check
app.get('/health/detailed', (req, res) => {
  const health = {
    timestamp: new Date().toISOString(),
    services: {
      api: 'UP',
      database: await checkDatabase(),
      redis: await checkRedis(),
      stellar: await checkStellar(),
      ipfs: await checkIPFS(),
      email: await checkEmailService()
    },
    performance: {
      responseTime: getAverageResponseTime(),
      errorRate: getErrorRate(),
      activeConnections: getActiveConnections()
    },
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV
  };
  
  const allHealthy = Object.values(health.services).every(s => s === 'UP');
  res.status(allHealthy ? 200 : 503).json(health);
});
```

### Kubernetes Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Uptime Monitoring

Services: Pingdom, UptimeRobot, StatusCake

```bash
# UptimeRobot example
curl -X POST https://api.uptimerobot.com/v2/addMonitor \
  -d "api_key=YOUR_API_KEY" \
  -d "type=1" \
  -d "url=https://api.medproof.dev/health" \
  -d "friendly_name=MedProof API" \
  -d "interval=300"
```

---

## Dashboards

### Status Page

Use Statuspage.io or similar:

```json
{
  "components": [
    {
      "name": "API Server",
      "status": "operational",
      "description": "Main API service"
    },
    {
      "name": "Frontend",
      "status": "operational",
      "description": "Web application"
    },
    {
      "name": "Database",
      "status": "operational",
      "description": "Data storage"
    },
    {
      "name": "Stellar Network",
      "status": "operational",
      "description": "Blockchain integration"
    }
  ]
}
```

### Internal Dashboard

**Key metrics to display:**
- Real-time request rate (colored: green < 50 req/s, yellow 50-100, red > 100)
- Error rate % (red if > 5%)
- Response time p95 (target < 200ms)
- Active users
- Database query time p95
- Cache hit ratio
- Server CPU % (alert > 80%)
- Server memory % (alert > 85%)
- Disk usage % (alert > 90%)

---

## Security Monitoring

### Log Security Events

```javascript
// Track failed login attempts
app.post('/login', (req, res) => {
  try {
    const user = authenticateUser(req.body);
    console.log(JSON.stringify({
      level: 'info',
      event: 'login_success',
      user_id: user.id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.log(JSON.stringify({
      level: 'warn',
      event: 'login_failed',
      email: req.body.email,
      ip: req.ip,
      reason: error.message,
      timestamp: new Date().toISOString()
    }));
  }
});

// Track API key usage
app.use((req, res, next) => {
  if (req.headers['x-api-key']) {
    console.log(JSON.stringify({
      level: 'info',
      event: 'api_key_used',
      api_key_prefix: req.headers['x-api-key'].substring(0, 8),
      endpoint: req.path,
      ip: req.ip,
      timestamp: new Date().toISOString()
    }));
  }
  next();
});
```

---

**Last Updated:** March 16, 2026
