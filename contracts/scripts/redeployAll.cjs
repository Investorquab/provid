const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n════════════════════════════════════════");
  console.log("  PROVID — Full Redeploy");
  console.log("════════════════════════════════════════\n");

  // 1. IdentityVault
  console.log("1/4 Deploying IdentityVault...");
  const Vault = await hre.ethers.getContractFactory("IdentityVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log(`    ✓ ${vaultAddr}`);

  // 2. CredentialIssuer
  console.log("2/4 Deploying CredentialIssuer...");
  const Issuer = await hre.ethers.getContractFactory("CredentialIssuer");
  const issuer = await Issuer.deploy(vaultAddr);
  await issuer.waitForDeployment();
  const issuerAddr = await issuer.getAddress();
  console.log(`    ✓ ${issuerAddr}`);

  // 3. ProofVerifier
  console.log("3/4 Deploying ProofVerifier...");
  const Verifier = await hre.ethers.getContractFactory("ProofVerifier");
  const verifier = await Verifier.deploy(issuerAddr);
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log(`    ✓ ${verifierAddr}`);

  // 4. ProvidIdentityToken
  console.log("4/4 Deploying ProvidIdentityToken...");
  const Token = await hre.ethers.getContractFactory("ProvidIdentityToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log(`    ✓ ${tokenAddr}`);

  // Wire everything
  console.log("\nWiring contracts...");
  await (await vault.setCredentialIssuer(issuerAddr)).wait();
  console.log("    ✓ Vault → Issuer");
  await (await issuer.setProofVerifier(verifierAddr)).wait();
  console.log("    ✓ Issuer → Verifier");
  await (await issuer.setIdentityToken(tokenAddr)).wait();
  console.log("    ✓ Issuer → Token");
  await (await token.setCredentialIssuer(issuerAddr)).wait();
  console.log("    ✓ Token → Issuer");

  // Save
  const deployment = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      IdentityVault: vaultAddr,
      CredentialIssuer: issuerAddr,
      ProofVerifier: verifierAddr,
      ProvidIdentityToken: tokenAddr,
    },
  };
  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync("deployments/arbitrumSepolia.json", JSON.stringify(deployment, null, 2));

  console.log("\n════════════════════════════════════════");
  console.log("  ALL DEPLOYED ✓");
  console.log("════════════════════════════════════════");
  console.log(`\nIdentityVault:       ${vaultAddr}`);
  console.log(`CredentialIssuer:    ${issuerAddr}`);
  console.log(`ProofVerifier:       ${verifierAddr}`);
  console.log(`ProvidIdentityToken: ${tokenAddr}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
