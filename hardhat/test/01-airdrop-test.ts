import { ethers } from "hardhat";
import { expect } from "chai";
import { Airdrop, NFT } from "../typechain";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

const tokens = (n: number) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("Airdrop", () => {
  let airdrop: any;
  let nft: any;
  let tree: MerkleTree;
  let deployer: SignerWithAddress;
  let minter: SignerWithAddress;
  let receiver: SignerWithAddress;
  let user1: SignerWithAddress;
  let transaction: any, result: any;

  before(async () => {
    const NAME = "Dapp Punks";
    const SYMBOL = "DPX";
    const COST = ether(10);
    const MAX_SUPPLY = 10000;
    const MAX_AMOUNT = 10;
    const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";

    [deployer, receiver] = await ethers.getSigners();

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

    transaction = await nft.connect(receiver).mint(1, { value: COST });
    result = await transaction.wait();
  });

  beforeEach(async () => {
    [deployer, receiver, user1] = await ethers.getSigners();
    // uncomment console.log("Merkle root: ", root) in 00-generate-merkle-tree.ts
    // and copy the output to the root variable below
    const root =
      "0x94f9ae854e1f087e27e62c1a89d526f10f4c8b814bf7584bf338b76e88461d96";
    const nftTokenURIs =
      "ipfs://QmT9JJuUya27XKThLvnsB7r1BxTHAyAwRaZc56Ji54h3Fx/";
    const airdropFactory = await ethers.getContractFactory("Airdrop");
    airdrop = await airdropFactory.deploy(root, nftTokenURIs, nft.address);
    await airdrop.deployed();
    tree = await generateMerkleTree();
    // console.log(receiver.address);
  });

  describe("Can Claim Airdrop", () => {
    describe("Success", () => {
      it("should return true if the proof is valid and haven't been claimed", async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        expect(await airdrop.connect(receiver).canClaim(proof)).to.be.true;
      });
    });

    describe("Failure", () => {
      it("should return false if the proof is valid but already claimed", async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        await airdrop.connect(receiver).claimAirdrop(proof);
        transaction = await airdrop.connect(receiver).canClaim(proof);

        expect(transaction).to.be.false;
      });

      it("should return false if the proof is not valid and haven't been claimed", async () => {
        const invalidProof = tree.getHexProof(keccak256(user1.address));
        expect(await airdrop.connect(user1).canClaim(invalidProof)).to.be
          .reverted;
      });
    });
  });

  describe("Claim Airdrop", () => {
    describe("Success", () => {
      beforeEach(async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        transaction = await airdrop.connect(receiver).claimAirdrop(proof);
        result = await transaction.wait();
      });

      it("should allow claiming airdrop when not already claimed and proof is valid", async () => {
        expect(await airdrop.s_claimed(receiver.address)).to.be.true;
      });

      it("should show balance of receiver is 1", async () => {
        expect(await airdrop.balanceOf(receiver.address, 0)).to.be.equal(1);
      });

      it("should emit AirdropClaimed event", async () => {
        await expect(transaction)
          .to.emit(airdrop, "AirdropClaimed")
          .withArgs(receiver.address, 0);
      });
    });

    describe("Failure", () => {
      it("should revert claiming airdrop when already claimed", async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        await airdrop.connect(receiver).claimAirdrop(proof);
        await expect(
          airdrop.connect(receiver).claimAirdrop(proof)
        ).to.be.revertedWithCustomError(airdrop, "Airdrop__AlreadyClaimed");
      });

      it("should revert claiming airdrop when proof is not valid", async () => {
        const invalidProof = tree.getHexProof(keccak256(user1.address));
        await expect(
          airdrop.connect(receiver).claimAirdrop(invalidProof)
        ).to.be.revertedWithCustomError(airdrop, "Airdrop__NotInAllowList");
      });
    });
  });

  describe("Burn Airdrop", () => {
    describe("Success", () => {
      beforeEach(async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        await airdrop.connect(receiver).claimAirdrop(proof);

        transaction = await airdrop.connect(receiver).burn(0);
        result = await transaction.wait();
      });

      it("should allow burning airdrop when already claimed", async () => {
        expect(await airdrop.s_claimed(receiver.address)).to.be.true;
      });

      it("should show balance of receiver is 0", async () => {
        expect(await airdrop.balanceOf(receiver.address, 0)).to.be.equal(0);
      });

      it("should emit AirdropBurned event", async () => {
        await expect(transaction)
          .to.emit(airdrop, "TokenBurned")
          .withArgs(receiver.address, 0);
      });
    });

    describe("Failure", () => {
      it("should revert burning airdrop when not claimed", async () => {
        await expect(airdrop.connect(receiver).burn(0)).to.be.reverted;
      });

      it("should revert burning airdrop when not owner", async () => {
        const proof = tree.getHexProof(keccak256(receiver.address));
        await airdrop.connect(receiver).claimAirdrop(proof);
        await expect(airdrop.connect(user1).burn(0)).to.be.revertedWith(
          "Airdrop: caller is not the owner of the token"
        );
      });
    });
  });
});
