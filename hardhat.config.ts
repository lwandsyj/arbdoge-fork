import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

export default {
  defaultNetwork: "localhost",
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
