import { ethers } from "hardhat";
import { expect } from "chai";
import { NFT, Airdrop, GeneratedNFT } from "../typechain";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;
const GENNAME = "AI Punks";
const GENSYMBOL = "AIX";
const URL =
  "https://ipfs.io/ipfs/bafyreid4an6ng6e6hok56l565eivozra3373bo6funw3p5mhq5oonew6u4/metadata.json";
const nftTokenURIs = "ipfs://QmT9JJuUya27XKThLvnsB7r1BxTHAyAwRaZc56Ji54h3Fx/";
const root =
  "0x99754cefd021c036abab5b3610791ede544baa906a4bcd7ed6cc35f9296f2c27";
const NAME = "Dapp Punks";
const SYMBOL = "DPX";
const COST = ether(10);
const MAX_SUPPLY = 10000;
const MAX_AMOUNT = 10;
const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";

describe("GeneratedNFT", () => {
  let tree: MerkleTree;
  let deployer: SignerWithAddress,
    minter: SignerWithAddress,
    user1: SignerWithAddress;
  let transaction: any, result: any;
  let airdrop: any;
  let nft;
  let generatedNFT: any;

  before(async () => {
    [deployer, minter] = await ethers.getSigners();

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(
      NAME,
      SYMBOL,
      COST,
      MAX_SUPPLY,
      MAX_AMOUNT,
      BASE_URI
    );
    await nft.deployed();

    transaction = await nft.connect(minter).mint(1, { value: COST });
    result = await transaction.wait();

    tree = await generateMerkleTree();

    [deployer, minter, user1] = await ethers.getSigners();
    // console.log("Deployer address: ", deployer.address);
    // console.log("Minter address: ", minter.address);

    const airdropFactory = await ethers.getContractFactory("Airdrop");
    airdrop = await airdropFactory.deploy(root, nftTokenURIs, nft.address);
    await airdrop.deployed();
    // console.log("Airdrop address: ", airdrop.address);

    const proof = tree.getHexProof(keccak256(minter.address));
    transaction = await airdrop.connect(minter).claimAirdrop(proof);
    result = await transaction.wait();

    expect(await airdrop.balanceOf(minter.address, 0)).to.equal(1);
  });

  beforeEach(async () => {
    const GeneratedNFT = await ethers.getContractFactory("GeneratedNFT");
    generatedNFT = await GeneratedNFT.deploy(
      airdrop.address,
      GENNAME,
      GENSYMBOL
    );
    await generatedNFT.deployed();
    // console.log("GeneratedNFT address: ", generatedNFT.address);

    transaction = await airdrop
      .connect(minter)
      .setApprovalForAll(generatedNFT.address, true);
    result = await transaction.wait();

    await airdrop.connect(deployer).setApprovedContract(generatedNFT.address);
  });

  describe("GeneratedNFT Deployment", () => {
    it("Should have a name", async () => {
      expect(await generatedNFT.name()).to.equal(GENNAME);
    });

    it("Should have a symbol", async () => {
      expect(await generatedNFT.symbol()).to.equal(GENSYMBOL);
    });

    it("should approve GeneratedNFT contract", async () => {
      let bool = await airdrop.isApprovedForAll(
        minter.address,
        generatedNFT.address
      );

      expect(bool).to.be.true;
    });
  });

  describe("GeneratedNFT minting", () => {
    describe("Succes", () => {
      beforeEach(async () => {
        // console.log(
        //   "Balance token: ",
        //   await airdrop.balanceOf(minter.address, 0)
        // );
        transaction = await generatedNFT.connect(minter).mint(1, URL);
        result = await transaction.wait();
      });

      it("returns tokenURI, totalSupply and owner, airdrop balance return 0", async () => {
        result = await generatedNFT.ownerOf(1);
        expect(result).to.be.equal(minter.address);
        result = await generatedNFT.tokenURI("1");
        expect(result).to.be.equal(URL);
        result = await generatedNFT.totalSupply();
        expect(result).to.be.equal(1);
        result = await airdrop.balanceOf(minter.address, 0);
        expect(result).to.be.equal(0);
      });
    });
  });
});
