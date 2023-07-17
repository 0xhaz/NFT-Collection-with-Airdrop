import { ethers } from "ethers";

export {};

declare module "js-ipfs-fetch";

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
