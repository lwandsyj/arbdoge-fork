import { ethers, network } from "hardhat";
import path from "path";
import fs from "fs";
import * as env from "dotenv";
env.config();

async function main() {
  // 注意：部署前注意确认，配置参考 aidoge
  const backtoken = "0x912CE59144191C1204E64559FE8253a0e49E6548"; // LP staking 奖励币种
  const factory = "0x6EcCab422D763aC031210895C81787E87B43A652"; // Camelot factory
  const router = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d"; // Camelot router
  const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
  const AIDogeFactory = await ethers.getContractFactory("AIDoge");
  const AIDogeProxy = await AIDogeFactory.deploy(
    backtoken,
    factory,
    router,
    WETH
  );
  await AIDogeProxy.deployed();
  const AIDoge = AIDogeFactory.attach(AIDogeProxy.address);

  await AIDogeProxy.launch();
  await AIDogeProxy.initializePair(); // 调用 camelot router 合约

  // 合约内 fee 分母是 10000,  15% 总手续费
  await AIDogeProxy.setBuyFees(
    100, //  1% gov1FeeBuy       治理合约1
    200, //  2% gov2FeeBuy       治理合约2
    200, //  2% liquidityFeeBuy  重新注入 aidoge/WETH LP
    300, //  3% jackpotFeeBuy    重新注入 jackpot 对应 arbdoge 上的 lucky drop
    300, //  3% bonusFeeBuy      重新注入 单币质押 对应 Earn 功能
    300, //  3% devFeeBuy        研发费用
    100 //  1% burnFeeBuy       销毁部分
  );
  // 总手续费，这里可以调整 total sell fee 至 25%
  await AIDogeProxy.setSellFees(
    100, //   1% gov1FeeSell       治理合约1
    200, //   2% gov2FeeSell       治理合约2
    200, //   2% liquidityFeeSell  重新注入至 aidoge/WETH LP
    300, //   3% jackpotFeeSell    重新注入至 jackpot，对应 arbdoge 上的 lucky drop
    300, //   3% bonusFeeSell      重新注入至 单币质押，对应 arbdoge 的 Earn 功能
    1300, // 13% devFeeSell        研发费用
    100 //   1% burnFeeSell       销毁部分
  );

  // 部署前注意修改
  await AIDogeProxy.setFeeReceivers(
    "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 治理合约1
    "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 治理合约2
    "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // 单币 staking 合约，earn 功能
    "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047", // jackpot 合约，lucky drop 功能
    "0x8a35A64A20840c71d2eFb5aAeEF6933F5e6A3047" // 运营方钱包
  );

  const artifactsDir = path.join(__dirname, "../artifacts");
  const contractsDir = path.join(__dirname, "../artifacts/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    artifactsDir + `/${network.name}_aidoge.json`,
    JSON.stringify({
      AIDoge: AIDoge.address,
    })
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
