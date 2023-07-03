import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../hardhat-helper";
import { network } from "hardhat";
import verify from "../utils/verify";
import { generateMerkleTree } from "../scripts/00-generate-merkle-tree";
import { MerkleTree } from "merkletreejs";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const isDevelopment = developmentChains.includes(network.name);

  const tree: MerkleTree = await generateMerkleTree();

  const root = tree.getHexRoot();
  const nftTokenURIs: string =
    "ipfs://QmT9JJuUya27XKThLvnsB7r1BxTHAyAwRaZc56Ji54h3Fx/";

  const deployResult: DeployResult = await deploy("Airdrop", {
    from: deployer,
    args: [root, nftTokenURIs],
    log: true,
  });

  //   if (isDevelopment) {
  //     await verify(deployResult);
  //   }
};

deployFunc.tags = ["Airdrop"];
export default deployFunc;
