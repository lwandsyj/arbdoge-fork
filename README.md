# ArbDoge Fork

## 需求

仿 Arbdoge [https://arbdoge.io/](https://arbdoge.io/)

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

### 空投 / 邀请奖励

对应 [contracts/pool/DistributionPool.sol](contracts/pool/DistributionPool.sol)，
合约交互参考测试用例 [test/distributionpool.test.ts](test/distributionpool.test.ts)

```
function claim(uint128 nonce, bytes calldata signature,address referrer) public
nonce: 时间戳
signature: 对 message 进行签名
referrer: 邀请人钱包地址，没邀请人时 referrer 填自己或者 0x0


function getInfoView(address user) public view returns (InfoView memory)
获取对应钱包地址的空投奖励信息；
```

### Earn 功能

对应 [contracts/pool/DogeBonusPool.sol](contracts/pool/DogeBonusPool.sol)

### 代币合约

对应 [contracts/token/AIDoge.sol](contracts/token/AIDoge.sol)

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

```
npx hardhat run scripts/deploy.ts

```
