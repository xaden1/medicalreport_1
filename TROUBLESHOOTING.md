# 🔧 MedProof Troubleshooting Guide

Comprehensive troubleshooting for common issues, errors, and solutions.

---

## Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Database Issues](#database-issues)
5. [Blockchain Issues](#blockchain-issues)
6. [Docker Issues](#docker-issues)
7. [Deployment Issues](#deployment-issues)
8. [Performance Issues](#performance-issues)
9. [Security Issues](#security-issues)

---

## Setup & Installation

### Issue: Node.js version mismatch

**Error:** `npm ERR! The engine "node" is incompatible with this package`

**Solution:**
```bash
# Check current version
node --version

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install correct Node version
nvm install 18
nvm alias default 18
nvm use 18

# Verify
node --version  # Should be v18.x.x
```

### Issue: npm install fails with permission error

**Error:** `npm ERR! code EACCES` or `Permission denied`

**Solution (macOS/Linux):**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install -g <package>
```

**Solution (Windows):**
```bash
# Run as Administrator
# Or reinstall Node.js with admin privileges
```

### Issue: Dependencies not installing

**Error:** `npm ERR! 404 Not Found` or similar

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for production
npm ci
```

### Issue: Git clone fails

**Error:** `fatal: unable to access repository`

**Solution:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub
cat ~/.ssh/id_ed25519.pub  # Copy to GitHub settings

# Or use HTTPS instead of SSH
git clone https://github.com/stellar-connect-wallet/medproof.git

# Cache credentials
git config --global credential.helper store
```

---

## Backend Issues

### Issue: Port 5000 already in use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution (macOS/Linux):**
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

**Solution (Windows):**
```bash
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Or use different port
set PORT=3001 && npm start
```

### Issue: Environment variables not loaded

**Error:** `TypeError: Cannot read property 'split' of undefined` or missing config

**Solution:**
```bash
# Check .env file exists
ls -la backend/.env  # or dir backend\.env on Windows

# Copy from template
cp backend/.env.example backend/.env

# Verify variables are set
echo $STELLAR_NETWORK  # or echo %STELLAR_NETWORK% on Windows

# Reload environment
source ~/.bashrc  # macOS/Linux
# Or restart terminal/IDE
```

### Issue: Database connection fails

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432` or similar

**Solution:**
```bash
# Check if database service is running
docker ps | grep postgres  # Or your DB

# Start database
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=medproof \
  postgres:14

# Test connection
psql -h localhost -U postgres -d medproof

# Check connection string
echo $DATABASE_URL
# Should be: postgresql://user:password@localhost:5432/medproof
```

### Issue: Stellar SDK initialization fails

**Error:** `Error: Invalid Stellar account` or similar

**Solution:**
```bash
# Verify Stellar credentials
echo $STELLAR_ACCOUNT_ID
echo $STELLAR_SECRET_KEY

# Test Stellar network connectivity
curl https://horizon-testnet.stellar.org/

# Check contract address
echo $SOROBAN_CONTRACT_ADDRESS

# Verify account has lumens
# Visit https://laboratory.stellar.org and check balance
```

### Issue: IPFS connection timeout

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5001` or timeout

**Solution:**
```bash
# Start local IPFS daemon
ipfs daemon

# Or use public gateway
IPFS_GATEWAY_URL=https://gateway.pinata.cloud npm start

# Check IPFS connectivity
curl http://localhost:5001/api/v0/version

# Use Infura gateway as backup
IPFS_GATEWAY_URL=https://ipfs.infura.io:5001
```

### Issue: API returns 500 error

**Error:** `500 Internal Server Error` with no details

**Solution:**
```bash
# Check server logs
docker logs medproof-backend

# Enable debug logging
LOG_LEVEL=debug npm start

# Add try-catch and logging
try {
  // code
} catch (error) {
  console.error('Detailed error:', error.message, error.stack);
  res.status(500).json({ error: error.message });
}

# Check error middleware
# Ensure errorHandler is registered:
app.use(errorHandler);
```

### Issue: CORS error in frontend

**Error:** `No 'Access-Control-Allow-Origin' header is present`

**Solution:**
```bash
# Check CORS configuration
echo $FRONTEND_URL

# Verify CORS middleware is enabled
// In server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

# Or update corsOptions in security.js
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Issue: Rate limiting blocks legitimate requests

**Error:** `429 Too Many Requests`

**Solution:**
```bash
# Disable rate limiting in development
ENABLE_RATE_LIMITING=false npm start

# Or adjust limits
# In backend/middleware/security.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per window
});

# For authenticated users, set higher limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,  // 10x higher for authenticated
  keyGenerator: (req) => req.user?.id || req.ip
});
```

### Issue: Memory leak or high memory usage

**Error:** Process memory grows indefinitely or crashes

**Solution:**
```bash
# Check memory usage
node --max-old-space-size=4096 server.js

# Enable heap snapshots
node --inspect=0.0.0.0:9229 server.js

# Use heap profiler
npm install --save-dev heapdump

// In code
const heapdump = require('heapdump');
heapdump.writeSnapshot('./heap-' + Date.now() + '.heapsnapshot');

# Analyze snapshot in Chrome DevTools
# Open chrome://inspect and load snapshot

# Check for common issues:
# - Unclosed database connections
# - Event listeners not removed
# - Large objects kept in memory
```

---

## Frontend Issues

### Issue: npm start fails with React errors

**Error:** `Module not found` or similar

**Solution:**
```bash
# Clear node_modules
cd frontend
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Check React version
npm list react

# Update if needed
npm update react react-dom
```

### Issue: Build fails with JavaScript errors

**Error:** `npm ERR! Build failed` with syntax errors

**Solution:**
```bash
# Run linter to find issues
npm run lint

# Fix issues
npm run lint -- --fix

# Compile in development mode first
npm start

# Then try production build
npm run build
```

### Issue: Build outputs very large bundle

**Error:** Bundle size > 500KB or similar warning

**Solution:**
```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer

// In package.json buildScript
"analyze": "source-map-explorer 'build/static/js/*.js'"

npm run analyze

# Code splitting
// In App.js
const Home = React.lazy(() => import('./pages/Home'));
const ReportUpload = React.lazy(() => import('./pages/ReportUpload'));

// Lazy load routes
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/upload" element={<ReportUpload />} />
  </Routes>
</Suspense>

# Minify images
npm install --save-dev imagemin-webpack-plugin

# Remove unused dependencies
npm list
npm prune
npm audit
```

### Issue: White screen on load

**Error:** Application loads but nothing displays

**Solution:**
```bash
# Check browser console
# Press F12 or Cmd+Opt+I and check Console tab

# Common causes:
1. App component not found (check import path)
2. index.js not rendering properly
3. CSS not loading

// Ensure index.js is correct:
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

# Check public/index.html
# Verify <div id="root"></div> exists

# Check for JavaScript errors
npm start  # Look for compilation errors
```

### Issue: API requests return 404

**Error:** `404 Not Found` when calling backend

**Solution:**
```bash
# Verify API URL
// In .env
REACT_APP_API_URL=http://localhost:5000/api

# Double-check in code
const API_URL = process.env.REACT_APP_API_URL;
console.log('API URL:', API_URL);

# Ensure backend is running
curl http://localhost:5000/health

# Check for typos in endpoint
// Should be:
fetch(`${API_URL}/reports/upload`)
// Not:
fetch(`${API_URL}/report/upload`)

# Verify CORS headers
# In browser DevTools → Network tab → check headers
```

### Issue: Wallet connection fails

**Error:** `Cannot connect to Stellar wallet` or similar

**Solution:**
```bash
# Check if Freighter extension is installed
# Visit https://freighter.app

# Verify wallet configuration
// In connectWallet.js
const network = process.env.REACT_APP_STELLAR_NETWORK || 'testnet';
console.log('Using network:', network);

# Test Stellar connection
// Add to component
const testConnection = async () => {
  try {
    const server = new StellarSdk.Server(
      'https://horizon-testnet.stellar.org'
    );
    const health = await server.root();
    console.log('Stellar network health:', health);
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

---

## Database Issues

### Issue: Database won't start in Docker

**Error:** Container exits immediately with error

**Solution:**
```bash
# Check logs
docker logs medproof-postgres

# Verify credentials in docker-compose.yml
docker-compose logs -f db  # View real-time logs

# Try rebuilding
docker-compose down
docker volume rm stellar-connect-wallet_postgres_data  # Remove old data
docker-compose up -d

# Verify database is accessible
docker exec -it medproof-postgres psql -U postgres
# Or
docker-compose exec db psql -U postgres -d medproof
```

### Issue: Database connection pool exhausted

**Error:** `Error: Client pool exhausted` or connection timeout

**Solution:**
```bash
# Increase pool size
// In database config
const pool = new Pool({
  max: 20,  // Increase from 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

# Close unused connections
db.pool.on('idle', () => {
  console.log('Idle connection available');
});

# Monitor connections
SELECT count(*) FROM pg_stat_activity;

# Close unused connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND state_change < now() - interval '15 minutes';
```

### Issue: Query timeout

**Error:** `Error: query timeout expired` or slow queries

**Solution:**
```bash
# Increase query timeout
// In database config
connectionString: `${process.env.DATABASE_URL}?statement_timeout=30000`;

# Or per-query
const query = {
  text: 'SELECT * FROM reports WHERE id = $1',
  values: [reportId],
  timeout: 30000  // 30 seconds
};

# Add indexes for slow queries
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_timeline_report_id ON medical_timeline(report_id);

# Check execution plan
EXPLAIN ANALYZE SELECT * FROM reports WHERE user_id = $1;

# Run vacuum to optimize
VACUUM ANALYZE reports;
```

### Issue: Database migration fails

**Error:** Migration error or data inconsistency

**Solution:**
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback to specific point
npx sequelize-cli db:migrate:undo:all

# Manually verify database
docker-compose exec db psql -U postgres -d medproof
\dt  # List tables

# Rerun migrations
npx sequelize-cli db:migrate

# Seed data if needed
npx sequelize-cli db:seed:all
```

---

## Blockchain Issues

### Issue: Stellar network unavailable

**Error:** `Error: Request failed with status code 403` or connection refused

**Solution:**
```bash
# Check network status
curl https://horizon-testnet.stellar.org/

# Use public network instead of testnet
STELLAR_NETWORK=public npm start

# Check account balance
curl https://horizon-testnet.stellar.org/accounts/{ACCOUNT_ID}

# Create test account if needed
# Visit https://laboratory.stellar.org

# Add lumens to account
# Visit https://friendbot.stellar.org/?addr={ACCOUNT_ID}
```

### Issue: Contract deployment fails

**Error:** `Error: Contract already exists` or deployment error

**Solution:**
```bash
# Check if contract exists
soroban contract info --id {CONTRACT_ADDRESS}

# Use existing contract if already deployed
# Update CONTRACT_ADDRESS in .env

# Or deploy new contract
soroban contract deploy --wasm hello_world.wasm

# Check contract status
soroban contract invoke \
  --id {CONTRACT_ADDRESS} \
  -- \
  verify_report \
  --report_hash "{hash}"

# Verify on blockchain
curl https://horizon-testnet.stellar.org/contracts/{CONTRACT_ADDRESS}
```

### Issue: Transaction fails or gets reverted

**Error:** `Error: Transaction failed` or `MASTER_OP_NO_DESTINATION`

**Solution:**
```bash
# Check transaction result
curl https://horizon-testnet.stellar.org/transactions/{TX_HASH}

# Verify account balance
curl https://horizon-testnet.stellar.org/accounts/{ACCOUNT_ID}

# Account must have minimum balance (2 XLM)
# Add more lumens

# Check transaction details
soroban contract invoke ... --verbose

# Review contract code for logic errors
// In Rust
assert!(verification_passed, "Verification failed");

# Re-submit transaction
// In JavaScript
const transaction = new StellarSdk.TransactionBuilder(account)
  .addOperation(...)
  .build();
```

### Issue: Contract function not found

**Error:** `Error: Method not found` or similar

**Solution:**
```bash
# List contract methods
soroban contract bindings typescript \
  --contract-id {CONTRACT_ADDRESS} \
  --output-dir ./bindings

# Verify function signature matches
// Rust
pub fn verify_report(env: Env, hash: BytesN<32>) -> bool

// JavaScript - should match exactly
contract.methods.verify_report([hash])

# Redeploy contract if changed
soroban contract deploy --wasm hello_world.wasm

# Clear old contract references
rm -rf .soroban
rm -rf bindings/  # Regenerate
```

---

## Docker Issues

### Issue: Docker daemon not running

**Error:** `Cannot connect to Docker daemon`

**Solution (macOS):**
```bash
# Start Docker Desktop application
open -a Docker

# Or start Docker daemon manually
# And verify
docker --version
```

**Solution (Linux):**
```bash
# Start Docker service
sudo systemctl start docker

# Enable on boot
sudo systemctl enable docker

# Fix permissions
sudo usermod -aG docker $USER
newgrp docker  # Refresh group membership
```

**Solution (Windows):**
```bash
# Start Docker Desktop
# Or in PowerShell
Start-Service com.docker.service

# Restart WSL if needed
wsl --shutdown
```

### Issue: Container fails to build

**Error:** `Build failed` with compilation errors

**Solution:**
```bash
# Build with verbose output
docker build -t medproof-backend:latest . --progress=plain

# Check Dockerfile syntax
docker run --rm -i hadolint/hadolint < Dockerfile

# Build specific stage
docker build --target production -t medproof-backend:latest .

# Clean and rebuild
docker system prune
docker build --no-cache -t medproof-backend:latest .

# Check Docker image size
docker images medproof-backend

# Optimize Dockerfile - use smaller base image
# FROM node:18-alpine  # ~160MB
# instead of
# FROM node:18 # ~900MB
```

### Issue: Container exits immediately

**Error:** Container starts and immediately stops

**Solution:**
```bash
# Check container logs
docker logs medproof-backend

# View more logs
docker logs --tail 50 medproof-backend

# Run with debugging
docker run -it medproof-backend:latest /bin/sh

# Run with override
docker run -it medproof-backend:latest node -e "console.log('test')"

# Common causes:
# 1. Missing environment variables → add -e flags
# 2. Port already in use → use different port
# 3. Missing files → verify COPY in Dockerfile
# 4. Permission denied → check RUN user
```

### Issue: Docker Compose fails to start

**Error:** `Error while creating mount source path` or service won't start

**Solution:**
```bash
# Check compose file syntax
docker-compose config

# Start with verbose output
docker-compose up --verbose

# Check logs for each service
docker-compose logs backend
docker-compose logs frontend

# Rebuild all images
docker-compose build --no-cache

# Remove everything and restart fresh
docker-compose down -v  # -v removes volumes
docker-compose up --build

# Verify environment file exists
ls -la backend/.env

# Check volume permissions
docker volume ls
docker volume inspect stellar-connect-wallet_postgres_data
```

### Issue: Port conflicts

**Error:** `Bind for 0.0.0.0:5000 failed` or similar

**Solution:**
```bash
# Find what's using the port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in compose
docker-compose.yml:
  backend:
    ports:
      - "3001:5000"  # Change 5000 to 3001

# Or use environment
PORT=3001 docker-compose up
```

---

## Deployment Issues

### Issue: GitHub Actions pipeline fails

**Error:** Tests fail, build fails, or deployment fails

**Solution:**
```bash
# Check workflow logs
# GitHub → Actions → Select workflow → View logs

# Common issues:
# 1. Environment variables not set
#    Solution: Add secrets in GitHub → Settings → Secrets

# 2. Tests fail in CI
#    Solution: Run locally first: npm test
#    Check test output for failures

# 3. Docker build fails
#    Solution: Build locally: docker build -t test .

# 4. Deployment fails
#    Solution: Check deployment service status

# Debug locally with act
npm install -g act
act push  # Simulate GitHub Actions locally
act -l  # List available actions
```

### Issue: Vercel deployment fails

**Error:** Build fails or deployment cancelled

**Solution:**
```bash
# Check build output
# Vercel Dashboard → Project → Deployments → View Logs

# Common issues:
# 1. Missing environment variables
#    Solution: Add in Vercel Dashboard → Settings → Environment

# 2. Build command fails
#    Solution: Ensure package.json has correct build script
#    "build": "react-scripts build"

# 3. Install fails
#    Solution: Check for invalid dependencies
#    npm install locally → npm list

# 4. Port conflict
#    Solution: Don't hardcode port, use PORT env var
```

### Issue: Backend not accessible after deploy

**Error:** `503 Service Unavailable` or timeout

**Solution:**
```bash
# Check service status
# Render Dashboard → Check service status

# Check logs
# Render → Service → Logs tab

# Verify environment variables
# Settings → Environment → Verify all vars are set

# Check health endpoint
curl https://api.medproof.dev/health

# Verify database connection
# Check DATABASE_URL in environment
# Test connection from deployed service

# Check resource limits
# Monitor CPU and memory usage
# Increase if needed in service settings
```

---

## Performance Issues

### Issue: Slow API response times

**Error:** Requests taking > 5 seconds

**Solution:**
```bash
# Profile slow requests
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.path} took ${duration}ms`);
    }
  });
  next();
});

# Database query optimization
# 1. Add indexes
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

# 2. Optimize queries - use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM reports WHERE user_id = $1;

# 3. Use pagination
SELECT * FROM reports LIMIT 20 OFFSET 0;

# 4. Cache frequently accessed data
app.use(redis.cacheMiddleware());

# Monitor slow queries
node server.js > logs/performance.log 2>&1
```

### Issue: Frontend performance slow

**Error:** Page load time > 3 seconds

**Solution:**
```bash
# Analyze performance
# Chrome DevTools → Lighthouse → Generate report

# Common issues and fixes:
# 1. Large JavaScript bundles
#    Solution: Code splitting, lazy loading
//    const Component = React.lazy(() => import('./Heavy'));

# 2. Large images
#    Solution: Compress and use WebP
#    npm install imagemin-webpack-plugin

# 3. Too many HTTP requests
#    Solution: Minify, bundle, use CDN

# 4. Slow API calls
#    Solution: Cache, pagination, queries

# Check NetworkTabinDevTools
# Identify largest assets and slow requests
```

### Issue: Memory leak

**Error:** Memory usage grows over time

**Solution:**
```bash
# Monitor memory
while true; do
  ps aux | grep node
  sleep 5
done

# Identify leak with heap snapshots
node --max-old-space-size=4096 --inspect server.js

# In Chrome, open chrome://inspect
# Take heap snapshots over time
# Compare to find retained objects

# Common causes:
# 1. Event listeners not removed
#    Solution: Always remove listeners
//    element.removeEventListener('click', handler);

# 2. Unclosed connections
//    Solution: Properly close DB connections
//    db.close();

# 3. Large objects in memory
//    Solution: Stream large files, paginate data
```

---

## Security Issues

### Issue: API exposed to unauthorized access

**Error:** Anyone can access sensitive endpoints

**Solution:**
```bash
# Enable API key validation
ENABLE_API_KEY_VALIDATION=true npm start

# Or implement JWT
npm install jsonwebtoken

// Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.use('/api/protected', verifyToken);
```

### Issue: SQL Injection vulnerability

**Error:** Database is compromised or data exposed

**Solution:**
```bash
# Always use parameterized queries
// WRONG - vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// CORRECT - safe
const query = {
  text: 'SELECT * FROM users WHERE id = $1',
  values: [userId]
};

const result = await pool.query(query);
```

### Issue: CORS allowing all origins

**Error:** Security vulnerability - any site can access API

**Solution:**
```bash
# Set specific allowed origins
// In security.js
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://medproof.dev',
      'https://app.medproof.dev',
      'http://localhost:3000'  // Dev only
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
```

### Issue: Secrets exposed in code

**Error:** API keys, passwords, or tokens in source

**Solution:**
```bash
# Use environment variables instead
// WRONG
const apiKey = "sk-1234567890abcdef";

// CORRECT
const apiKey = process.env.API_KEY;

# Scan repository for exposed secrets
npm install -g detect-secrets
detect-secrets scan --baseline .

# Revoke exposed keys IMMEDIATELY
# Generate new API keys, tokens, passwords
# Update in all environments
```

---

## Getting Help

### Useful Commands

```bash
# Check system info
node --version
npm --version
docker --version
git --version

# Backend logs
docker compose logs -f backend
docker compose logs --tail 100 backend

# Database status
docker compose exec db psql -U postgres -c "\l"

# Network connectivity
curl https://horizon-testnet.stellar.org/
ping gateway.pinata.cloud

# Disk usage
du -sh *
df -h

# Port usage
lsof -i -P -n | grep LISTEN  # macOS/Linux
netstat -ano | findstr LISTEN  # Windows
```

### Debug Mode

```bash
# Backend debug
DEBUG=* npm start
LOG_LEVEL=debug npm start

# Frontend debug
BROWSER=none npm start  # Don't auto-open browser

# Docker debug
docker build --progress=plain -t test .
docker run --rm -it test /bin/sh
```

### Getting Support

**Issues Tracker:** GitHub Issues
**Documentation:** Read DEPLOYMENT.md, MONITORING.md, API_DOCUMENTATION.md
**Community:** GitHub Discussions
**Status:** Check status.medproof.dev

---

**Last Updated:** March 16, 2026
