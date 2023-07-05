import { artifacts } from "hardhat";
import { NFT, Airdrop, GeneratedNFT } from "../typechain";
import fs from "fs";

type Contract = NFT | Airdrop | GeneratedNFT;

export function saveFrontEndFiles(contract: Contract, contractName: string) {
  const clientPath = "../../client";
  const contractDir = clientPath + "/app/contracts";

  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true }),
      console.log("Directory created successfully!");
  }

  const contractAddressFilePath = `${contractDir}/${contractName}-address.json`;

  fs.writeFileSync(
    contractAddressFilePath,
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );

  const artifactFilePath = `${contractDir}/${contractName}.json`;
  const Artifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(artifactFilePath, JSON.stringify(Artifact, null, 2));
}

export function saveConfig(contract: Contract, contractName: string) {
  fs.writeFileSync(
    "./config.json",
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );
}
