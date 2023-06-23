import { ethers, network } from "hardhat";
import path from "path";
import fs from "fs";
import * as env from "dotenv";
import { BigNumber } from "ethers";
env.config();

async function main() {
  const DogeBonusPoolFactory = await ethers.getContractFactory("DogeBonusPool");
  const DogeBonusPoolProxy = await DogeBonusPoolFactory.deploy(
    "0x912ce59144191c1204e64559fe8253a0e49e6548",
    BigNumber.from("42516962188318141"),
    BigNumber.from("1682769600"),
    BigNumber.from("1700000000"),
    BigNumber.from("356811923176489970264571492362373784095686655")
  );
  await DogeBonusPoolProxy.deployed();
  const DogeBonusPool = DogeBonusPoolFactory.attach(DogeBonusPoolProxy.address);

  const artifactsDir = path.join(__dirname, "../artifacts");
  const contractsDir = path.join(__dirname, "../artifacts/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    artifactsDir + `/${network.name}_DogeBonusPool.json`,
    JSON.stringify({
      DogeBonusPool: DogeBonusPool.address,
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
