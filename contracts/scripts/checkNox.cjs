const hre = require("hardhat");

async function main() {
  const noxAddr = "0xd464B198f06756a1d00be223634b85E0a731c229";
  const vaultAddr = "0x6DD217aF991606e7c65e7FA082a6D914f2b02e3d";
  
  const noxCode = await hre.ethers.provider.getCode(noxAddr);
  const vaultCode = await hre.ethers.provider.getCode(vaultAddr);
  
  console.log("NoxCompute exists:", noxCode.length > 2, "| size:", noxCode.length);
  console.log("IdentityVault exists:", vaultCode.length > 2, "| size:", vaultCode.length);
}
main().catch(console.error);
