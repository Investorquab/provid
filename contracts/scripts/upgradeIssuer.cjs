const hre = require("hardhat");

async function main() {
  const issuer = await hre.ethers.getContractAt(
    "CredentialIssuer",
    "0x64baB30b15fD372B4E4Be10ec8c4af43C21c033a"
  );

  const tx = await issuer.setIdentityToken("0xf5424eA57Edf41C35b89BeD3e55ba114FC8D03e7");
  await tx.wait();
  console.log("✓ Identity token linked to CredentialIssuer");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
