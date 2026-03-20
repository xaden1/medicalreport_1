# MedProof API Documentation

## Overview

MedProof is a decentralized medical trust network API providing blockchain-verified medical report management, patient identity verification, insurance automation, and privacy-preserving health data sharing.

**Base URL:** `http://localhost:5000/api`

**Version:** 1.0.0

**Authentication:** API Key (in development)

---

## Table of Contents

1. [Core Medical Report Endpoints](#core-medical-report-endpoints)
2. [Patient Identity Endpoints](#patient-identity-endpoints)
3. [Medical Timeline Endpoints](#medical-timeline-endpoints)
4. [QR Passport Endpoints](#qr-passport-endpoints)
5. [AI Analysis Endpoints](#ai-analysis-endpoints)
6. [Privacy Proof Endpoints](#privacy-proof-endpoints)
7. [Insurance Claim Endpoints](#insurance-claim-endpoints)
8. [Research Marketplace Endpoints](#research-marketplace-endpoints)
9. [Error Responses](#error-responses)
10. [Status Codes](#status-codes)

---

## Core Medical Report Endpoints

### Upload Medical Report

**Endpoint:** `POST /upload`

**Description:** Upload and register a medical report to IPFS and blockchain

**Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

patientId: string (required)
file: binary (required, PDF/image)
doctorId: string (optional)
description: string (optional)
```

**Response:**
```json
{
  "success": true,
  "hash": "sha256_hex_hash",
  "ipfsHash": "QmXxxx...",
  "aiSummary": {
    "diagnosis": "string",
    "findings": "string",
    "recommendations": "string"
  },
  "blockchainVerified": true,
  "timestamp": 1706400000000
}
```

**Status:** `200 OK` | `400 Bad Request` | `500 Server Error`

---

### Verify Medical Report

**Endpoint:** `POST /verify`

**Description:** Verify authenticity of a medical report by comparing hashes

**Request:**
```json
{
  "patientId": "string (required)",
  "file": "binary (required)"
}
```

**Response:**
```json
{
  "verified": true,
  "hash": "sha256_hex_hash",
  "blockchainHash": "sha256_hex_hash",
  "match": true,
  "message": "Report is authentic and verified on blockchain"
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

## Patient Identity Endpoints

### Register Patient Identity

**Endpoint:** `POST /identity/register`

**Description:** Create a new patient identity with medical information

**Request:**
```json
{
  "patientId": "string (required)",
  "bloodType": "A|B|AB|O (required)",
  "allergies": ["string"],
  "medications": ["string"],
  "emergencyContact": {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "patientId": "P-12345",
  "bloodType": "A+",
  "allergies": ["Penicillin", "Shellfish"],
  "registeredAt": 1706400000000,
  "blockchainVerified": true
}
```

**Status:** `201 Created` | `400 Bad Request` | `409 Conflict`

---

### Get Patient Identity

**Endpoint:** `GET /identity/:patientId`

**Description:** Retrieve patient identity information

**Response:**
```json
{
  "patientId": "P-12345",
  "bloodType": "A+",
  "allergies": ["Penicillin"],
  "medications": ["Aspirin"],
  "emergencyContact": { "name": "John Doe", "phone": "555-1234" },
  "createdAt": 1706400000000,
  "updatedAt": 1706410000000
}
```

**Status:** `200 OK` | `404 Not Found`

---

### Update Patient Identity

**Endpoint:** `PUT /identity/:patientId`

**Description:** Update patient medical information

**Request:**
```json
{
  "allergies": ["Penicillin", "Ibuprofen"],
  "medications": ["Aspirin", "Metformin"]
}
```

**Response:**
```json
{
  "success": true,
  "patientId": "P-12345",
  "updatedFields": ["allergies", "medications"],
  "updatedAt": 1706410000000
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

## Medical Timeline Endpoints

### Add Timeline Event

**Endpoint:** `POST /timeline/add`

**Description:** Record a medical event to patient's health timeline

**Request:**
```json
{
  "patientId": "string (required)",
  "eventType": "diagnosis|treatment|test|vaccination|surgery (required)",
  "description": "string (required)",
  "date": "ISO8601 date (required)",
  "provider": "string (hospital/doctor name)",
  "documentHash": "sha256 hash (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "evt-12345",
  "patientId": "P-12345",
  "eventType": "vaccination",
  "date": "2026-03-16T00:00:00Z",
  "recordedAt": 1706400000000,
  "blockchainVerified": true
}
```

**Status:** `201 Created` | `400 Bad Request` | `404 Not Found`

---

### Get Patient Timeline

**Endpoint:** `GET /timeline/:patientId`

**Description:** Retrieve complete medical timeline for patient

**Query Parameters:**
```
limit: integer (default: 50)
offset: integer (default: 0)
eventType: string (optional, filter by type)
```

**Response:**
```json
{
  "patientId": "P-12345",
  "events": [
    {
      "eventId": "evt-12345",
      "eventType": "vaccination",
      "description": "COVID-19 Booster",
      "date": "2025-06-15T00:00:00Z",
      "provider": "City Hospital",
      "recordedAt": 1706400000000
    }
  ],
  "total": 23,
  "limit": 50,
  "offset": 0
}
```

**Status:** `200 OK` | `404 Not Found`

---

### Get Timeline by Date Range

**Endpoint:** `GET /timeline/:patientId/range`

**Description:** Retrieve medical events within a date range

**Query Parameters:**
```
startDate: ISO8601 date (required)
endDate: ISO8601 date (required)
```

**Response:**
```json
{
  "patientId": "P-12345",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2026-03-16T00:00:00Z",
  "events": [
    {
      "eventId": "evt-12345",
      "eventType": "diagnosis",
      "description": "Type 2 Diabetes",
      "date": "2025-01-20T00:00:00Z"
    }
  ],
  "total": 5
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

## QR Passport Endpoints

### Generate QR Health Passport

**Endpoint:** `POST /qr/generate`

**Description:** Generate QR code containing patient's emergency medical information

**Request:**
```json
{
  "patientId": "string (required)",
  "includeConditions": boolean (default: true),
  "includeAllergies": boolean (default: true),
  "includeMedications": boolean (default: true)
}
```

**Response:**
```json
{
  "success": true,
  "patientId": "P-12345",
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "qrData": {
    "patientId": "P-12345",
    "bloodType": "A+",
    "allergies": ["Penicillin"],
    "emergencyContact": { "name": "John Doe", "phone": "555-1234" }
  },
  "expiresAt": 1707600000000
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### Generate Emergency Passport

**Endpoint:** `POST /qr/emergency`

**Description:** Generate emergency-only minimal QR passport (less data than full passport)

**Request:**
```json
{
  "patientId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "patientId": "P-12345",
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "qrData": {
    "bloodType": "A+",
    "allergies": ["Penicillin"],
    "emergencyContact": "555-0123"
  },
  "minimized": true
}
```

**Status:** `200 OK` | `404 Not Found`

---

## AI Analysis Endpoints

### Summarize Medical Report

**Endpoint:** `POST /summarize`

**Description:** Use AI to generate human-readable summary of medical report

**Request:**
```multipart/form-data
file: binary (PDF or image)
reportType: string (optional - lab, imaging, pathology, etc)
language: string (default: en)
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "diagnosis": "Type 2 Diabetes Mellitus",
    "keyReadings": [
      { "metric": "HbA1c", "value": "8.2%", "status": "elevated" },
      { "metric": "Fasting Glucose", "value": "145 mg/dL", "status": "elevated" }
    ],
    "findings": "Patient shows elevated glucose levels indicating poor glycemic control",
    "recommendations": [
      "Increase daily exercise to 30 minutes",
      "Follow strict dietary recommendations",
      "Start Metformin 500mg twice daily",
      "Schedule follow-up in 6 weeks"
    ],
    "urgencyLevel": "moderate",
    "nextSteps": "Follow-up appointment with endocrinologist"
  },
  "confidence": 0.92,
  "processingTime": 2345
}
```

**Status:** `200 OK` | `400 Bad Request` | `422 Unprocessable Entity`

---

## Privacy Proof Endpoints

### Generate Privacy Proof

**Endpoint:** `POST /privacy/proof/generate`

**Description:** Create a cryptographic proof of medical status without exposing full record

**Request:**
```json
{
  "patientId": "string (required)",
  "proofType": "vaccination|checkup|health-status (required)",
  "expiryDays": 90
}
```

**Response:**
```json
{
  "success": true,
  "proof": {
    "proofId": "prf-12345",
    "patientId": "P-12345",
    "proofType": "vaccination",
    "proven": true,
    "createdAt": 1706400000000,
    "expiry": 1714176000000,
    "hash": "sha256_hash",
    "signature": "digital_signature"
  }
}
```

**Status:** `201 Created` | `400 Bad Request` | `404 Not Found`

---

### Verify Privacy Proof

**Endpoint:** `GET /privacy/proof/:proofId/verify`

**Description:** Verify authenticity of a privacy proof (third-party verification)

**Response:**
```json
{
  "valid": true,
  "result": {
    "proofId": "prf-12345",
    "proofType": "vaccination",
    "proven": true,
    "expiryDate": "2026-06-14T00:00:00Z",
    "isExpired": false,
    "verifiedAt": 1706400000000
  }
}
```

**Status:** `200 OK` | `404 Not Found` | `401 Unauthorized`

---

### List Patient Privacy Proofs

**Endpoint:** `GET /privacy/proofs/:patientId`

**Description:** Retrieve all active privacy proofs for a patient

**Response:**
```json
{
  "patientId": "P-12345",
  "proofs": [
    {
      "proofId": "prf-12345",
      "proofType": "vaccination",
      "createdAt": 1706400000000,
      "expiry": 1714176000000,
      "isActive": true
    }
  ],
  "total": 3,
  "activeCount": 2
}
```

**Status:** `200 OK` | `404 Not Found`

---

## Insurance Claim Endpoints

### Create Insurance Claim

**Endpoint:** `POST /insurance/claim/create`

**Description:** Register a new insurance claim for medical treatment

**Request:**
```json
{
  "patientId": "string (required)",
  "insuranceProvider": "string (required)",
  "treatmentType": "string (required)",
  "amount": number (required),
  "medicalReportHash": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "claimId": "clm-12345",
    "patientId": "P-12345",
    "insuranceProvider": "BlueCross",
    "treatmentType": "Surgery",
    "amount": 50000,
    "status": "pending",
    "createdAt": 1706400000000
  }
}
```

**Status:** `201 Created` | `400 Bad Request` | `404 Not Found`

---

### Verify Insurance Claim

**Endpoint:** `POST /insurance/claim/verify`

**Description:** Verify claim with attached medical proof from blockchain

**Request:**
```json
{
  "claimId": "string (required)",
  "medicalProofHash": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "claimId": "clm-12345",
    "status": "verified",
    "medicalProofVerified": true,
    "verifiedAt": 1706400000000
  }
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### Approve Insurance Claim

**Endpoint:** `POST /insurance/claim/approve`

**Description:** Approve verified claim and initiate payment

**Request:**
```json
{
  "claimId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "claim": {
    "claimId": "clm-12345",
    "status": "approved",
    "approved": true,
    "approvedAt": 1706400000000,
    "message": "payment initiated"
  }
}
```

**Status:** `200 OK` | `400 Bad Request` | `404 Not Found`

---

### Get Claim Details

**Endpoint:** `GET /insurance/claim/:claimId`

**Description:** Retrieve detailed information about a specific claim

**Response:**
```json
{
  "claimId": "clm-12345",
  "patientId": "P-12345",
  "insuranceProvider": "BlueCross",
  "status": "approved",
  "amount": 50000,
  "medicalProofVerified": true,
  "createdAt": 1706400000000,
  "verifiedAt": 1706400300000,
  "approvedAt": 1706400600000
}
```

**Status:** `200 OK` | `404 Not Found`

---

### Get Patient Claims

**Endpoint:** `GET /insurance/claims/:patientId`

**Description:** List all claims for a patient

**Query Parameters:**
```
status: pending|verified|approved|rejected (optional)
limit: integer (default: 50)
```

**Response:**
```json
{
  "patientId": "P-12345",
  "claims": [
    {
      "claimId": "clm-12345",
      "status": "approved",
      "amount": 50000,
      "treatmentType": "Surgery",
      "createdAt": 1706400000000
    }
  ],
  "total": 5,
  "byStatus": {
    "pending": 1,
    "verified": 1,
    "approved": 3
  }
}
```

**Status:** `200 OK` | `404 Not Found`

---

## Research Marketplace Endpoints

### List Active Research Studies

**Endpoint:** `GET /research/studies`

**Description:** Browse all active research studies accepting participants

**Query Parameters:**
```
status: active|completed (default: active)
limit: integer (default: 20)
offset: integer (default: 0)
```

**Response:**
```json
{
  "studies": [
    {
      "studyId": "std-12345",
      "title": "Diabetes Management Outcomes Study",
      "description": "Long-term study on diabetes management techniques",
      "institution": "Harvard Medical School",
      "dataTypes": ["glucose_levels", "medication_compliance"],
      "participantsCount": 342,
      "status": "active",
      "createdAt": 1706400000000
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

**Status:** `200 OK`

---

### Get Study Details

**Endpoint:** `GET /research/studies/:studyId`

**Description:** Retrieve detailed information about a research study

**Response:**
```json
{
  "studyId": "std-12345",
  "title": "Diabetes Management Outcomes Study",
  "description": "Comprehensive study analyzing...",
  "institution": "Harvard Medical School",
  "principal_investigator": "Dr. Jane Smith",
  "dataTypes": ["glucose_levels", "medication_compliance", "lifestyle_factors"],
  "participantsCount": 342,
  "requiredParticipants": 500,
  "duration": "36 months",
  "compensation": "Yes",
  "status": "active"
}
```

**Status:** `200 OK` | `404 Not Found`

---

### Grant Research Consent

**Endpoint:** `POST /research/consent/grant`

**Description:** Patient grants consent to share medical data with research study

**Request:**
```json
{
  "patientId": "string (required)",
  "studyId": "string (required)",
  "anonymized": boolean (default: true)
}
```

**Response:**
```json
{
  "success": true,
  "consent": {
    "consentId": "cns-12345",
    "patientId": "P-12345",
    "studyId": "std-12345",
    "anonymized": true,
    "status": "active",
    "grantedAt": 1706400000000
  }
}
```

**Status:** `201 Created` | `400 Bad Request` | `404 Not Found`

---

### Get Patient Research Consents

**Endpoint:** `GET /research/consents/:patientId`

**Description:** List all active research consents for a patient

**Response:**
```json
{
  "patientId": "P-12345",
  "consents": [
    {
      "consentId": "cns-12345",
      "studyId": "std-12345",
      "studyTitle": "Diabetes Management Study",
      "anonymized": true,
      "status": "active",
      "grantedAt": 1706400000000
    }
  ],
  "total": 3,
  "activeConsents": 2
}
```

**Status:** `200 OK` | `404 Not Found`

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context (optional)",
    "timestamp": 1706400000000
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Missing or invalid request parameters |
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Resource already exists (duplicate) |
| `VALIDATION_ERROR` | 422 | Request data failed validation |
| `FILE_TOO_LARGE` | 413 | Uploaded file exceeds size limit (10MB) |
| `IPFS_ERROR` | 500 | Distributed storage operation failed |
| `BLOCKCHAIN_ERROR` | 500 | Blockchain verification failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK - Request succeeded |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request parameters |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Permission denied |
| `404` | Not Found - Resource does not exist |
| `409` | Conflict - Resource already exists |
| `413` | Payload Too Large - File exceeds limit |
| `422` | Unprocessable Entity - Validation failed |
| `500` | Internal Server Error - Server error |
| `503` | Service Unavailable - Server temporarily down |

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per API key
- **File uploads:** 10 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1706400060
```

---

## Authentication

### API Key Authentication (Coming Soon)

```http
GET /api/identity/P-12345
Authorization: Bearer your_api_key_here
```

### JWT Authentication (Planned)

Future versions will support JWT tokens for web3 wallet authentication.

---

## Example Workflow

### Complete Medical Report Verification Flow

```bash
# 1. Register patient identity
POST /api/identity/register
{
  "patientId": "P-12345",
  "bloodType": "A+",
  "allergies": ["Penicillin"]
}

# 2. Upload medical report
POST /api/upload
(multipart form-data with file)

# 3. Add to timeline
POST /api/timeline/add
{
  "patientId": "P-12345",
  "eventType": "diagnosis",
  "description": "Type 2 Diabetes",
  "date": "2026-03-16"
}

# 4. Generate privacy proof
POST /api/privacy/proof/generate
{
  "patientId": "P-12345",
  "proofType": "health-status"
}

# 5. Create insurance claim
POST /api/insurance/claim/create
{
  "patientId": "P-12345",
  "insuranceProvider": "BlueCross",
  "treatmentType": "Medication",
  "amount": 5000
}

# 6. Verify claim
POST /api/insurance/claim/verify
{
  "claimId": "clm-12345",
  "medicalProofHash": "hash_from_file"
}

# 7. Approve claim
POST /api/insurance/claim/approve
{
  "claimId": "clm-12345"
}
```

---

## Support & Issues

For issues, questions, or feature requests:

- **GitHub Issues:** https://github.com/stellar-connect-wallet/medproof/issues
- **Documentation:** https://medproof.dev/docs
- **Email:** support@medproof.dev

---

**Last Updated:** March 16, 2026
**API Version:** 1.0.0
