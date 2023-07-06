import { ethers } from "ethers";

export {};

declare global {
  type NFTCollections = {
    name: string;
    symbol: string;
    cost: ethers.BigNumber;
    maxSupply: ethers.BigNumber;
    maxMintPerTx: ethers.BigNumber;
    baseURI: string;
  };
}
