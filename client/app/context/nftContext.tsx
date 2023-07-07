import { useContext, useCallback, createContext } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

type MintAmount = ethers.BigNumber;

interface NFTContextProps {
  mintNft: (mintAmount: MintAmount) => Promise<void>;
  getNft: (owner: string) => Promise<number[]>;
}

export const NFTDataContext = createContext<NFTContextProps>({
  mintNft: async () => {},
  getNft: async () => [],
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
    async (mintAmount: MintAmount) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = nftContract?.connect(signer);
      try {
        await contractWithSigner?.mint(mintAmount);
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

  return (
    <NFTDataContext.Provider
      value={{
        mintNft,
        getNft,
      }}
    >
      {children}
    </NFTDataContext.Provider>
  );
};

export const useNFTData = () => useContext(NFTDataContext);
