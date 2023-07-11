"use client";
import { useContext, useCallback, createContext } from "react";
import { BigNumber, ethers } from "ethers";
import { useContract, useAccount } from "./index";

type MintAmount = ethers.BigNumber;

interface NFTContextProps {
  mintNft: (mintAmount: number) => Promise<void>;
  getNft: (owner: string) => Promise<number[]>;
  getCost: () => Promise<string>;
  getTotalSupply: () => Promise<number>;
}

export const NFTDataContext = createContext<NFTContextProps>({
  mintNft: async () => {},
  getNft: async () => [],
  getCost: async () => ethers.utils.formatEther("0"),
  getTotalSupply: async () => 0,
});

export type NFTDataProviderProps = {
  children: JSX.Element;
};

export const NFTDataProvider = ({
  children,
}: NFTDataProviderProps): JSX.Element => {
  const { nftContract } = useContract();
  const { account, accountProvider } = useAccount();

  const mintNft = useCallback(
    async (mintAmount: number) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = nftContract?.connect(signer);
      const COST = await nftContract?.getCost();

      try {
        const costBigNumber = ethers.BigNumber.from(COST.toString());
        const transaction = await contractWithSigner?.mint(mintAmount, {
          value: costBigNumber.mul(mintAmount),
        });
        await transaction?.wait();
      } catch (error) {
        console.log("Error minting NFT: ", error);
        throw error;
      }
    },
    [nftContract, account]
  );

  const getNft = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    try {
      const ownedTokens = await nftContract?.connect(signer).getNFT();
      return ownedTokens || [];
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [nftContract]);

  const getCost = useCallback(async () => {
    try {
      const cost = await nftContract?.getCost();
      return ethers.utils.formatEther(cost);
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [nftContract]);

  const getTotalSupply = useCallback(async () => {
    try {
      const totalSupply = await nftContract?.getTotalSupply();
      return totalSupply || [];
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [nftContract]);

  return (
    <NFTDataContext.Provider
      value={{
        mintNft,
        getNft,
        getCost,
        getTotalSupply,
      }}
    >
      {children}
    </NFTDataContext.Provider>
  );
};

export const useNFT = () => useContext(NFTDataContext);
