"use client";
import { createContext, useContext, useCallback } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

type Proof = ethers.Bytes[];

interface AirdropContextProps {
  claimAirdrop: (proof: Proof) => Promise<void>;
  canClaim: (proof: Proof) => Promise<boolean>;
  burnToken: (tokenId: number) => Promise<void>;
  getOwnedTokens: (owner: string) => Promise<number[]>;
}

export const NFTAirdropDataContext = createContext<AirdropContextProps>({
  claimAirdrop: async () => {},
  canClaim: async () => false,
  burnToken: async () => {},
  getOwnedTokens: async () => [],
});

export type NFTAirdropDataProviderProps = {
  children: JSX.Element;
};

export const NFTAirdropProvider = ({
  children,
}: NFTAirdropDataProviderProps): JSX.Element => {
  const { airdropContract } = useContract();
  const { account, accountProvider } = useAccount();

  // console.log("Account: ", account);
  // console.log("AirDropContract: ", airdropContract);

  const claimAirdrop = useCallback(
    async (proof: Proof) => {
      if (!account) {
        console.log("No account");
        return;
      }
      const signer = accountProvider?.getSigner();
      const contractWithSigner = airdropContract?.connect(signer);
      try {
        const convertedProof = proof.map(item => ethers.utils.arrayify(item));
        await contractWithSigner?.claimAirdrop(convertedProof);
      } catch (error) {
        console.log("Error claiming airdrop: ", error);
        throw error;
      }
    },
    [airdropContract, account]
  );

  const canClaim = useCallback(
    async (proof: Proof) => {
      const signer = accountProvider?.getSigner();

      try {
        const canClaim = await airdropContract
          ?.connect(signer)
          ?.canClaim(proof);
        return canClaim || false;
      } catch (error) {
        console.log("Error getting NFT: ", error);
        throw error;
      }
    },
    [airdropContract]
  );

  const burnToken = useCallback(
    async (tokenId: number) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = airdropContract?.connect(signer);
      try {
        await contractWithSigner?.burn(tokenId);
      } catch (error) {
        console.log("Error burning token: ", error);
        throw error;
      }
    },
    [airdropContract, account]
  );

  const getOwnedTokens = useCallback(async () => {
    const signer = accountProvider?.getSigner();
    try {
      const ownedTokens = await airdropContract?.connect(signer).getNFT();
      return ownedTokens || [];
    } catch (error) {
      console.log("Error getting NFT: ", error);
      throw error;
    }
  }, [airdropContract]);

  return (
    <NFTAirdropDataContext.Provider
      value={{
        claimAirdrop,
        canClaim,
        burnToken,
        getOwnedTokens,
      }}
    >
      {children}
    </NFTAirdropDataContext.Provider>
  );
};

export const useNFTAirdrop = () => useContext(NFTAirdropDataContext);
