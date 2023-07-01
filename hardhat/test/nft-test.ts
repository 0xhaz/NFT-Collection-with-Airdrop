import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT, Airdrop, GeneratedNFT } from "../typechain";

const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("NFT", () => {
  const NAME = "Dapp Punks";
  const SYMBOL = "DPX";
  const COST = ether(10);
  const MAX_SUPPLY = 10000;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";
});
