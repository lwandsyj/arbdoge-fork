import { ethers, network } from "hardhat";
import path from "path";
import fs from "fs";
import * as env from "dotenv";
import { BigNumber } from "ethers";
env.config();

async function main() {
  // 注意：部署前修改配置
  const rewardToken = "0x912ce59144191c1204e64559fe8253a0e49e6548"; // staking 奖励币种
  const rewardsPerSecond = BigNumber.from("42516962188318141");
  const startTime = BigNumber.from("1682769600");
  const bonusEndTime = BigNumber.from("1700000000");
  const maxStakingPerUser = BigNumber.from(
    "356811923176489970264571492362373784095686655" // 2^148 - 1
  );
  const DogeBonusPoolFactory = await ethers.getContractFactory("DogeBonusPool");
  const DogeBonusPoolProxy = await DogeBonusPoolFactory.deploy(
    rewardToken,
    rewardsPerSecond,
    startTime,
    bonusEndTime,
    maxStakingPerUser
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
