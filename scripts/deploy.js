const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  // 1. GovToken
  const GovToken = await hre.ethers.getContractFactory("GovToken");
  const govToken = await GovToken.deploy(1000000);
  await govToken.waitForDeployment();
  console.log("GovToken:", await govToken.getAddress());

  // 2. VehicleRegistry
  const VehicleRegistry = await hre.ethers.getContractFactory("VehicleRegistry");
  const registry = await VehicleRegistry.deploy();
  await registry.waitForDeployment();
  console.log("Registry:", await registry.getAddress());

  // 3. VehicleHistory
  const VehicleHistory = await hre.ethers.getContractFactory("VehicleHistory");
  const history = await VehicleHistory.deploy(await registry.getAddress());
  await history.waitForDeployment();
  console.log("History:", await history.getAddress());

  // 4. TheftReport
  const TheftReport = await hre.ethers.getContractFactory("TheftReport");
  const theft = await TheftReport.deploy(await registry.getAddress());
  await theft.waitForDeployment();
  console.log("TheftReport:", await theft.getAddress());

  // 5. OwnershipTransfer
  const OwnershipTransfer = await hre.ethers.getContractFactory("OwnershipTransfer");
  const transfer = await OwnershipTransfer.deploy(await registry.getAddress());
  await transfer.waitForDeployment();
  console.log("OwnershipTransfer:", await transfer.getAddress());

  // 6. DisputeDAO
  const DisputeDAO = await hre.ethers.getContractFactory("DisputeDAO");
  const dao = await DisputeDAO.deploy(await govToken.getAddress());
  await dao.waitForDeployment();
  console.log("DisputeDAO:", await dao.getAddress());

  // 🔗 LINK CONTRACTS (VERY IMPORTANT)
  await registry.setTransferContract(await transfer.getAddress());

  console.log("✅ ALL CONTRACTS DEPLOYED & LINKED");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});