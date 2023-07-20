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
  getTokenURIByOwner: (
    address: string
  ) => Promise<{ tokenIds: number[]; tokenURIs: string[] }>;
}

export const GeneratedNFTContext = createContext<GeneratedNFTContextProps>({
  mintNFT: async () => {},
  getOwnedTokens: async () => [],
  getAllTokens: async () => [],
  getAirdropBalance: async () => 0,
  setApprovalForAll: async (address: string) => {},
  getTokenURIByOwner: async () => ({
    tokenIds: [],
    tokenURIs: [],
  }),
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

  const getTokenURIByOwner = useCallback(
    async (address: string) => {
      if (!accountProvider) throw new Error("Account provider not found");
      const signer = accountProvider?.getSigner();
      const contractWithSigner = generatedNFTContract?.connect(signer);
      try {
        const walletData = await contractWithSigner?.getTokenURIsByAddress(
          address
        );
        // console.log("walletData: ", walletData);
        const tokenIds: number[] = walletData[0];
        const tokenURIs: string[] = walletData[1];

        const validTokenIds: number[] = [];
        const validTokenURIs: string[] = [];

        for (let i = 0; i < tokenURIs.length; i++) {
          const tokenURI = tokenURIs[i];
          if (
            typeof tokenURI === "string" &&
            tokenURI.startsWith("https://ipfs.io")
          ) {
            validTokenIds.push(tokenIds[i]);
            validTokenURIs.push(tokenURI);
          }
        }

        return {
          tokenIds: validTokenIds,
          tokenURIs: validTokenURIs,
        };
      } catch (error) {
        console.log("Error getting token URI: ", error);
        throw error;
      }
    },
    [generatedNFTContract, account]
  );

  return (
    <GeneratedNFTContext.Provider
      value={{
        mintNFT,
        getOwnedTokens,
        getAllTokens,
        getAirdropBalance,
        setApprovalForAll,
        getTokenURIByOwner,
      }}
    >
      {children}
    </GeneratedNFTContext.Provider>
  );
};

export const useGeneratedNFT = () => useContext(GeneratedNFTContext);
