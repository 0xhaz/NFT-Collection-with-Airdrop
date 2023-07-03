import { ethers } from "hardhat";
import { expect } from "chai";
import { Airdrop, GeneratedNFT } from "../typechain";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("GeneratedNFT", () => {
  let airdrop: Airdrop;
  let generatedNFT: GeneratedNFT;
  let tree: MerkleTree;
  let deployer: SignerWithAddress,
    minter: SignerWithAddress,
    user1: SignerWithAddress;
  let transaction: any, result: any;

  const NAME = "Dapp Punks";
  const SYMBOL = "DPX";
  const URL =
    "https://ipfs.io/ipfs/bafyreid4an6ng6e6hok56l565eivozra3373bo6funw3p5mhq5oonew6u4/metadata.json";

  const nftTokenURIs = "ipfs://QmT9JJuUya27XKThLvnsB7r1BxTHAyAwRaZc56Ji54h3Fx/";

  const root =
    "0x99754cefd021c036abab5b3610791ede544baa906a4bcd7ed6cc35f9296f2c27";

  beforeEach(async () => {
    tree = await generateMerkleTree();

    [deployer, minter, user1] = await ethers.getSigners();
    // console.log("Deployer address: ", deployer.address);
    // console.log("Minter address: ", minter.address);

    const airdropFactory = await ethers.getContractFactory("Airdrop");
    airdrop = await airdropFactory.deploy(root, nftTokenURIs);
    await airdrop.deployed();

    const GeneratedNFT = await ethers.getContractFactory("GeneratedNFT");
    generatedNFT = await GeneratedNFT.deploy(airdrop.address, NAME, SYMBOL);
    await generatedNFT.deployed();

    const proof = tree.getHexProof(keccak256(minter.address));
    transaction = await airdrop.connect(minter).claimAirdrop(proof);
    result = await transaction.wait(1);
  });

  describe("GeneratedNFT Deployment", () => {
    it("Should have a name", async () => {
      expect(await generatedNFT.name()).to.equal(NAME);
    });

    it("Should have a symbol", async () => {
      expect(await generatedNFT.symbol()).to.equal(SYMBOL);
    });
  });

  describe("GeneratedNFT minting", () => {
    describe("Succes", () => {
      beforeEach(async () => {
        transaction = await airdrop
          .connect(minter)
          .setApprovalForAll(generatedNFT.address, true);
        result = await transaction.wait(1);

        transaction = await generatedNFT.connect(minter).mint(URL);
        result = await transaction.wait();
      });

      it("returns owner", async () => {
        const result = await generatedNFT.ownerOf("1");
        expect(result).to.be.equal(minter.address);
      });
    });
  });
});
