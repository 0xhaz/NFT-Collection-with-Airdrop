import { ethers } from "hardhat";
import { expect } from "chai";
import { NFT, Airdrop, GeneratedNFT } from "../typechain";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { providers } from "ethers";

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
  "0x94f9ae854e1f087e27e62c1a89d526f10f4c8b814bf7584bf338b76e88461d96";
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
    user1: SignerWithAddress,
    user2: SignerWithAddress;
  let transaction: any, result: any;
  let airdrop: any;
  let nft: any;
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

    transaction = await nft
      .connect(minter)
      .mint(5, { value: ethers.utils.parseEther("50") });
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

    expect(await airdrop.balanceOf(minter.address, 0)).to.equal(5);
  });

  beforeEach(async () => {
    const COST = ether(10);
    const GeneratedNFT = await ethers.getContractFactory("GeneratedNFT");
    generatedNFT = await GeneratedNFT.deploy(
      airdrop.address,
      GENNAME,
      GENSYMBOL,
      COST
    );
    await generatedNFT.deployed();
    // console.log("GeneratedNFT address: ", generatedNFT.address);

    transaction = await airdrop
      .connect(minter)
      .setApprovalForAll(generatedNFT.address, true);
    result = await transaction.wait();

    await airdrop.connect(deployer).setApprovedContract(generatedNFT.address);

    // expect(await generatedNFT.getAirdropAmount(minter.address)).to.equal(5);
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

  describe("GeneratedNFT minting with Airdrop", () => {
    describe("Success", () => {
      beforeEach(async () => {
        // loop through the airdrop tokens and mint them
        let balance = await airdrop.balanceOf(minter.address, 0);
        for (let i = 0; i < balance; i++) {
          transaction = await generatedNFT.connect(minter).mint(URL);
          result = await transaction.wait();
          //   console.log("Minted token: ", i);
          //   console.log("Balance: ", balance);
        }
      });

      it("returns tokenURI, totalSupply, owner and airdrop balance ", async () => {
        result = await generatedNFT.ownerOf(1);
        expect(result).to.be.equal(minter.address);
        result = await generatedNFT.tokenURI("1");
        expect(result).to.be.equal(URL);
        result = await generatedNFT.totalSupply();
        expect(result).to.be.equal(5);
        result = await airdrop.balanceOf(minter.address, 0);
        expect(result).to.be.equal(0);
      });
    });
  });

  describe("GeneratedNFT minting with Ether", () => {
    describe("Success", () => {
      beforeEach(async () => {
        transaction = await generatedNFT
          .connect(user1)
          .mint(URL, { value: ether(10) });
        result = await transaction.wait();
      });

      it("returns tokenURI, totalSupply and owner", async () => {
        result = await generatedNFT.ownerOf(1);
        expect(result).to.be.equal(user1.address);
        result = await generatedNFT.tokenURI("1");
        expect(result).to.be.equal(URL);
        result = await generatedNFT.totalSupply();
        expect(result).to.be.equal(1);
      });

      it("returns contract balance", async () => {
        result = await ethers.provider.getBalance(deployer.address);
        expect(result).to.greaterThan(ethers.utils.parseEther("10"));
      });
    });
  });
});
