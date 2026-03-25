# Medical Report Web3 App

A decentralized, privacy-first medical record management system designed for the Stellar Soroban network.

## 🚀 Live Demo

[Live Application Demo](https://medicalreport-peach.vercel.app/)

## 📱 Mobile Responsive View

![Mobile Responsive UI](assets/image.png)

## ⚙️ CI/CD Pipeline

[![CI/CD Pipeline](https://github.com/xaden1/medicalreport_1/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/xaden1/medicalreport_1/actions/workflows/ci-cd.yaml)

## ⛓️ Smart Contract Details

- **Testnet Contract ID:** (Configured via Freighter Wallet Interactions)
- **Transaction Hash:** Tracked via Freighter upon interaction.
- **Inter-contract calls:** N/A for this implementation's scope.
- **Custom Tokens / Pools:** N/A for this implementation's scope.

## 💻 Tech Stack

- **Frontend:** React, Tailwind CSS, `stellar-sdk`, `freighter-api`
- **Smart Contract:** Rust (Stellar Soroban)
- **Network:** Stellar Testnet

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Rust & Soroban CLI
- Freighter Wallet Extension

### Local Setup
1. Clone the repository
2. Run `npm install` in the `/frontend` directory
3. Launch via `npm start`
4. Deploy local contracts according to `contracts` documentation (if running local RPC).