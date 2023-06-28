import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
const { PK } = process.env;

export default {
  defaultNetwork: "localhost",
  networks: {
    arbgoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: [PK], // 私钥
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.6",
      },
      {
        version: "0.8.19",
        settings: { optimizer: { enabled: true, runs: 1 }, viaIR: true },
      },
    ],
    overrides: {
      "contracts/ComelotRouter.sol": {
        version: "0.6.6",
      },
    },
  },
};
