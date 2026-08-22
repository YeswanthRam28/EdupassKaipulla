# EduPass — Privacy-Preserving Decentralized Academic Passport & Verification Ecosystem

> *"Don't send your transcript. Prove it."*

**EduPass** is a privacy-first, decentralized academic credential, AI mobility, and verifiable career ecosystem. By leveraging **EVM smart contracts**, **Neon PostgreSQL**, **Groq Llama 8B AI**, **FIDO2 WebAuthn Passkeys**, **AES-256 encrypted payload storage**, and **Groth16 Zero-Knowledge (ZK) selective disclosure proofs**, EduPass enables students to prove academic qualifications ($\text{CGPA} \ge 8.5$, total degree credits, accredited status) to universities, employers, and immigration verifiers **without revealing raw grades, transcript details, or personal identities**.

---

## 🌟 System Highlights & Key Features

* 🎓 **Student Academic Passport Hub (`/student/dashboard`)**: Student-owned portable collection of institutionally signed credentials (Degrees, Semester Marksheets, TCs, Provisional Certs, Skill Badges, Work Experience, Internship Certs) with assigned **Student ID** (`EDU-2026-XXXX`) and **Mobile Access Key** (`EDUPASS-KEY-XXXX`).
* 🤖 **AI Mobility Agent & Requirement Extractor (`/ai-agent`)**: Powered by **Groq Llama 8B** (`llama-3.1-8b-instant`). Features conversational AI admissions advising, smart requirement extraction from raw admission text, credential gap analysis, and automated ZK proof claim planning.
* 🌐 **Global Academic Mobility Hub (`/mobility`)**: Converts grades and credit units across international frameworks (Indian 10.0 CGPA $\leftrightarrow$ US 4.0 GPA $\leftrightarrow$ German Bavarian 1.0–5.0 Scale $\leftrightarrow$ European ECTS $\leftrightarrow$ UK Honors) and exports verifiable international equivalence certificates.
* 📄 **Verifiable Resume & Skill Evidence Graph (`/student/resume` & `/resume/share`)**: Automatically compiles academic transcripts and work certificates into an interactive resume backed by an automated **Skill Evidence Graph**, assigned **Resume ID** (`RES-2026-XXXX`), and direct transmit to **Recruiter IDs** (`REC-2026-XXXX`).
* 🔒 **Security Center & FIDO2 Passkeys Hub (`/security`)**: WebAuthn passkey registration (`navigator.credentials.create`), TouchID/Windows Hello biometric binding, trusted device session manager, and real-time fraud risk score monitor (`0-100`).
* 📱 **Mobile Key Auth & Android Biometric Integration (`/auth/mobile-verify-key`)**: Dedicated mobile authentication endpoint pairing User ID + Unique Mobile Key + Backend API verification + native Android fingerprint/face unlock.
* ⚡ **Zero-Knowledge Proof Studio (`/zk-studio`)**: Mathematical ZK proof generator (`lib/zk/zkEngine.ts`) enabling selective disclosure claims (`MIN_CGPA`, `MIN_CREDITS`, `DEGREE_VERIFIED`) with exportable JSON proof packages (`0xzk_...`).
* 🏢 **Institution Governance & Issuance Suite (`/institution/dashboard` & `/issue`)**: Multi-tab dashboard for accredited universities to issue credentials, auto-sync registered universities, view student rosters, manage revocations, and audit issuance logs.
* 💼 **Employer & Recruiter Portal (`/employer/dashboard`)**: Recruiter ID assignment (`REC-2026-XXXX`), work credential issuance (`WORK_EXPERIENCE`, `INTERNSHIP_CERTIFICATE`), access request generator, and candidate resume inbox.
* 🛡️ **Public Verifier Portal (`/verify`)**: Individual verification cards for Degrees, Marksheets, TCs, Provisional Certs, Skill Badges, Verifiable Resumes by Resume ID, and Groth16 ZK proof packages.
* ⛓️ **Web3 & EVM Blockchain Integration**: Wagmi + Viem MetaMask integration connected to `CredentialRegistry.sol` smart contract caller with hard-capped gas optimization (~0.0001 SHM) on Shardeum EVM Testnet, Ethereum Sepolia, and Polygon Amoy.

---

## 🏗️ Architecture & Technical Stack

