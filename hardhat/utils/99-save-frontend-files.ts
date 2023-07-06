const { artifacts } = require("hardhat");

const { NFT, Airdrop, GeneratedNFT } = require("../typechain");
const fs = require("fs");

type Contract = typeof NFT | typeof Airdrop | typeof GeneratedNFT;

const clientPath =
  "/Volumes/extreme/Projects/Solidity/Portfolio/nft-airdrop-mint/client";
const contractDir = clientPath + "/app/contracts";

export function saveFrontEndFiles(contract: Contract, contractName: string) {
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

export function saveConfig(contracts: { name: string; address: string }[]) {
  const configFilePath = `${clientPath}/config.json`;
  let config: Record<string, string> = {};

  if (fs.existsSync(configFilePath)) {
    const existingConfig = fs.readFileSync(configFilePath, "utf-8");
    config = JSON.parse(existingConfig);
  }

  for (const { name, address } of contracts) {
    config[name] = address;
  }

  fs.writeFileSync(configFilePath, JSON.stringify(config, undefined, 2));
}

module.exports = { saveFrontEndFiles, saveConfig };
