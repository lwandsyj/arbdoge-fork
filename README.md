# ArbDoge Fork

- [需求](#需求)
- [合约文档](#合约文档)
  - [空投 / 邀请奖励](#空投邀请奖励)
  - [Earn / 单币质押功能](#earn单币质押功能)
  - [代币合约](#代币合约)
- [编译](#编译)
- [测试](#测试)
- [部署](#部署)
  - [部署 Earn / 单币 staking 合约：](#部署earn单币staking合约)
  - [部署 Airdrop 合约：](#部署airdrop合约)
  - [部署代币合约：](#部署代币合约)

## 需求

仿 Arbdoge [https://arbdoge.ai/](https://arbdoge.ai/)

```
总量50亿
60%给池子和奖励
20%给市场推荐（只有一级拉新，3%奖励）
20%空投


LP池子xxx/eth的购买滑点0.5%，卖出扣除25%
Staking LP to Earn ETH
扣税部分到营销钱包

Staking to Earn XXX

Connect wallet：Metamask、TokenPocket、OKX Wallet

核心规则:
1、每个获得arb空投钱包到官网可固定领取1万个XXX
2、有新钱包通过分享领取则空投300个到分享者钱包

网络名称：Arbitrum Goerli
RPC ：https://goerli-rollup.arbitrum.io/rpc
链ID：421613
符号：GoerliETH
浏览器：https://goerli-rollup-explorer.arbitrum.io
```

## 合约文档

### 空投/邀请奖励

对应 [contracts/pool/DistributionPool.sol](contracts/pool/DistributionPool.sol)，
合约交互参考测试用例 [test/distributionpool.test.ts](test/distributionpool.test.ts)

```
// nonce: 时间戳
// signature: 对 message 进行签名
// referrer: 邀请人钱包地址，没邀请人时 referrer 填自己或者 0x0
function claim(uint128 nonce, bytes calldata signature,address referrer) public

// 获取对应钱包地址的空投奖励信息；
function getInfoView(address user) public view returns (InfoView memory)

// arb 空投钱包地址列表
// https://arbiscan.io/address/0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9
```

### Earn/单币质押功能

对应 [contracts/pool/DogeBonusPool.sol](contracts/pool/DogeBonusPool.sol)，
合约交互参考测试用例 [test/dogebonuspool.test.ts](test/dogebonuspool.test.ts)

### 代币合约

对应 [contracts/token/AIDoge.sol](contracts/token/AIDoge.sol)，
合约交互参考测试用例 [test/aidogetoken.test.ts](test/aidogetoken.test.ts)，
部署脚本 [scripts/deploy-aidogetoken.ts](scripts/deploy-aidogetoken.ts)

```
// 部署前注意确认，配置参考 aidoge
const backtoken = "0x912CE59144191C1204E64559FE8253a0e49E6548"; // LP staking 奖励币种, ARB
const factory = "0x6EcCab422D763aC031210895C81787E87B43A652";   // Camelot factory
const router = "0xc873fEcbd354f5A56E00E710B90EF4201db2448d";    // Camelot router
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

```

## 编译

```
npx hardhat compile
```

## 测试

```
npx hardhat node
REPORT_GAS=true npx hardhat test
```

## 部署

### 部署 Earn/单币 staking 合约：

本地：

```
yarn deploy:dogebonuspool:local
```

Arbitrum goerli testnet：

```
// PK 为私钥，本地添加进 .env 文件或者在命令执行时加入
PK=xxxxxxxx yarn deploy:dogebonuspool:arbgoerli
```

### 部署 Airdrop 合约：

本地：

```
yarn deploy:distributionpool:local
```

Arbitrum goerli testnet：

```
// PK 为私钥，本地添加进 .env 文件或者在命令执行时加入
PK=xxxxxxxx yarn deploy:distributionpool:arbgoerli
```

### 部署代币合约：

本地：

```
yarn deploy:aidogetoken:local
```

Arbitrum goerli testnet：

```
// PK 为私钥，本地添加进 .env 文件或者在命令执行时加入
PK=xxxxxxxx yarn deploy:aidogetoken:arbgoerli
```