```
   INSTITUTION / EMPLOYER (Issuer)          STUDENT (Passport Holder)              VERIFIER / RECRUITER
  ┌────────────────────────┐               ┌────────────────────────┐            ┌────────────────────────┐
  │ Multi-Type Credential  │               │ Verifiable Resume &    │            │ Verify Commitment Hash │
  │ & SHA-256 Commitments  │               │ Skill Evidence Graph   │            │ & ZK Proof Package     │
  └───────────┬────────────┘               └───────────┬────────────┘            └───────────┬────────────┘
              │                                        │                                     │
              ▼                                        ▼                                     ▼
  ┌────────────────────────┐               ┌────────────────────────┐            ┌────────────────────────┐
  │ Neon PostgreSQL DB     │ ◄─────────────┤ Groq Llama 8B AI Agent │ ──────────►│ Public Verifier Portal │
  │ Encrypted Payloads     │               │ & Global Mobility Hub  │            │ (/verify)              │
  └───────────┬────────────┘               └────────────────────────┘            └────────────────────────┘
              │
              ▼
  ┌────────────────────────────────────────────────────────┐
  │ EVM Blockchain (CredentialRegistry.sol)               │
  │ Stored: credentialId, issuer, commitment, issuedAt     │
  └────────────────────────────────────────────────────────┘
```

### 💻 Stack Overview

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind CSS v4, Lucide Icons, Anton & Archivo fonts.
* **Backend API**: Python 3.13, FastAPI, Pydantic V2, Pytest test suite (14 passing tests, 100% pass rate).
* **Database**: **Neon PostgreSQL Cloud Database** (`psycopg2`, SQLAlchemy ORM).
* **AI & LLM**: **Groq API** (`llama-3.1-8b-instant` / `llama3-8b-8192`).
* **Web3 / EVM**: `wagmi`, `viem`, Solidity `0.8.24`, Shardeum EVM Testnet (Chain ID 8082), Sepolia, Polygon Amoy.
* **Security & Auth**: WebAuthn FIDO2 Passkeys, Mobile Access Keys, AES-256 payload encryption, SHA-256 zero-knowledge commitment hashes, JWT bearer tokens, bcrypt password hashing.

---

## 🚀 Quick Start Guide

### 1. Repository Setup
```bash
git clone https://github.com/YeswanthRam28/EdupassKaipulla.git
cd EdupassKaipulla
npm install
```

### 2. Backend Setup & Pytest Execution
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Run Pytest suite
python -m pytest tests/test_auth.py
```

### 3. Launch Development Servers

**Start FastAPI Backend (Port 8000)**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Start Next.js Frontend (Port 3000)**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Application Routes

| Route | Purpose |
|---|---|
| `/` | Landing Page & Public Overview |
| `/login` | Account Login (Web3 Wallet & Password Auth) |
| `/register` | Public Account Registration (Student, Institution, Employer, Verifier) |
| `/onboarding` | Web3 Wallet Onboarding & Auto ID Assignment |
| `/student/dashboard` | Student Academic Passport Hub & Mobile Access Key Widget |
| `/ai-agent` | AI Mobility Agent Studio (Groq Llama 8B Chat, Requirement Extractor & ZK Planner) |
| `/mobility` | Global Academic Mobility & Cross-Border Grade Normalization Hub |
| `/student/resume` | Verifiable Resume Generator & Skill Evidence Graph |
| `/resume/share` | Public Recruiter Verifiable Candidate Resume Verification Page |
| `/security` | Security Center, FIDO2 Passkeys, Trusted Devices & Fraud Risk Monitor |
| `/zk-studio` | Zero-Knowledge Proof Studio (Selective Disclosure Proof Generator) |
| `/student/consent` | Student Privacy Firewall & Time-Bound Consent Manager |
| `/institution/dashboard` | University Issuance Portal, Multi-Type Issuance Suite & Student Rosters |
| `/verify` | Public Credential Hash, Verifiable Resume & ZK Proof Package Verification Portal |
| `/employer/dashboard` | Recruiter Dashboard, Work Credentials & Access Requests Tracker |
| `/admin/dashboard` | Admin Governance Console, System Health Telemetry & Accreditation Manager |

---

## 🔒 Security & Privacy Compliance

- **Zero PII On-Chain**: No personal student information (names, grades, addresses) touches the public blockchain.
- **DPDPA / GDPR Compliance**: Raw transcripts remain in encrypted off-chain storage.
- **Tamper Evident Architecture**: Hashes of off-chain payloads must strictly match the on-chain SHA-256 commitment.
- **Revocation Lifecycle**: Institutions maintain authority to revoke credentials, instantly updating DB status and displaying warning badges on the verifier portal.

---

## 📜 License
MIT License — EduPass Team
