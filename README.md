# EduPass — Privacy-Preserving Decentralized Academic Passport & Verification Ecosystem

> *"Don't send your transcript. Prove it."*

**EduPass** is a privacy-first, decentralized academic credential and mobility ecosystem. By leveraging **EVM smart contracts**, **Neon PostgreSQL**, **AES-256 encrypted payload storage**, and **Groth16 Zero-Knowledge (ZK) selective disclosure proofs**, EduPass enables students to prove academic qualifications ($\text{CGPA} \ge 8.5$, total degree credits, accredited status) to universities, employers, and immigration verifiers **without revealing raw grades, transcript details, or personal identities**.

---

## 🌟 System Highlights & Key Features

* 🎓 **Student Academic Passport Hub (`/student/dashboard`)**: Student-owned portable collection of institutionally signed credentials (Degrees, Transcripts, Credits, CGPA).
* ⚡ **Zero-Knowledge Proof Studio (`/zk-studio`)**: Mathematical ZK proof generator (`lib/zk/zkEngine.ts`) enabling selective disclosure claims (`MIN_CGPA`, `MIN_CREDITS`, `DEGREE_VERIFIED`) with exportable JSON proof packages (`0xzk_...`).
* 🔒 **Zero-Trust Credential Firewall & Student Consent Portal (`/student/consent`)**: Issue time-bound consent access tokens for employers and universities with one-click revocation.
* 🏢 **Institution Governance Dashboard (`/institution/dashboard`)**: Multi-tab dashboard for accredited universities to issue credentials, view registered student rosters, manage credential revocations, and audit issuance logs.
* 🛡️ **Public Verifier Portal (`/verify`)**: Dual-tab verification portal supporting cryptographic commitment hash matching and Groth16 ZK proof verification.
* 🌐 **Admin Governance & System Telemetry (`/admin/dashboard`)**: Live system health metrics (`GET /system/health`), database connection monitoring, and university accreditation manager.
* ⛓️ **Web3 & EVM Blockchain Integration**: Wagmi + Viem MetaMask integration connected to `CredentialRegistry.sol` smart contract caller supporting Ethereum Sepolia & Polygon Amoy testnets.
* 📱 **Android Biometric Authentication Trigger**: Native Android app (`/biometric`) running an HTTP trigger server (`:8080`) for biometric holder binding.

---

## 🏗️ Architecture & Technical Stack

```
   INSTITUTION (Issuer)                     STUDENT (Passport Holder)              VERIFIER / EMPLOYER
  ┌────────────────────┐                   ┌────────────────────────┐            ┌────────────────────────┐
  │ Issue Credential   │                   │ Generate ZK Proof      │            │ Verify Commitment Hash │
  │ & SHA-256 Hash     │                   │ (Selective Disclosure) │            │ & ZK Proof Package     │
  └─────────┬──────────┘                   └───────────┬────────────┘            └───────────┬────────────┘
            │                                          │                                     │
            ▼                                          ▼                                     ▼
  ┌────────────────────┐                   ┌────────────────────────┐            ┌────────────────────────┐
  │ Neon PostgreSQL DB │ ◄─────────────────┤ Student Consent Tokens │ ──────────►│ Public Verifier Portal │
  │ Encrypted Payload  │                   │ Time-Bound Grants      │            │ (/verify)              │
  └─────────┬──────────┘                   └────────────────────────┘            └────────────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ EVM Blockchain (CredentialRegistry.sol)               │
  │ Stored: credentialId, issuer, commitment, issuedAt     │
  └────────────────────────────────────────────────────────┘
```

### 💻 Stack Overview

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind CSS v4, Lucide Icons, Anton & Archivo fonts.
* **Backend API**: Python 3.13, FastAPI, Pydantic V2, Pytest test suite (14 passing tests).
* **Database**: **Neon PostgreSQL Cloud Database** (`psycopg2`, SQLAlchemy ORM).
* **Web3 / EVM**: `wagmi`, `viem`, Solidity `0.8.24`, Hardhat, Sepolia / Polygon Amoy testnet RPCs.
* **Security & Privacy**: AES-256 payload encryption, SHA-256 zero-knowledge commitment hashes, JWT bearer tokens, bcrypt password hashing.
* **Mobile**: Native Android (Kotlin, Jetpack Compose, Biometric Prompt API, embedded Ktor HTTP server).

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
uvicorn app.main:app --reload --port 8000
```

**Start Next.js Frontend (Port 3000)**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Application Routes

| Route | Role / Purpose |
|---|---|
| `/` | Landing Page & Public Overview |
| `/login` | Account Login (Email & Password) |
| `/register` | Public Account Registration |
| `/onboarding` | First-Time Web3 Wallet Role Selection & Student ID Assignment |
| `/student/dashboard` | Student Academic Passport Hub & Credential Detail Drawer |
| `/zk-studio` | Zero-Knowledge Proof Studio (Selective Disclosure Proof Generator) |
| `/student/consent` | Student Privacy Firewall & Time-Bound Consent Manager |
| `/institution/dashboard` | University Issuance Portal, Registered Student Roster & Revocation Logs |
| `/verify` | Public Credential Hash & ZK Proof Package Verification Portal |
| `/employer/dashboard` | Employer Verification Portal |
| `/admin/dashboard` | Admin Governance Console, System Health Telemetry & Issuer Accreditation Manager |

---

## 🔒 Security & Privacy Compliance

- **Zero PII On-Chain**: No personal student information (names, grades, addresses) touches the public blockchain.
- **DPDPA / GDPR Compliance**: Raw transcripts remain in encrypted off-chain storage.
- **Tamper Evident Architecture**: Hashes of off-chain payloads must strictly match the on-chain SHA-256 commitment.
- **Revocation Lifecycle**: Institutions maintain authority to revoke credentials, instantly updating DB status and displaying warning badges on the verifier portal.

---

## 📜 License
MIT License — EduPass Team
