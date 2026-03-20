# Step 11 – Dark Academia UI System

The frontend must implement a **dark-academia inspired interface** that makes the platform feel like a **secure digital medical archive or cryptographic research vault**, rather than a generic Web3 dashboard.

The visual tone should be:

* elegant
* intellectual
* archival
* minimal
* professional

Avoid:

* neon colors
* bright gradients
* playful UI
* cartoon components

The application should feel like **a university research archive for verified medical records**.

---

# Tailwind Dark Academia Theme

Create a custom Tailwind theme.

### Colors

Background
`#121212`

Panel
`#1c1c1c`

Primary Text
`#e8e4dc`

Secondary Text
`#a7a094`

Accent Gold
`#b89b5e`

Bronze
`#8c7853`

Borders should be **soft and muted**.

Use subtle shadows and thin separators.

---

# Typography

Use fonts that evoke **academic journals and historical research texts**.

Headings
Playfair Display

Body
Inter

Monospace (for hashes / blockchain IDs)
JetBrains Mono

Example usage:

Report Hash
Transaction ID
Wallet Address

These should use the **monospace font**.

---

# Application Layout

The interface should resemble a **research archive system**.

## Sidebar (Left)

Permanent vertical navigation like a **library index**.

Sections:

Dashboard
Medical Archive
Upload Report
Verify Report
Patient Timeline
Research Data
Wallet

Icons should be **minimal line icons**.

---

# Top Navigation Bar

Shows Web3 identity.

Example display:

Wallet
GABX...92JH

Network
Stellar Testnet

Role
Doctor / Patient

---

# Main Content Area

The center panel acts like a **document archive viewer**.

Records appear as **archival catalog cards**.

Each medical report card displays:

Patient ID
Report Type
Doctor
Date
Blockchain Verification Status

Verification badges should resemble **authentication seals**.

---

# Landing Page (Important for Judges)

Create a dramatic introduction.

Headline:

**Decentralized Medical Archive**

Subtitle:

“Verifiable medical records secured by cryptography and patient ownership.”

Include:

* Connect Wallet button
* Feature overview
* Blockchain verification explanation
* Demo preview

The landing page should immediately communicate:

**Healthcare + Blockchain + Ownership + Verification**

---

# Key Application Pages

## Dashboard

Overview of system activity.

Sections:

Recent Reports
Verification Activity
Blockchain Transactions
Patient Records

Display entries like **research catalog records**.

---

## Upload Medical Report

Components:

Drag and drop upload
Metadata form
Submit button

After upload show:

Transaction Hash
Blockchain Confirmation
Verification Status

---

## Verify Medical Report

User uploads a report.

System calculates file hash and compares with blockchain record.

Display result as a **formal verification certificate**.

Authentic
or
Tampered

---

## Patient Medical Timeline

Chronological record of medical history.

Example:

2022 — Blood Test
2023 — MRI Scan
2024 — Diabetes Diagnosis

Each entry shows:

Doctor
Report Hash
Verification Status

---

# Web3 Medical Vault Concept

The interface should resemble a **secure digital vault of verified medical knowledge**.

Reports should appear like:

sealed records
archived research documents
cryptographically authenticated files

Verification badges should resemble **institutional seals**.

Hover effects should be subtle:

* gold underline
* faint glow
* smooth fade

Avoid flashy animations.

---

# React Frontend Structure

Recommended folder structure.

```
frontend
│
├── src
│
├── components
│   ├── Sidebar
│   ├── Navbar
│   ├── WalletStatus
│   ├── ArchiveCard
│   ├── UploadDropzone
│   ├── VerificationBadge
│   └── Timeline
│
├── pages
│   ├── Dashboard
│   ├── UploadReport
│   ├── VerifyReport
│   └── PatientArchive
│
├── services
│   ├── stellarService
│   ├── walletService
│   └── contractService
```

---

# Hackathon Demo Flow

When judges open the app:

1. Landing page loads
2. User connects wallet
3. Doctor uploads report
4. Wallet signs blockchain transaction
5. Smart contract stores report hash
6. Patient verifies authenticity
7. Timeline updates

The experience should clearly demonstrate **real-world healthcare blockchain utility**.

---

# Final Design Philosophy

The application should feel like:

**A cryptographically secured medical archive maintained by scholars of digital health records.**

Users should feel they are accessing **verified medical knowledge**, not just browsing a web dashboard.
