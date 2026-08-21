# EduPass — Privacy-Preserving Academic Passport

> *"Don't send your transcript. Prove it."*

**EduPass** transforms traditional academic records into student-owned, programmable, and cryptographically verifiable credentials. By leveraging EVM smart contracts, off-chain data encryption, and zero-knowledge (ZK) eligibility proofs, EduPass allows students to prove their qualifications (e.g., $\text{CGPA} \ge 8.0$, completed coursework) to universities, employers, and embassies **without revealing raw grades or full transcripts**.

---

## 🌟 Key Features

* 🔐 **Student-Owned Academic Passport**: Portable collection of institutionally signed credentials (Degrees, Semester Transcripts, Credits, Verified Badges).
* ⛓️ **EVM Credential Trust Layer**: `CredentialRegistry.sol` smart contract anchors credential IDs, issuer wallet addresses, Keccak-256 commitments, and active/revocation statuses on-chain. **Zero PII touches the blockchain.**
* 🏢 **Institution Issuance Portal (`/issue`)**: Dashboard for accredited institutions to issue credentials, generate off-chain JSON payloads, and broadcast cryptographic commitments on-chain.
* 🔎 **Public Verification Portal (`/verify`)**: Instant verification portal for verifiers to check credential status and verify off-chain payload hash integrity without contacting the issuing university.
* 🛡️ **Selective Disclosure & ZK Proof Engine**: Mask exact grades while generating verifiable eligibility proofs for target admission/job requirements.

---

## 🏗️ Architecture & Tech Stack

```
   INSTITUTION (Issuer)                     STUDENT / VERIFIER
  ┌────────────────────┐                  ┌──────────────────┐
  │ Issue Credential   │                  │  Verify / View   │
  └─────────┬──────────┘                  └────────┬─────────┘
            │                                      │
            ▼                                      ▼
  ┌────────────────────┐                  ┌──────────────────┐
  │ Compute Commitment │                  │ Read Contract    │
  │ (Keccak-256 Hash)  │                  │ getCredential()  │
  └─────────┬──────────┘                  └────────┬─────────┘
            │                                      │
            ▼                                      ▼
  ┌────────────────────┐                  ┌──────────────────┐
  │ MetaMask Signature │                  │ Compare Hashes   │
  │ registerCredential │                  │ VALID / REVOKED  │
  └─────────┬──────────┘                  └──────────────────┘
            │
            ▼
  ┌────────────────────────────────────────────────────────┐
  │ EVM Blockchain (CredentialRegistry.sol)               │
  │ Stored: credentialId, issuer, commitment, issuedAt     │
  └────────────────────────────────────────────────────────┘
```

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind CSS v4, Motion (`motion/react`)
* **Web3 Integration**: `wagmi`, `viem`, `@tanstack/react-query`, MetaMask Connector
* **Smart Contracts**: Solidity `0.8.24`, Hardhat, Foundry (`forge` / `anvil`)
* **AI Integration**: `@google/genai` (Google Gemini SDK ready for AI Mobility Agent requirement parsing)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` & `npm`
- [MetaMask](https://metamask.io) browser extension installed

### 2. Installation
```bash
git clone https://github.com/YeswanthRam28/EdupassKaipulla.git
cd EdupassKaipulla
npm install
```

### 3. Smart Contract Compilation
```bash
npx hardhat compile
```

### 4. Running Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Routes & Navigation

| Route | Purpose |
|---|---|
| `/` | Landing Page & Brand Overview |
| `/issue` | Institution Credential Issuance Portal |
| `/verify` | Public Credential Verification Portal |
| `/passport` | Student Academic Passport Dashboard |

---

## 🔒 Privacy & Compliance Design

- **DPDPA / GDPR Compliance**: All personal identifiable information (PII) and transcripts remain stored safely off-chain in encrypted student storage.
- **Tamper Detection**: Hashes of off-chain payloads must strictly match the on-chain Keccak-256 commitment.
- **Revocation Lifecycle**: Issuers maintain on-chain authority to revoke credentials in case of fraud or administrative correction.

---

## 📜 License
MIT License
