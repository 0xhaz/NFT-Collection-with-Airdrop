export interface networkConfigItem {
  name?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const developmentChains: string[] = ["hardhat", "localhost"];

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  11155111: {
    name: "sepolia",
    blockConfirmations: 6,
  },
};
