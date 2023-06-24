import "@nomicfoundation/hardhat-toolbox";

import "@openzeppelin/hardhat-upgrades";

export default {
  defaultNetwork: "localhost",
  solidity: {
    version: "0.8.19",
    settings: { optimizer: { enabled: true, runs: 1 }, viaIR: true },
  },
};
