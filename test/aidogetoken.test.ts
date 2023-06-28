import { ethers } from "hardhat";
import { AIDoge } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";

describe("AIDoge", () => {
  let aidoge: AIDoge;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  before(async () => {
    [owner, user] = await ethers.getSigners();

    // 注意：部署前确认配置参数，此处参考 AIDoge
    let backtoken = "0x912CE59144191C1204E64559FE8253a0e49E6548"; // LP staking 奖励币种, ARB
    let factory = "0x6EcCab422D763aC031210895C81787E87B43A652"; // Camelot factory
    let router = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d"; // Camelot router
    let WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

    // 本地测试用 backtoken
    const BacktokenFactory = await ethers.getContractFactory("DemoToken");
    const localBacktoken = await BacktokenFactory.deploy();
    await localBacktoken.deployed();

    // 本地测试用 WETH
    const FakeWETHFactory = await ethers.getContractFactory("DemoToken");
    const fakeWETH = await FakeWETHFactory.deploy();
    await fakeWETH.deployed();

    // 本地测试用 camelot factory
    const CamelotFactory = await ethers.getContractFactory("CamelotFactory");
    const localFactory = await CamelotFactory.deploy(owner.address);
    await localFactory.deployed();

    // 本地测试用 camelot router
    const CamelotRouter = await ethers.getContractFactory("CamelotRouter");
    const localRouter = await CamelotRouter.deploy(
      localFactory.address,
      fakeWETH.address
    );
    await localRouter.deployed();

    // 本地测试 AIDoge
    const AIDogeFactory = await ethers.getContractFactory("AIDoge");
    aidoge = await AIDogeFactory.deploy(
      localBacktoken.address,
      localFactory.address,
      localRouter.address,
      fakeWETH.address
    );
    await aidoge.deployed();
  });

  it("launch", async () => {
    await aidoge.launch();
    await aidoge.initializePair(); // 调用 camelot router 合约

    // 合约内 fee 分母是 10000,  15% 总手续费
    await aidoge.setBuyFees(
      100, //  1% gov1FeeBuy       治理合约1
      200, //  2% gov2FeeBuy       治理合约2
      200, //  2% liquidityFeeBuy  重新注入 aidoge/WETH LP
      300, //  3% jackpotFeeBuy    重新注入 jackpot 对应 arbdoge 上的 lucky drop
      300, //  3% bonusFeeBuy      重新注入 单币质押 对应 Earn 功能
      300, //  3% devFeeBuy        研发费用
      100 //  1% burnFeeBuy       销毁部分
    );
    // 总手续费，这里可以调整 total sell fee 至 25%
    await aidoge.setSellFees(
      100, //   1% gov1FeeSell       治理合约1
      200, //   2% gov2FeeSell       治理合约2
      200, //   2% liquidityFeeSell  重新注入至 aidoge/WETH LP
      300, //   3% jackpotFeeSell    重新注入至 jackpot，对应 arbdoge 上的 lucky drop
      300, //   3% bonusFeeSell      重新注入至 单币质押，对应 arbdoge 的 Earn 功能
      1300, // 13% devFeeSell        研发费用
      100 //   1% burnFeeSell       销毁部分
    );

    // 部署前注意修改
    await aidoge.setFeeReceivers(
      "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 治理合约1
      "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 治理合约2
      "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 单币 staking 合约，earn 功能
      "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // jackpot 合约，lucky drop 功能
      "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047" // 运营方钱包
    );
    expect(await aidoge.getMinterLength()).eq(1);
    expect(await aidoge.devFeeSell()).eq(BigNumber.from(1300));
  });
});
