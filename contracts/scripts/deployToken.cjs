const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n════════════════════════════════════════");
  console.log("  Deploying PROVID Identity Token");
  console.log("════════════════════════════════════════\n");
  console.log(`Deployer: ${deployer.address}`);

  const Token = await hre.ethers.getContractFactory("ProvidIdentityToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✓ ProvidIdentityToken: ${tokenAddress}`);

  // Wire to CredentialIssuer
  const issuerAddress = "0x64baB30b15fD372B4E4Be10ec8c4af43C21c033a";
  await (await token.setCredentialIssuer(issuerAddress)).wait();
  console.log(`✓ CredentialIssuer linked`);

  // Save address
  const existing = JSON.parse(fs.readFileSync("deployments/arbitrumSepolia.json"));
  existing.contracts.ProvidIdentityToken = tokenAddress;
  fs.writeFileSync("deployments/arbitrumSepolia.json", JSON.stringify(existing, null, 2));

  console.log("\n════════════════════════════════════════");
  console.log("  DONE ✓");
  console.log("════════════════════════════════════════");
  console.log(`\nToken: ${tokenAddress}`);
  console.log(`Arbiscan: https://sepolia.arbiscan.io/address/${tokenAddress}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
