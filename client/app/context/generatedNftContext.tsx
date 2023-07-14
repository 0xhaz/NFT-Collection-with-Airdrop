"use client";
import { useContext, useCallback, createContext } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

interface GeneratedNFTContextProps {
  mintNFT: (tokenURI: string) => Promise<void>;
  getOwnedTokens: () => Promise<number[]>;
  getAllTokens: () => Promise<number[]>;
  getAirdropBalance: (address: string) => Promise<number>;
}

export const GeneratedNFTContext = createContext<GeneratedNFTContextProps>({
  mintNFT: async () => {},
  getOwnedTokens: async () => [],
  getAllTokens: async () => [],
  getAirdropBalance: async () => 0,
});

export type GeneratedNFTDataProviderProps = {
  children: JSX.Element;
};

export const GeneratedNFTProvider = ({
  children,
}: GeneratedNFTDataProviderProps): JSX.Element => {
  const { generatedNFTContract, airdropContract } = useContract();
  const { account, accountProvider } = useAccount();

  const mintNFT = useCallback(
    async (tokenURI: string) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = generatedNFTContract?.connect(signer);
      const airdropContractWithSigner = airdropContract?.connect(signer);
      try {
        // const approveTx = await airdropContractWithSigner?.setApprovalForAll(
        //   generatedNFTContract?.address,
        //   true
        // );
        // await approveTx?.wait();

        const mintTx = await contractWithSigner?.mint(tokenURI);
        await mintTx?.wait();
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

  const getAirdropBalance = useCallback(
    async (address: string) => {
      const signer = accountProvider?.getSigner();
      try {
        const balance = await airdropContract?.balanceOf(address, 0);
        return balance || 0;
      } catch (error) {
        console.log("Error getting NFT: ", error);
        throw error;
      }
    },
    [generatedNFTContract]
  );

  return (
    <GeneratedNFTContext.Provider
      value={{
        mintNFT,
        getOwnedTokens,
        getAllTokens,
        getAirdropBalance,
      }}
    >
      {children}
    </GeneratedNFTContext.Provider>
  );
};

export const useGeneratedNFT = () => useContext(GeneratedNFTContext);
