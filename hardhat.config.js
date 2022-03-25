require("@nomiclabs/hardhat-waffle");

require("dotenv").config();
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  // defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: process.env.ALCHEMY_URL,
      accounts: [`0x${process.env.WALLET_PRIVATE_KEY}`],
    },
  },
};
