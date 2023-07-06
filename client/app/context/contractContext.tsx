import { ethers, providers } from "ethers";
import { createContext, useContext } from "react";
import nftContractAddress from "../contracts/NFT-address.json";
import nftContractAbi from "../contracts/NFT.json";
import airdropContractAddress from "../contracts/Airdrop-address.json";
import airdropContractAbi from "../contracts/Airdrop.json";
import generatedNFTContractAddress from "../contracts/GeneratedNFT-address.json";
import generatedNFTContractAbi from "../contracts/GeneratedNFT.json";

type Contract = Record<string, any> | null;

export type ContractContextValue = {
  nftContract: Contract;
  airdropContract: Contract;
  generatedNFTContract: Contract;
  provider: providers.Provider | null;
};

type ContractProviderProps = {
  children: React.ReactNode;
};

export const ContractContext = createContext<ContractContextValue>({
  nftContract: null,
  airdropContract: null,
  generatedNFTContract: null,
  provider: null,
});

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const provider = getProvider();

  const nftContract = new ethers.Contract(
    nftContractAddress.NFT,
    nftContractAbi.abi,
    provider
  );

  const airdropContract = new ethers.Contract(
    airdropContractAddress.Airdrop,
    airdropContractAbi.abi,
    provider
  );

  const generatedNFTContract = new ethers.Contract(
    generatedNFTContractAddress.GeneratedNFT,
    generatedNFTContractAbi.abi,
    provider
  );

  const loadNetwork = async (provider: any) => {
    const { chainId } = await provider.getNetwork();

    return chainId;
  };

  return (
    <ContractContext.Provider
      value={{
        nftContract,
        airdropContract,
        generatedNFTContract,
        provider,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export function useContract() {
  return useContext(ContractContext);
}

const getProvider = () => {
  let provider;

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "sepolia") {
    provider = new ethers.providers.InfuraProvider(
      "sepolia",
      process.env.NEXT_PUBLIC_INFURA_KEY
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider();
  }
  return provider;
  console.log(provider);
};
