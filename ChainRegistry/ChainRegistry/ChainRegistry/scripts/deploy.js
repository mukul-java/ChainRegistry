const { ethers } = require("hardhat");

async function main() {
  const ChainRegistry = await ethers.getContractFactory("ChainRegistry");
  const chainRegistry = await ChainRegistry.deploy();

  const [owner] = await hre.ethers.getSigners();

  // Wait for deployment using Ethers v6 syntax
  await chainRegistry.waitForDeployment();

  console.log("Chainregistry deployed to:", await chainRegistry.getAddress());
  console.log("Contract deployed by (owner):", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
