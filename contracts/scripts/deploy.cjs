const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n════════════════════════════════════════");
  console.log("  PROVID Protocol — Deploying...");
  console.log("════════════════════════════════════════\n");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // 1. Deploy IdentityVault
  console.log("1/3 Deploying IdentityVault...");
  const IdentityVault = await hre.ethers.getContractFactory("IdentityVault");
  const vault = await IdentityVault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`    ✓ IdentityVault: ${vaultAddress}\n`);

  // 2. Deploy CredentialIssuer
  console.log("2/3 Deploying CredentialIssuer...");
  const CredentialIssuer = await hre.ethers.getContractFactory("CredentialIssuer");
  const issuer = await CredentialIssuer.deploy(vaultAddress);
  await issuer.waitForDeployment();
  const issuerAddress = await issuer.getAddress();
  console.log(`    ✓ CredentialIssuer: ${issuerAddress}\n`);

  // 3. Deploy ProofVerifier
  console.log("3/3 Deploying ProofVerifier...");
  const ProofVerifier = await hre.ethers.getContractFactory("ProofVerifier");
  const verifier = await ProofVerifier.deploy(issuerAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`    ✓ ProofVerifier: ${verifierAddress}\n`);

  // 4. Wire contracts together
  console.log("Wiring contracts...");
  await (await vault.setCredentialIssuer(issuerAddress)).wait();
  console.log("    ✓ Vault → Issuer linked");
  await (await issuer.setProofVerifier(verifierAddress)).wait();
  console.log("    ✓ Issuer → Verifier linked\n");

  // 5. Save addresses
  const deployment = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      IdentityVault: vaultAddress,
      CredentialIssuer: issuerAddress,
      ProofVerifier: verifierAddress,
    },
  };

  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync("deployments/arbitrumSepolia.json", JSON.stringify(deployment, null, 2));

  console.log("════════════════════════════════════════");
  console.log("  DEPLOYED ✓");
  console.log("════════════════════════════════════════");
  console.log(`\nIdentityVault:    ${vaultAddress}`);
  console.log(`CredentialIssuer: ${issuerAddress}`);
  console.log(`ProofVerifier:    ${verifierAddress}`);
  console.log(`\nArbiscan:`);
  console.log(`  https://sepolia.arbiscan.io/address/${vaultAddress}`);
  console.log(`  https://sepolia.arbiscan.io/address/${issuerAddress}`);
  console.log(`  https://sepolia.arbiscan.io/address/${verifierAddress}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
