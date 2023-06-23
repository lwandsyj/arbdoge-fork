import { ethers, network, upgrades } from "hardhat";
import path from "path";
import fs from "fs";
import * as env from "dotenv";
env.config();

async function main() {
  const DistributionPoolFactory = await ethers.getContractFactory(
    "DistributionPool"
  );
  const DistributionPoolProxy = await upgrades.deployProxy(
    DistributionPoolFactory,
    ["0x000000000000000000000000000000000000FFFF"], // ERC20 token
    {
      initializer: "initialize",
    }
  );
  await DistributionPoolProxy.deployed();
  const DistributionPool = DistributionPoolFactory.attach(
    DistributionPoolProxy.address
  );

  const artifactsDir = path.join(__dirname, "../artifacts");
  const contractsDir = path.join(__dirname, "../artifacts/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    artifactsDir + `/${network.name}_distributionpool.json`,
    JSON.stringify({
      distributionpool: DistributionPool.address,
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
