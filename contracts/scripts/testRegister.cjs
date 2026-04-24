const hre = require("hardhat");

async function main() {
  const vault = await hre.ethers.getContractAt(
    "IdentityVault",
    "0x6DD217aF991606e7c65e7FA082a6D914f2b02e3d"
  );

  try {
    await vault.registerIdentity.staticCall(
      "0x" + "00".repeat(32), "0x00",
      "0x" + "00".repeat(32), "0x00",
      "0x" + "00".repeat(32), "0x00"
    );
  } catch(e) {
    console.log("Revert:", e.shortMessage || e.reason || e.message?.slice(0, 400));
  }
}
main().catch(console.error);
