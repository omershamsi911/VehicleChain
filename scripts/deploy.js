const { ethers } = require("hardhat");

/**
 * VehicleChain deployment script
 *
 * Compatible with:
 * - legacy setter-based contracts
 * - AccessControl role-based contracts
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("======================================");
  console.log("VehicleChain Deployment");
  console.log("======================================");
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  console.log("");

  // =====================================================
  // 1. GovToken
  // =====================================================

  const GovToken = await ethers.getContractFactory("GovToken");

  const govToken = await GovToken.deploy(1_000_000);

  await govToken.waitForDeployment();

  const govTokenAddr = await govToken.getAddress();

  console.log("GovToken:", govTokenAddr);

  // =====================================================
  // 2. VehicleRegistry
  // =====================================================

  const VehicleRegistry = await ethers.getContractFactory("VehicleRegistry");

  const registry = await VehicleRegistry.deploy();

  await registry.waitForDeployment();

  const registryAddr = await registry.getAddress();

  console.log("VehicleRegistry:", registryAddr);

  // =====================================================
  // 3. VehicleHistory
  // =====================================================

  const VehicleHistory = await ethers.getContractFactory("VehicleHistory");

  const history = await VehicleHistory.deploy(registryAddr);

  await history.waitForDeployment();

  const historyAddr = await history.getAddress();

  console.log("VehicleHistory:", historyAddr);

  // =====================================================
  // 4. TheftReport
  // =====================================================

  const TheftReport = await ethers.getContractFactory("TheftReport");

  const theft = await TheftReport.deploy(registryAddr);

  await theft.waitForDeployment();

  const theftAddr = await theft.getAddress();

  console.log("TheftReport:", theftAddr);

  // =====================================================
  // 5. OwnershipTransfer
  // =====================================================

  const OwnershipTransfer = await ethers.getContractFactory("OwnershipTransfer");

  const transfer = await OwnershipTransfer.deploy(registryAddr);

  await transfer.waitForDeployment();

  const transferAddr = await transfer.getAddress();

  console.log("OwnershipTransfer:", transferAddr);

  // =====================================================
  // 6. DisputeDAO
  // =====================================================

  const DisputeDAO = await ethers.getContractFactory("DisputeDAO");

  const dao = await DisputeDAO.deploy(govTokenAddr);

  await dao.waitForDeployment();

  const daoAddr = await dao.getAddress();

  console.log("DisputeDAO:", daoAddr);

  // =====================================================
  // 7. LINK / WIRE CONTRACTS
  // =====================================================

  console.log("");
  console.log("======================================");
  console.log("Linking Contracts");
  console.log("======================================");

  // -----------------------------------------------------
  // VehicleRegistry -> OwnershipTransfer
  // Supports BOTH:
  // - setTransferContract()
  // - AccessControl TRANSFER_CONTRACT role
  // -----------------------------------------------------

  try {
    if (typeof registry.setTransferContract === "function") {
      const tx = await registry.setTransferContract(transferAddr);
      await tx.wait();

      console.log("Legacy link:");
      console.log("VehicleRegistry -> OwnershipTransfer OK");
    } else {
      const TRANSFER_CONTRACT =
        await registry.TRANSFER_CONTRACT();

      const tx = await registry.grantRole(
        TRANSFER_CONTRACT,
        transferAddr
      );

      await tx.wait();

      console.log("Role link:");
      console.log("TRANSFER_CONTRACT -> OwnershipTransfer OK");
    }
  } catch (err) {
    console.log(
      "WARNING: Could not configure OwnershipTransfer permissions"
    );
    console.log(err.message);
  }

  // -----------------------------------------------------
  // TheftReport AUTHORITY_ROLE
  // -----------------------------------------------------

  try {
    if (
      typeof registry.AUTHORITY_ROLE === "function" &&
      typeof registry.grantRole === "function"
    ) {
      const AUTHORITY_ROLE =
        await registry.AUTHORITY_ROLE();

      const tx = await registry.grantRole(
        AUTHORITY_ROLE,
        theftAddr
      );

      await tx.wait();

      console.log("AUTHORITY_ROLE -> TheftReport OK");
    } else {
      console.log(
        "Skipping AUTHORITY_ROLE setup (not supported)"
      );
    }
  } catch (err) {
    console.log(
      "WARNING: Failed AUTHORITY_ROLE setup"
    );
    console.log(err.message);
  }

  // -----------------------------------------------------
  // GovToken roles -> DisputeDAO
  // -----------------------------------------------------

  try {
    const supportsRoles =
      typeof govToken.MINTER_ROLE === "function" &&
      typeof govToken.grantRole === "function";

    if (supportsRoles) {
      const MINTER_ROLE =
        await govToken.MINTER_ROLE();

      const tx1 = await govToken.grantRole(
        MINTER_ROLE,
        daoAddr
      );

      await tx1.wait();

      console.log("MINTER_ROLE -> DisputeDAO OK");

      // Optional roles

      if (typeof govToken.BURNER_ROLE === "function") {
        const BURNER_ROLE =
          await govToken.BURNER_ROLE();

        const tx2 = await govToken.grantRole(
          BURNER_ROLE,
          daoAddr
        );

        await tx2.wait();

        console.log("BURNER_ROLE -> DisputeDAO OK");
      }

      if (typeof govToken.STAKING_MANAGER === "function") {
        const STAKING_MANAGER =
          await govToken.STAKING_MANAGER();

        const tx3 = await govToken.grantRole(
          STAKING_MANAGER,
          daoAddr
        );

        await tx3.wait();

        console.log("STAKING_MANAGER -> DisputeDAO OK");
      }
    } else {
      console.log(
        "Skipping GovToken role wiring (not supported)"
      );
    }
  } catch (err) {
    console.log(
      "WARNING: Failed GovToken role wiring"
    );
    console.log(err.message);
  }

  // =====================================================
  // 8. OPTIONAL VALIDATOR SEEDING
  // =====================================================

  const INITIAL_VALIDATORS = [
    // "0x123...",
  ];

  try {
    if (
      INITIAL_VALIDATORS.length > 0 &&
      typeof dao.addValidator === "function"
    ) {
      console.log("");
      console.log("Seeding validators...");

      for (const validator of INITIAL_VALIDATORS) {
        const tx = await dao.addValidator(validator);
        await tx.wait();

        console.log("Validator added:", validator);
      }
    } else {
      console.log(
        "Skipping validator seeding"
      );
    }
  } catch (err) {
    console.log(
      "WARNING: Failed validator seeding"
    );
    console.log(err.message);
  }

  // =====================================================
  // 9. SUMMARY
  // =====================================================

  console.log("");
  console.log("======================================");
  console.log("Deployment Summary");
  console.log("======================================");

  console.log("GovToken:", govTokenAddr);
  console.log("VehicleRegistry:", registryAddr);
  console.log("VehicleHistory:", historyAddr);
  console.log("TheftReport:", theftAddr);
  console.log("OwnershipTransfer:", transferAddr);
  console.log("DisputeDAO:", daoAddr);

  console.log("");
  console.log("======================================");
  console.log("Deployment Complete");
  console.log("======================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });