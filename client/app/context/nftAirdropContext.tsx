"use client";
import { createContext, useContext, useCallback } from "react";
import { ethers } from "ethers";
import { useContract, useAccount } from "./index";

type Proof = ethers.Bytes[];

interface AirdropContextProps {
  claimAirdrop: (proof: Proof) => Promise<void>;
  canClaim: (proof: Proof) => Promise<boolean>;
  burnToken: (tokenId: number) => Promise<void>;
  getNFTTokens: (address: string) => Promise<number[]>;
  getClaimStatus: (address: string) => Promise<boolean>;
}

export const NFTAirdropDataContext = createContext<AirdropContextProps>({
  claimAirdrop: async () => {},
  canClaim: async () => false,
  burnToken: async () => {},
  getNFTTokens: async () => [],
  getClaimStatus: async () => false,
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

  const getNFTTokens = useCallback(
    async (address: string) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = airdropContract?.connect(signer);
      try {
        const tokenOwned = await airdropContract?.getNftBalance(address);
        return tokenOwned || [];
      } catch (error) {
        console.log("Error getting NFT: ", error);
        throw error;
      }
    },
    [airdropContract]
  );

  const getClaimStatus = useCallback(
    async (address: string) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = airdropContract?.connect(signer);
      try {
        const claimStatus = await airdropContract?.getClaimStatus(address);
        return claimStatus || false;
      } catch (error) {
        console.log("Error getting NFT: ", error);
        throw error;
      }
    },
    [airdropContract]
  );

  return (
    <NFTAirdropDataContext.Provider
      value={{
        claimAirdrop,
        canClaim,
        burnToken,
        getNFTTokens,
        getClaimStatus,
      }}
    >
      {children}
    </NFTAirdropDataContext.Provider>
  );
};

export const useNFTAirdrop = () => useContext(NFTAirdropDataContext);
