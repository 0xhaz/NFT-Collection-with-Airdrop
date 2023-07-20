import { MerkleTree } from "merkletreejs";
import { keccak256, hexlify } from "ethers/lib/utils";

// local address from hardhat
const allowList = [
  "0x0E128580d848fB51849ab6564467A9BA79B4820c",
  "0x54812efcB8633224EdC32a268A7D580E0aBfB9Ae",
  "0x6FC5113b55771b884880785042e78521B8b719fa",
  "0x0C01A73303c8C6fb0BD93eA6015B0A9146A14aC6",
  "0xef5eFd60Cf44BaD67688199AC46DAdC637AC5837",
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x0000000000000000000000000000000000000004",
  "0x0000000000000000000000000000000000000005",
  "0x0000000000000000000000000000000000000006",
];
// const allowList = [
//   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
//   "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
//   "0x0000000000000000000000000000000000000004",
//   "0x0000000000000000000000000000000000000005",
//   "0x0000000000000000000000000000000000000006",
// ];

export async function generateMerkleTree(): Promise<MerkleTree> {
  const leaves = allowList.map(address => keccak256(address));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  const root = tree.getHexRoot();
  //   console.log("Merkle root: ", root);
  //   console.log(`Merkle Tree:\n `, tree.toString());

  return tree;
}

export function verifyProof(
  proof: string[],
  targetAddress: string,
  merkleTree: MerkleTree
): boolean {
  const leaf = hexlify(targetAddress.toLowerCase());

  // console.log("Leaf:", leaf);
  // console.log("Proof:", proof);
  // console.log("Merkle Root:", merkleTree.getHexRoot());

  const convertedProof = proof.map(item => Buffer.from(item.slice(2), "hex"));

  // console.log("Proof (Buffer):", convertedProof);
  // console.log("Leaf (Buffer):", Buffer.from(leaf.slice(2), "hex"));
  // console.log(
  //   "Merkle Root (Buffer):",
  //   Buffer.from(merkleTree.getHexRoot().slice(2), "hex")
  // );

  const isValidProof = merkleTree.verify(
    convertedProof,
    Buffer.from(leaf.slice(2), "hex"),
    Buffer.from(merkleTree.getHexRoot().slice(2), "hex")
  );

  // console.log("IsValidProof:", isValidProof);

  return isValidProof;
}
