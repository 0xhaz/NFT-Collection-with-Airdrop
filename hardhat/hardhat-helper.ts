export interface networkConfigItem {
  name?: string;
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const developmentChains = ["hardhat", "localhost"];

export const feePercent = 10;
export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  11155111: {
    name: "sepolia",
    blockConfirmations: 6,
  },
};
