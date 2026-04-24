const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const issuerAddr = "0x5523eF5447aD7F893eaB21c43EC91113675730e5";

  console.log("Deploying new ProvidIdentityToken...");
  const Token = await hre.ethers.getContractFactory("ProvidIdentityToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("✓ Token:", tokenAddr);

  await (await token.setCredentialIssuer(issuerAddr)).wait();
  console.log("✓ Issuer linked");

  // Update deployment file
  const dep = JSON.parse(fs.readFileSync("deployments/arbitrumSepolia.json"));
  dep.contracts.ProvidIdentityToken = tokenAddr;
  fs.writeFileSync("deployments/arbitrumSepolia.json", JSON.stringify(dep, null, 2));

  console.log("\nNew token address:", tokenAddr);
  console.log("Update CONTRACT_ADDRESSES.ProvidIdentityToken in lib/web3.ts");
}

main().catch(console.error);
