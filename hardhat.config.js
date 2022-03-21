require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  // defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: process.env.ALCHEMY_URL,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
  },
};
