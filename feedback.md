# iExec Nox Protocol — Builder Feedback

## Summary

We built PROVID, a confidential identity protocol on Nox. Here is honest feedback from our building experience.

---

## What Worked Really Well

### 1. The ERC-7984 Standard
The confidential token standard is genuinely powerful. The ability to mint a token with a hidden balance that is still composable with standard ERC-20 interfaces is a massive unlock. We used it for identity tokens — but the applications are limitless.

### 2. Handle Gateway Encryption
`@iexec-nox/handle` and `createViemHandleClient` worked well once we understood the API. The EIP-712 signing flow for handle proofs is elegant. The fact that encryption happens client-side before data ever hits the chain is exactly the right design.

### 3. TEE Comparisons in Solidity
`Nox.ge()`, `Nox.select()`, and the ACL system (`Nox.allowThis()`, `Nox.allow()`) are intuitive once you understand the mental model. Being able to do encrypted arithmetic inside a TEE and store the encrypted result on-chain is genuinely novel.

### 4. Composability
Our contracts are fully composable with existing DeFi. Any protocol can call `hasMinted(wallet)` on our ERC-7984 token. No wallet changes, no SDK required on their end. This is the right design.

---

## What Was Difficult

### 1. Handle Proof Expiry
The biggest pain point. Handle proofs expire quickly — we're not sure of the exact window but it seemed to be under 60 seconds. When the user sees a MetaMask popup and takes 15-20 seconds to confirm, the proof often expired and the transaction reverted with a generic "execution reverted" message.

**Suggestion:** Surface the proof expiry time in the SDK so developers can warn users. A countdown timer "confirm in the next X seconds" would dramatically improve UX.

### 2. Error Messages
When a Nox contract call reverts (e.g. `validateInputProof` fails), the revert reason is not surfaced. The error comes back as "execution reverted" with no details. This made debugging extremely slow.

**Suggestion:** Custom revert reasons in the NoxCompute contract would save builders hours of debugging.

### 3. Documentation Gaps
The `encryptInput` function signature wasn't immediately obvious from the docs — we had to discover the `solidityType` and `applicationContract` parameters through trial and error.

**Suggestion:** A full working end-to-end example with `encryptInput` → `fromExternal` → `Nox.ge` → `publicDecrypt` would save builders significant time.

### 4. Gas Estimation
MetaMask's gas estimator consistently fails for complex Nox contract calls, sometimes showing fees of 7000+ ETH. We had to manually fetch the base fee and set `maxFeePerGas` programmatically.

**Suggestion:** Document the recommended approach for gas estimation when using Nox contracts.

### 5. ERC-7984 Access Pattern
The `_mint` function in ERC7984 takes `euint256` directly. We had to figure out that `Nox.fromExternal()` must be called in the same transaction as `_mint`. This wasn't documented.

---

## Feature Requests

1. **Batch handle creation** — create multiple handles in one SDK call to reduce the number of MetaMask signing prompts
2. **Handle caching** — allow reuse of unexpired handles across multiple calls
3. **Testnet faucet for handles** — a way to get test handles without real wallet activity for local development
4. **TypeScript types** — stronger types for `euint256`, `ebool`, and handle objects in the JS SDK

---

## Overall Assessment

iExec Nox is the most exciting primitive in DeFi infrastructure that almost nobody knows about. The ability to do confidential computation that is still on-chain verifiable and composable with standard DeFi protocols is genuinely novel — not just a privacy layer bolt-on.

The developer experience has rough edges but the underlying protocol is solid. With better error messages, handle expiry surfacing, and more examples, Nox could become the go-to layer for any protocol that needs private computation.

We will continue building on PROVID after this challenge. The market need is real.

---

*Built during iExec Vibe Coding Challenge 2026*
*Contracts deployed on Arbitrum Sepolia*
