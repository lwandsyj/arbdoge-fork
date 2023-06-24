import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { AIDoge, DistributionPool } from "../typechain-types";
import { arrayify, keccak256 } from "ethers/lib/utils";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";

describe("DistributionPool", () => {
  let EMPTY = "0x0000000000000000000000000000000000000000";
  let distributionpool: DistributionPool;
  let aidoge: AIDoge;
  let implementationAddress: string;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let referrer: HardhatEthersSigner;
  before(async () => {
    [owner, user, referrer, user2] = await ethers.getSigners();

    const AIDogeFactory = await ethers.getContractFactory("AIDoge");
    aidoge = await AIDogeFactory.deploy(EMPTY, EMPTY, EMPTY, EMPTY);
    await aidoge.deployed();
    await aidoge.launch();

    const DistributionPoolFactory = await ethers.getContractFactory(
      "DistributionPool"
    );
    const DistributionPoolProxy = await upgrades.deployProxy(
      DistributionPoolFactory,
      [aidoge.address], // ERC20 token
      {
        initializer: "initialize",
      }
    );
    await DistributionPoolProxy.deployed();
    distributionpool = DistributionPoolFactory.attach(
      DistributionPoolProxy.address
    );
    await distributionpool.addSigner(owner.address);

    implementationAddress = await getImplementationAddress(
      new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/"),
      distributionpool.address
    );
    await aidoge.transfer(
      distributionpool.address,
      BigNumber.from("1000000000000000")
    );
    console.log("implementationAddress", implementationAddress);
    console.log("distributionpoolAddress", distributionpool.address);
  });
  it("claim without referrer", async () => {
    const nonce = BigNumber.from(Date.now());
    const abi = ethers.utils.defaultAbiCoder;
    const message = keccak256(
      abi.encode(
        ["address", "address", "uint128"],
        [distributionpool.address, user.address, nonce]
      )
    );
    const signature = await owner.signMessage(arrayify(message));
    await distributionpool.connect(user).claim(nonce, signature, user.address);
    const views = await distributionpool
      .connect(user)
      .getInfoView(user.address);
    console.log(views);
    const [
      maxToken,
      initClaim,
      currentClaim,
      claimed,
      inviteRewards,
      inviteUsers,
      claimedSupply,
      claimedCount,
    ] = views;
    expect(claimed).eq(true);
    expect(currentClaim).eq(await distributionpool.canClaimAmount());
    expect(claimedCount).eq(1);
    expect(inviteUsers).eq(0);
  });

  it("claim with referrer", async () => {
    let nonce = BigNumber.from(Date.now());
    const abi = ethers.utils.defaultAbiCoder;
    let message = keccak256(
      abi.encode(
        ["address", "address", "uint128"],
        [distributionpool.address, referrer.address, nonce]
      )
    );
    // referrer
    let signature = await owner.signMessage(arrayify(message));
    await distributionpool
      .connect(referrer)
      .claim(nonce, signature, referrer.address);

    // user2
    nonce = BigNumber.from(Date.now());
    message = keccak256(
      abi.encode(
        ["address", "address", "uint128"],
        [distributionpool.address, user2.address, nonce]
      )
    );
    signature = await owner.signMessage(arrayify(message));
    await distributionpool
      .connect(user2)
      .claim(nonce, signature, referrer.address);
    const user2ClaimAmount = await distributionpool.canClaimAmount();
    const [
      maxToken,
      initClaim,
      currentClaim,
      claimed,
      inviteRewards,
      inviteUsers,
      claimedSupply,
      claimedCount,
    ] = await distributionpool.connect(referrer).getInfoView(referrer.address);
    expect(claimed).eq(true);
    expect(currentClaim).eq(user2ClaimAmount);
    // 3% reward for invitation
    expect(inviteRewards).eq(BigNumber.from(user2ClaimAmount).mul(3).div(100));
    expect(inviteUsers).eq(1);
  });
});
