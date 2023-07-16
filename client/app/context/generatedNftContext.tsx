"use client";
import { useContext, useCallback, createContext, useEffect } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

interface GeneratedNFTContextProps {
  mintNFT: (tokenURI: string) => Promise<void>;
  getOwnedTokens: () => Promise<number[]>;
  getAllTokens: () => Promise<number[]>;
  getAirdropBalance: (address: string) => Promise<number>;
  setApprovalForAll: (address: string) => Promise<void>;
}

export const GeneratedNFTContext = createContext<GeneratedNFTContextProps>({
  mintNFT: async () => {},
  getOwnedTokens: async () => [],
  getAllTokens: async () => [],
  getAirdropBalance: async () => 0,
  setApprovalForAll: async (address: string) => {},
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
        const cost = await generatedNFTContract?.getCost();
        const isAirdropTokenHolder =
          await airdropContractWithSigner?.isTokenExists(account);
        const balance = await contractWithSigner?.getAirdropBalance(account);
        console.log("Balance: ", balance.toString());

        if (isAirdropTokenHolder && balance > 0) {
          const mintTx = await contractWithSigner?.mint(tokenURI);
          await mintTx?.wait();
        } else {
          const mintTx = await contractWithSigner?.mint(tokenURI, {
            value: cost,
          });
          await mintTx?.wait();
        }
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

  const setApprovalForAll = useCallback(
    async (address: string) => {
      const signer = accountProvider?.getSigner();
      const airdropContractWithSigner = airdropContract?.connect(signer);
      try {
        const isApproved = await airdropContractWithSigner?.isApprovedForAll(
          address,
          generatedNFTContract?.address
        );
        if (!isApproved) {
          const approveTokenTx =
            await airdropContractWithSigner?.setApprovalForAll(
              generatedNFTContract?.address,
              true
            );
          await approveTokenTx?.wait();
        }
      } catch (error) {
        console.log("Error setting approval for all: ", error);
      }
    },
    [generatedNFTContract, airdropContract, account]
  );

  return (
    <GeneratedNFTContext.Provider
      value={{
        mintNFT,
        getOwnedTokens,
        getAllTokens,
        getAirdropBalance,
        setApprovalForAll,
      }}
    >
      {children}
    </GeneratedNFTContext.Provider>
  );
};

export const useGeneratedNFT = () => useContext(GeneratedNFTContext);
