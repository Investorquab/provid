const hre = require("hardhat");

async function main() {
  const wallet = "0x95b261D1cF925ed330EB0490eb98010D66824238";
  const tokenAddr = "0xf19E8826E1feEd56c6EbaaF4c81574AfFaDE5c05";
  const issuerAddr = "0x5523eF5447aD7F893eaB21c43EC91113675730e5";
  const vaultAddr = "0xdf434Dd16126BB014d6DffC6017b126A1Ee81A94";

  const token = await hre.ethers.getContractAt("ProvidIdentityToken", tokenAddr);
  const issuer = await hre.ethers.getContractAt("CredentialIssuer", issuerAddr);
  const vault = await hre.ethers.getContractAt("IdentityVault", vaultAddr);

  const hasMinted = await token.hasMinted(wallet);
  const isRegistered = await vault.isRegistered(wallet);
  const [issued] = await issuer.getCredentialStatus(wallet);

  console.log("Is registered:", isRegistered);
  console.log("Has minted token:", hasMinted);
  console.log("Credentials:", issued);
}

main().catch(console.error);
