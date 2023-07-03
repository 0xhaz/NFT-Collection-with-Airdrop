import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";

// local address from hardhat
const allowList = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x0000000000000000000000000000000000000003",
  "0x0000000000000000000000000000000000000004",
  "0x0000000000000000000000000000000000000005",
  "0x0000000000000000000000000000000000000006",
];

export async function generateMerkleTree(): Promise<MerkleTree> {
  const leaves = allowList.map(address => keccak256(address));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const root = tree.getHexRoot();
  //   console.log("Merkle root: ", root);
  //   console.log(`Merkle Tree:\n `, tree.toString());

  return tree;
}
