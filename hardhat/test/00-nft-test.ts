import { expect } from "chai";
import { ethers } from "hardhat";
import { NFT } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("NFT", () => {
  const NAME = "Dapp Punks";
  const SYMBOL = "DPX";
  const COST = ether(10);
  const MAX_SUPPLY = 10000;
  const MAX_AMOUNT = 10;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";

  let nft: any;

  let deployer: SignerWithAddress,
    minter: SignerWithAddress,
    user1: SignerWithAddress;

  beforeEach(async () => {
    [deployer, minter, user1] = await ethers.getSigners();

    const NFTContract = await ethers.getContractFactory("NFT");
    nft = await NFTContract.deploy(
      NAME,
      SYMBOL,
      COST,
      MAX_SUPPLY,
      MAX_AMOUNT,
      BASE_URI
    );
    await nft.deployed();

    // const GeneratedNFT = await ethers.getContractFactory("GeneratedNFT");
    // generatedNFT = await GeneratedNFT.deploy(airdrop.address, NAME, SYMBOL);
    // await generatedNFT.deployed();
  });

  describe("NFT Deployment", () => {
    it("Should have a name", async () => {
      expect(await nft.name()).to.equal(NAME);
    });

    it("Should have a symbol", async () => {
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("Should have a cost", async () => {
      expect(await nft.getCost()).to.equal(COST);
    });

    it("Should have a max supply", async () => {
      expect(await nft.getMaxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should have a max amount", async () => {
      expect(await nft.getMaxMintAmount()).to.equal(MAX_AMOUNT);
    });

    it("Should have a base URI", async () => {
      expect(await nft.getBaseURI()).to.equal(BASE_URI);
    });
  });

  describe("NFT Minting", () => {
    let transaction: any, result;

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
      });

      it("mints a token and updates the total supply", async () => {
        expect(await nft.totalSupply()).to.equal(1);
      });

      it("returns the address of the minter", async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address);
      });

      it("returns thte total number of tokens owned by the minter", async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1);
      });

      it("returns IPFS URI for the token", async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}` + "1.json");
      });

      it("updates the contract balance", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST);
      });

      it("emits a Mint event", async () => {
        await expect(transaction)
          .to.emit(nft, "Mint")
          .withArgs(1, minter.address, 1);
      });
    });

    describe("Failure", () => {
      it("rejects if the cost is not met", async () => {
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be
          .reverted;
      });

      it("requires at least one token to be minted", async () => {
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted;
      });

      it("rejects if the MAX_AMOUNT is exceeded", async () => {
        await expect(nft.connect(minter).mint(11, { value: ether(110) })).to.be
          .reverted;
      });

      it("does not return URIs for non-existent tokens", async () => {
        await expect(nft.tokenURI(99)).to.be.reverted;
      });
    });
  });

  describe("Displaying NFTs", () => {
    let transaction: any, result;
    beforeEach(async () => {
      transaction = await nft.connect(minter).mint(3, { value: ether(30) });
      result = await transaction.wait();
    });

    it("returns an array of token IDs owned by the minter", async () => {
      let tokenIds = await nft.getWalletOwner(minter.address);
      expect(tokenIds.length).to.equal(3);
      expect(tokenIds[0]).to.equal(1);
      expect(tokenIds[1]).to.equal(2);
      expect(tokenIds[2]).to.equal(3);
    });
  });

  describe("Withdraw Balance", () => {
    let transaction: any, result, balanceBefore: any;

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();

        balanceBefore = await ethers.provider.getBalance(deployer.address);

        transaction = await nft.connect(deployer).withdraw();
        result = await transaction.wait();
      });

      it("sets the contract balance to zero", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0);
      });

      it("withdraws the contract balance to the deployer", async () => {
        let balanceAfter = await ethers.provider.getBalance(deployer.address);
        expect(balanceAfter).to.greaterThan(balanceBefore);
      });

      it("emits a Withdraw event", async () => {
        await expect(transaction)
          .to.emit(nft, "Withdraw")
          .withArgs(COST, deployer.address);
      });
    });

    describe("Failure", () => {
      it("rejects if the caller is not the owner", async () => {
        await expect(nft.connect(minter).withdraw()).to.be.reverted;
      });
    });
  });
});
