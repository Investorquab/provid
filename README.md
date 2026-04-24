# PROVID — Confidential Identity Protocol

> **Prove anything. Reveal nothing.**

Built on [iExec Nox Protocol](https://docs.iex.ec/nox-protocol) · Arbitrum Sepolia · ERC-7984 Confidential Tokens

---

## What Is PROVID?

PROVID is a **confidential Sybil-resistance protocol** for DeFi. It allows any wallet to prove it is a real, verified human — without revealing any personal data, balance, or history.

When you verify with PROVID:
- Your wallet age, ETH balance, and transaction count are **encrypted client-side** via the Nox JS SDK
- Comparisons run inside **Intel TDX Trusted Execution Environments** — even iExec cannot see your data
- You receive a **PROVID Identity Token (ERC-7984)** — a Confidential Token with hidden balance
- Any DeFi protocol can check `hasMinted(wallet)` — getting only a yes/no answer

**Nobody sees your data. Only your eligibility.**

---

## The Problem

DeFi has a Sybil problem. Every airdrop, governance vote, and lending protocol is gamed by:

- Bots creating thousands of wallets
- Farmers manufacturing fake on-chain history
- Whales coordinating attacks on governance
- Front-runners reading public eligibility criteria

The root cause: **everything is public**. When eligibility criteria are visible, they can be gamed.

PROVID solves this by making **the verification itself private**. Criteria stay hidden. Eligibility stays hidden. Only the final answer — qualified or not — is returned.

---

## How It Works

```
USER CONNECTS WALLET
        ↓
PROVID fetches real on-chain data:
  → Wallet age (first transaction timestamp)
  → ETH balance
  → Transaction count
        ↓
Nox JS SDK encrypts all three values client-side
Data never leaves the browser in plaintext
        ↓
IdentityVault.sol stores encrypted handles on-chain
        ↓
CredentialIssuer.sol runs comparisons inside Nox TEE:
  → Is wallet 90+ days old?     → encrypted boolean
  → Does wallet hold ETH?       → encrypted boolean
  → Has wallet sent 3+ txns?    → encrypted boolean
  → All three pass?             → encrypted boolean
        ↓
4 credentials verified. All results are encrypted.
        ↓
ProvidIdentityToken.sol mints ERC-7984 Confidential Token
  → Balance hidden on-chain
  → One per wallet (Sybil resistant)
  → Non-transferable identity credential
        ↓
ANY DEFI PROTOCOL INTEGRATES IN 3 LINES:
  require(provid.hasMinted(msg.sender), "Not verified");
```

---

## Integration Guide

### Smart Contract Integration

Any DeFi protocol adds Sybil resistance in 3 lines:

```solidity
interface IProvid {
    function hasMinted(address wallet) external view returns (bool);
}

contract MyAirdrop {
    // PROVID Identity Token on Arbitrum Sepolia
    IProvid provid = IProvid(0x808eED65Ff29d8b32059424D2B78656ba0E98156);
    
    function claim() external {
        // One line — Sybil resistance powered by Nox TEE
        require(provid.hasMinted(msg.sender), "Get verified at provid.xyz first");
        
        // ... rest of airdrop/lending/governance logic
    }
}
```

### Frontend Integration

```jsx
import { useReadContract } from 'wagmi'

const PROVID_TOKEN = '0x808eED65Ff29d8b32059424D2B78656ba0E98156'
const PROVID_ABI = [{
  name: 'hasMinted',
  type: 'function',
  inputs: [{ name: 'wallet', type: 'address' }],
  outputs: [{ name: '', type: 'bool' }]
}]

function ProvidGate({ address, children, fallback }) {
  const { data: isVerified } = useReadContract({
    address: PROVID_TOKEN,
    abi: PROVID_ABI,
    functionName: 'hasMinted',
    args: [address],
  })

  if (isVerified) return children
  return fallback || (
    <a href="https://provid.xyz">
      Get verified with PROVID →
    </a>
  )
}

// Usage — gate any feature behind PROVID verification
<ProvidGate address={userAddress}>
  <ClaimButton />
</ProvidGate>
```

---

## Deployed Contracts — Arbitrum Sepolia

| Contract | Address | Purpose |
|---|---|---|
| `IdentityVault` | `0xdf434Dd16126BB014d6DffC6017b126A1Ee81A94` | Stores encrypted identity handles via Nox |
| `CredentialIssuer` | `0x5523eF5447aD7F893eaB21c43EC91113675730e5` | Issues encrypted boolean credentials in TEE |
| `ProofVerifier` | `0x49E331a0d518d55cbc98fA75D4eD781fE6a668e2` | Verifies proofs for third-party integrators |
| `ProvidIdentityToken` | `0x808eED65Ff29d8b32059424D2B78656ba0E98156` | ERC-7984 Confidential Identity Token |

---

## Verification Criteria

| Credential | Threshold | Why |
|---|---|---|
| Wallet age | 90+ days | Prevents freshly created bot wallets |
| ETH balance | Above zero | Proves wallet is active and funded |
| Transaction count | 3+ transactions | Proves genuine on-chain activity |
| Full verification | All three pass | Combined Sybil-resistance signal |

All thresholds are **configurable per protocol** — a lending protocol might require 180 days, an NFT mint might only require 30 days.

---

## iExec Nox Protocol Usage

PROVID uses Nox at every critical step:

### 1. Handle Encryption
```typescript
// Client-side encryption via Nox JS SDK
const handleClient = await createViemHandleClient(walletClient)
const walletAgeEnc = await handleClient.encryptInput(
  BigInt(walletAgeDays),
  'uint256',
  VAULT_ADDRESS  // bound to our contract
)
// Returns: { handle, handleProof }
// handle = 32-byte pointer, actual value never exposed
```

### 2. TEE Comparison (Solidity)
```solidity
import {Nox, euint256, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

// Comparison runs inside Intel TDX TEE
// Neither the inputs nor the result is exposed in plaintext
ebool ageOk = Nox.ge(walletAgeDays, Nox.toEuint256(90));

// ACL — only owner and verifier can access this result
Nox.allowThis(ageOk);
Nox.allow(ageOk, msg.sender);
Nox.allow(ageOk, proofVerifier);
```

### 3. ERC-7984 Confidential Token
```solidity
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";

// Mint with encrypted amount — balance hidden on-chain
euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);
_mint(to, amount);
// Result: token holder's balance is encrypted, invisible to all
```

---

## Why This Matters For DeFi

| Problem | Current Solution | PROVID Solution |
|---|---|---|
| Sybil attacks | Centralized KYC | Decentralized TEE verification |
| Bot farming | Overcollateralization | Private eligibility gates |
| Whale manipulation | Time locks | Confidential credential checks |
| Privacy violations | Public on-chain data | Encrypted handles, hidden balances |
| Integration friction | Build your own | One line of Solidity |

---

## The Roadmap — Three Layers

### Layer 1 — Identity (Shipped ✅)
Private on-chain identity verification. Real wallet data. Nox TEE. ERC-7984 token. This is what we built.

### Layer 2 — Credit (Next)
Undercollateralized lending powered by private credit scoring. DeFi protocols can offer better rates to PROVID-verified wallets without seeing their full history. A verified wallet with 2 years of clean repayment history gets better rates — the protocol never sees the history, only the score.

### Layer 3 — Reputation (Vision)
Portable, private reputation that travels across every protocol. Your Aave repayment history, your Uniswap trading record, your governance participation — all compiled into a private reputation credential you own and port anywhere. Built once. Used everywhere. Owned by you.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Confidential computing | iExec Nox Protocol (Intel TDX) |
| Smart contracts | Solidity 0.8.27/0.8.28 + Hardhat |
| Confidential token | ERC-7984 (`@iexec-nox/nox-confidential-contracts`) |
| Blockchain | Arbitrum Sepolia (chainId: 421614) |
| Frontend | Next.js 16 + TypeScript + Tailwind |
| Wallet | wagmi v2 + viem |
| Encryption SDK | `@iexec-nox/handle` |
| AI integration | ChainGPT API |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MetaMask with Arbitrum Sepolia configured
- Arbitrum Sepolia ETH (get from [faucet](https://cdefi.iex.ec/))

### Clone & Install
```bash
git clone https://github.com/yourusername/provid
cd provid

# Install contract dependencies
cd contracts && npm install

# Install main app
cd ../apps/provid-app && npm install

# Install demo airdrop
cd ../demo-airdrop && npm install
```

### Environment Setup
```bash
cd contracts
cp .env.example .env
# Add your private key and Alchemy RPC URL
```

### Deploy Contracts
```bash
cd contracts
HARDHAT_CONFIG=hardhat.config.cjs npx hardhat compile
HARDHAT_CONFIG=hardhat.config.cjs npx hardhat run scripts/redeployAll.cjs --network arbitrumSepolia
```

### Run Apps
```bash
# Main app (port 3000)
cd apps/provid-app && npm run dev

# Demo airdrop (port 3001)
cd apps/demo-airdrop && npm run dev -- -p 3001
```

---

## Demo

**Main app:** `https://provid.vercel.app`
**Demo airdrop:** `https://provid-airdrop.vercel.app`

### Demo Flow
1. Connect MetaMask (Arbitrum Sepolia)
2. Go to "Build Identity" — see your real on-chain data fetched
3. Click "Verify Identity & Mint Token" — Nox SDK encrypts, TEE verifies, ERC-7984 mints
4. Visit the demo airdrop site — click "Verify with PROVID"
5. See your credentials checked privately — claim your PVID tokens

---

## Why We Built This

Every week, millions of dollars are lost to Sybil attacks in DeFi. Uniswap's airdrop was farmed. Arbitrum's airdrop was farmed. ENS, Optimism, every major protocol — farmed.

The problem isn't that people are malicious. The problem is that **the system is public**. When eligibility is visible, it gets gamed. When balances are visible, they get targeted. When identity is exposed, it gets stolen.

Nox Protocol gives us, for the first time, the ability to verify without revealing. To prove without exposing. To trust without centralizing.

PROVID is the identity layer that DeFi has always needed — and could never have until Nox existed.

This is not a hackathon project. This is infrastructure.

---

## Team

Built during the iExec Vibe Coding Challenge 2026.

---

## License

MIT
