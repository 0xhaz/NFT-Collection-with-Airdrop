"use client";
import { useContext, useCallback, createContext } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

interface GeneratedNFTContextProps {
  mintNFT: (amount: ethers.BigNumber, tokenURI: string) => Promise<void>;
  getOwnedTokens: () => Promise<number[]>;
  getAllTokens: () => Promise<number[]>;
}

export const GeneratedNFTContext = createContext<GeneratedNFTContextProps>({
  mintNFT: async () => {},
  getOwnedTokens: async () => [],
  getAllTokens: async () => [],
});

export type GeneratedNFTDataProviderProps = {
  children: JSX.Element;
};

export const GeneratedNFTProvider = ({
  children,
}: GeneratedNFTDataProviderProps): JSX.Element => {
  const { generatedNFTContract } = useContract();
  const { account, accountProvider } = useAccount();

  const mintNFT = useCallback(
    async (amount: ethers.BigNumber, tokenURI: string) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = generatedNFTContract?.connect(signer);
      try {
        await contractWithSigner?.mint(amount, tokenURI);
      } catch (error) {
        console.log("Error minting NFT: ", error);
        throw error;
      }
    },
    [generatedNFTContract, account]
  );

  const getOwnedTokens = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    try {
      const ownedTokens = await generatedNFTContract
        ?.connect(signer)
        .getOwnedTokens();
      return ownedTokens || [];
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [generatedNFTContract]);

  const getAllTokens = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    try {
      const allTokens = await generatedNFTContract?.getAllWallets();
      return allTokens || [];
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [generatedNFTContract]);

  return (
    <GeneratedNFTContext.Provider
      value={{
        mintNFT,
        getOwnedTokens,
        getAllTokens,
      }}
    >
      {children}
    </GeneratedNFTContext.Provider>
  );
};

export const useGeneratedNFT = () => useContext(GeneratedNFTContext);
