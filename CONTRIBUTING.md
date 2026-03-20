# 👥 Contributing to MedProof

Thank you for your interest in contributing to MedProof! This guide explains how to set up your development environment, follow our conventions, and submit contributions.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Code Standards](#code-standards)
4. [Commit Conventions](#commit-conventions)
5. [Pull Request Process](#pull-request-process)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Security](#security)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Docker & Docker Compose (for full stack testing)
- PostgreSQL 14+ (if running locally)

### Fork & Clone

```bash
# 1. Fork repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/medproof.git
cd medicalreport

# 3. Add upstream remote
git remote add upstream https://github.com/stellar-connect-wallet/medproof.git

# 4. Keep your fork updated
git fetch upstream
git rebase upstream/main
```

---

## Development Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your local values
# IMPORTANT: Use Stellar testnet, local database

# Database setup
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=medproof \
  postgres:14

# Run migrations (if applicable)
npx sequelize-cli db:migrate

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Opens automatically at http://localhost:3000
```

### Full Stack with Docker Compose

```bash
# From project root
docker-compose up --build

# Services available:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Verify Setup

```bash
# Test backend
curl http://localhost:5000/health

# Test frontend loads
curl http://localhost:3000

# Check database
docker-compose exec db psql -U postgres -d medproof -c "\dt"
```

---

## Code Standards

### JavaScript/Node.js

**ESLint Configuration:** Airbnb base rules

```bash
# Run linter
npm run lint

# Fix automatically
npm run lint -- --fix

# Check a specific file
npx eslint backend/server.js
```

**Code Style:**

```javascript
// ✅ GOOD
const getUserReport = async (userId, reportId) => {
  const report = await db.query(
    'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
    [reportId, userId]
  );
  
  if (!report) {
    throw new NotFoundError('Report');
  }
  
  return report;
};

// ❌ BAD
const getUserReport = async(userId,reportId)=>{
  let report = db.query('SELECT * FROM reports WHERE id = '+reportId+' AND user_id = '+userId)
  if (!report) throw new Error("Not found")
  return report
}
```

**Naming Conventions:**
```javascript
// Variables & Functions: camelCase
const userName = 'John';
const getUserReports = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const API_ENDPOINT = 'https://api.example.com';

// Classes: PascalCase
class UserController {}
class DatabaseConnection {}

// Private methods: _leading underscore (or use #)
_validateInput = (data) => {};
#encrypt = (text) => {};
```

**Comments:**

```javascript
// ✅ Good: Explains WHY, not WHAT
// Skip validation for internal API calls to reduce latency
if (!req.internal) {
  validateInput(data);
}

// ❌ Bad: Obvious from code
// Set validate to true
let validate = true;

// ✅ JSDoc for functions
/**
 * Verify medical report authenticity
 * @param {string} reportHash - SHA-256 hash of report
 * @param {string} signature - Blockchain signature
 * @returns {Promise<boolean>} Verification result
 * @throws {BlockchainError} If verification fails
 */
async function verifyReport(reportHash, signature) {
  // implementation
}
```

### React Components

**Functional Components Only:**

```javascript
// ✅ GOOD
const ReportUpload = ({ onSuccess }) => {
  const [files, setFiles] = React.useState([]);
  
  const handleUpload = async (file) => {
    // implementation
  };
  
  return (
    <div className="upload-container">
      {/* JSX */}
    </div>
  );
};

export default ReportUpload;

// ❌ BAD - Class components
class ReportUpload extends React.Component {
  // Don't use class components
}
```

**Props Type Checking:**

```javascript
import PropTypes from 'prop-types';

const ReportCard = ({ report, onDelete, isLoading }) => {
  // implementation
};

ReportCard.propTypes = {
  report: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

ReportCard.defaultProps = {
  isLoading: false
};

export default ReportCard;
```

**Hooks & Performance:**

```javascript
// ✅ Use custom hooks for logic
const useReportFetch = (reportId) => {
  const [report, setReport] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    fetchReport(reportId).then(setReport).finally(() => setLoading(false));
  }, [reportId]);
  
  return { report, loading };
};

// ✅ Memoize expensive computations
const MedicalTimeline = React.memo(({ events }) => {
  return events.map(event => <TimelineEvent key={event.id} event={event} />);
});

// ✅ Memoize callbacks
const handleDelete = React.useCallback((id) => {
  deleteReport(id);
}, []);
```

---

## Commit Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:** Must be one of the following:
- **feat:** New feature
- **fix:** Bug fix
- **refactor:** Code refactoring without feature change
- **perf:** Performance improvement
- **docs:** Documentation only
- **test:** Test addition/modification
- **chore:** Build, dependencies, or tooling
- **style:** Formatting only (no code change)

**Scope:** Component or area affected
- backend
- frontend
- docs
- security
- database

**Subject:**
- Use imperative mood ("add" not "added")
- Lowercase first letter
- No period at end
- Max 50 characters

**Examples:**

```bash
# ✅ Good commits
git commit -m "feat(backend): add report verification endpoint"
git commit -m "fix(frontend): resolve upload progress bar not displaying"
git commit -m "refactor(backend): extract validation logic to middleware"
git commit -m "docs: update API documentation for batch operations"
git commit -m "test(backend): add integration tests for insurance claims"

# ❌ Bad commits
git commit -m "Update stuff"
git commit -m "Fixed a bug."
git commit -m "WIP"
git commit -m "asdfasdf"
```

### Commit Body

Include motivation and contrast with previous behavior:

```
feat(backend): add blockchain verification for medical reports

Implement Soroban smart contract integration to verify report
authenticity on Stellar blockchain. Adds new endpoint:

POST /api/reports/{id}/verify

Resolves #123
Closes #124
```

### Push to Your Fork

```bash
# Create feature branch
git checkout -b feature/report-verification

# Make changes & commit
git add .
git commit -m "feat(backend): add report verification"

# Push to your fork
git push origin feature/report-verification
```

---

## Pull Request Process

### Before Creating PR

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests locally:**
   ```bash
   npm test
   ```

3. **Check linting:**
   ```bash
   npm run lint
   ```

4. **Verify no secrets in code:**
   ```bash
   git log -p --all -S 'SECRET_KEY' -- '*.js'
   ```

### Create Pull Request

**Title Format:**
```
[Area] Brief description

[backend] Add blockchain verification for medical reports
[frontend] Fix upload progress bar display
[docs] Update deployment guide
```

**Description Template:**

```markdown
## Description
Brief description of changes

## Motivation & Context
Why is this change needed? What problem does it solve?

## Testing
How have you tested these changes?
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines (ESLint passes)
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No secrets/credentials in code
- [ ] Backward compatible changes

## Related Issues
Closes #123
Related to #124
```

### Code Review Process

Our maintainers will:
1. Review code for quality & security
2. Request changes if needed
3. Approve when ready to merge
4. Merge to main branch

**Be responsive to feedback:**
- Respond to comments within 48 hours
- Push additional commits to same branch
- Rebase if requested: `git rebase upstream/main && git push -f`

---

## Testing

### Unit Tests

```javascript
// __tests__/services/reportService.test.js
const { verifyReport } = require('../../services/reportService');

describe('Report Service', () => {
  test('should verify valid report', async () => {
    const result = await verifyReport('valid-hash');
    expect(result).toBe(true);
  });
  
  test('should reject invalid report', async () => {
    expect(() => verifyReport(null)).toThrow();
  });
});
```

**Run tests:**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm test -- --testNamePattern="verify" # Specific test
```

### Integration Tests

```javascript
// __tests__/integration/reports.test.js
const request = require('supertest');
const app = require('../../server');

describe('Report Endpoints', () => {
  test('POST /api/reports should upload report', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Test Report',
        content: 'Report content'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### Frontend Tests

```javascript
// __tests__/components/ReportCard.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportCard from '../components/ReportCard';

test('should display report and allow deletion', async () => {
  const report = { id: '1', title: 'Test', date: new Date() };
  const handleDelete = jest.fn();
  
  render(<ReportCard report={report} onDelete={handleDelete} />);
  
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  await userEvent.click(deleteButton);
  
  expect(handleDelete).toHaveBeenCalledWith('1');
});
```

### Coverage Requirements

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

**Minimum coverage targets:**
- 70% line coverage
- 70% function coverage
- 70% branch coverage
- Critical paths: 90%+ coverage

---

## Documentation

### Code Documentation

**API Endpoints:**

```javascript
/**
 * Upload Medical Report
 * @route POST /api/reports
 * @access Private (requires JWT)
 * @param {Object} body
 * @param {string} body.title - Report title (max 255 chars)
 * @param {string} body.content - Report content (max 10MB)
 * @returns {Object} Newly created report
 * @example
 * POST /api/reports
 * Authorization: Bearer eyJhbGc...
 * 
 * {
 *   "title": "Lab Results",
 *   "content": "..."
 * }
 * 
 * Response: 201 Created
 * {
 *   "id": "uuid",
 *   "title": "Lab Results",
 *   "createdAt": "2024-01-01T00:00:00Z"
 * }
 */
app.post('/api/reports', verifyToken, uploadReport);
```

**Component Documentation:**

```javascript
/**
 * Medical Report Upload Component
 * 
 * Allows users to upload medical reports with file validation
 * and progress tracking.
 * 
 * @component
 * @example
 * return (
 *   <ReportUpload
 *     maxSize={100 * 1024 * 1024}
 *     onSuccess={() => navigate('/reports')}
 *   />
 * )
 * 
 * @param {Object} props
 * @param {number} props.maxSize - Max file size in bytes
 * @param {function} props.onSuccess - Success callback
 * @param {function} props.onError - Error callback
 */
const ReportUpload = ({ maxSize = 100 * 1024 * 1024, onSuccess, onError }) => {
  // implementation
};
```

### Update Documentation

When contributing features:

1. **Update API_DOCUMENTATION.md** for new endpoints
2. **Update README.md** if adding features visible to users
3. **Update contributing guide** if process changes
4. **Add JSDoc comments** for all functions/components

---

## Security

### Secure Coding Practices

**Never commit:**
- Passwords or API keys
- Private keys or certificates
- Personal or confidential data
- Secrets in .env (keep only .env.example)

**Always:**
- Use parameterized queries (prevent SQL injection)
- Validate & sanitize all inputs
- Use HTTPS/TLS for all connections
- Hash passwords (bcrypt with salt factor 12+)
- Implement rate limiting
- Add security headers
- Use prepared statements

**Code Review focuses on:**
- Authentication/authorization
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection
- Secrets exposure
- Dependency vulnerabilities

### Reporting Security Issues

⚠️ **Don't open GitHub issues for security bugs**

Email: **security@medproof.dev**

Include:
- Vulnerability description
- Affected code/component
- Proof of concept
- Suggested fix

We'll acknowledge within 24 hours and keep you updated on remediation.

---

## Development Tools

### Recommended IDE Extensions (VS Code)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.makefile-tools",
    "ms-vscode-docker.remote-containers",
    "ms-vscode.remote-explorer",
    "prisma.prisma",
    "tamasfe.even-better-toml",
    "GitHub.copilot"
  ]
}
```

### Useful Commands

```bash
# Format code
npx prettier --write .

# Check dependencies for vulnerabilities
npm audit
npm audit fix

# Update dependencies (safely)
npm update
npx npm-check-updates -u

# Clean install
rm -rf node_modules package-lock.json
npm ci

# Debug
node --inspect-brk server.js
# Then open chrome://inspect

# Profile
node --prof server.js
node --prof-process isolate*.log > profile.txt
```

---

## Getting Help

**Questions?**
- Open a discussion in GitHub Discussions
- Ask in our Slack community
- Check existing issues & PRs

**Need guidance?**
- Read [DEVELOPMENT.md]() for architecture
- Check [API_DOCUMENTATION.md]() for endpoints
- Review [examples/]() folder

**Found a bug?**
1. Search existing issues
2. Create new issue with:
   - Descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs

---

## Community

We appreciate all contributions! Whether it's:
- **Code:** Features, bug fixes, refactoring
- **Documentation:** README, API docs, guides
- **Issues:** Bug reports, feature requests
- **Suggestions:** Architecture discussion, improvements

All contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

**Happy coding! 🚀**

---

**Last Updated:** March 16, 2026
