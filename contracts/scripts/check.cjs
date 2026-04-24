const hre = require("hardhat");

async function main() {
  const address = "0x95b261D1cF925ed330EB0490eb98010D66824238";

  const vault = await hre.ethers.getContractAt("IdentityVault", "0x6DD217aF991606e7c65e7FA082a6D914f2b02e3d");
  const issuer = await hre.ethers.getContractAt("CredentialIssuer", "0x64baB30b15fD372B4E4Be10ec8c4af43C21c033a");

  const isRegistered = await vault.isRegistered(address);
  console.log("Is registered:", isRegistered);

  if (isRegistered) {
    const [issued, issuedAt] = await issuer.getCredentialStatus(address);
    console.log("Credentials issued:", issued);
  } else {
    console.log("Not registered — transactions are failing on-chain");
    console.log("Check this address has ETH on Arbitrum Sepolia:");
    const balance = await hre.ethers.provider.getBalance(address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  }
}

main().catch(console.error);
