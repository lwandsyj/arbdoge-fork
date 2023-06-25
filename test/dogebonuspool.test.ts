import { expect } from "chai";
import { ethers } from "hardhat";
import { AIDoge, DogeBonusPool } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("DogeBonusPool", () => {
  let EMPTY = "0x0000000000000000000000000000000000000000";
  let dogebonuspool: DogeBonusPool;
  let aidoge: AIDoge;
  let rewardToken: AIDoge;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  before(async () => {
    [owner, user] = await ethers.getSigners();

    const RewardTokenFactory = await ethers.getContractFactory("AIDoge");
    rewardToken = await RewardTokenFactory.deploy(EMPTY, EMPTY, EMPTY, EMPTY);
    await rewardToken.deployed();
    await rewardToken.launch();
    console.log("rewardToken", rewardToken.address);

    const AIDogeFactory = await ethers.getContractFactory("AIDoge");
    aidoge = await AIDogeFactory.deploy(EMPTY, EMPTY, EMPTY, EMPTY);
    await aidoge.deployed();
    await aidoge.launch();
    console.log("aidoge", aidoge.address);

    const DogeBonusPoolFactory = await ethers.getContractFactory(
      "DogeBonusPool"
    );
    const rewardsPerSecond = BigNumber.from("1000");
    const startTime = BigNumber.from("1682769600");
    const bonusEndTime = BigNumber.from("1700000000");
    const maxStakingPerUser = BigNumber.from(
      "356811923176489970264571492362373784095686655" // 2^148 - 1
    );
    dogebonuspool = await DogeBonusPoolFactory.deploy(
      rewardToken.address,
      rewardsPerSecond,
      startTime,
      bonusEndTime,
      maxStakingPerUser
    );
    await dogebonuspool.deployed();
  });
  it("add bonus pool", async () => {
    await dogebonuspool.add(BigNumber.from(10).pow(3), aidoge.address, true);
    await aidoge.transfer(
      dogebonuspool.address,
      BigNumber.from(BigNumber.from(3).mul(BigNumber.from(10).pow(6)))
    );
    await rewardToken.transfer(
      dogebonuspool.address,
      BigNumber.from(BigNumber.from(3).mul(BigNumber.from(10).pow(6)))
    );
    const poolview = await dogebonuspool.getPoolView(0);
    const [
      pid,
      allocPoint,
      lastRewardTime,
      rewardsPerSecond,
      accRewardPerShare,
      totalAmount,
      token,
      symbol,
      name,
      decimals,
      startTime,
      bonusEndTime,
    ] = poolview;
    expect(pid).eq(0);
    expect(allocPoint).eq(1000);
    expect(token).eq(aidoge.address);
  });

  it("deposit", async () => {
    const amount = BigNumber.from(10).pow(6);
    await aidoge.transfer(user.address, BigNumber.from(2).mul(amount));
    await rewardToken.transfer(
      user.address,
      BigNumber.from(BigNumber.from(2).mul(amount))
    );
    await aidoge.connect(user).approve(dogebonuspool.address, amount);
    await dogebonuspool.connect(user).deposit(BigNumber.from(0), amount);

    const ONE_HOUR = 3600;
    await time.increase(ONE_HOUR);
    const reward = await dogebonuspool
      .connect(user)
      .pendingReward(0, user.address);
    const bal = await aidoge.balanceOf(user.address);

    const poolview = await dogebonuspool.getPoolView(0);
    const rewardPerSecond = BigNumber.from(poolview[3]);
    expect(reward).eq(rewardPerSecond.mul(BigNumber.from(ONE_HOUR)));
    expect(bal).eq(amount);
  });
});
