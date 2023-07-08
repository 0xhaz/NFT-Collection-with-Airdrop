"use client";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import { generateMerkleTree } from "../utils/generate-merkle-tree";
import keccak256 from "ethers/lib/utils";
import { useContract, useAccount, NFTDataProvider } from "./index";

type Proof = ethers.Bytes[];

interface AirdropContextProps {
  claimAirdrop: (proof: Proof) => Promise<void>;
  canClaim: (proof: Proof) => Promise<boolean>;
  burnToken: (tokenId: number) => Promise<void>;
  getOwnedTokens: (owner: string) => Promise<number[]>;
  merkleTree: MerkleTree | null;
}

export const NFTAirdropDataContext = createContext<AirdropContextProps>({
  claimAirdrop: async () => {},
  canClaim: async () => false,
  burnToken: async () => {},
  getOwnedTokens: async () => [],
  merkleTree: null,
});

export type NFTAirdropDataProviderProps = {
  children: JSX.Element;
};

export const NFTAirdropProvider = ({
  children,
}: NFTAirdropDataProviderProps): JSX.Element => {
  const { airdropContract } = useContract();
  const { account, accountProvider } = useAccount();
  const [merkleTree, setMerkleTree] = useState<MerkleTree | null>(null);
  // console.log("Account: ", account);
  // console.log("AirDropContract: ", airdropContract);

  useEffect(() => {
    if (!account) return;
    generateMerkleTree().then(tree => setMerkleTree(tree));
  }, []);

  const claimAirdrop = useCallback(
    async (proof: Proof) => {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = airdropContract?.connect(signer);
      try {
        await contractWithSigner?.claim(proof);
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
        merkleTree,
      }}
    >
      {children}
    </NFTAirdropDataContext.Provider>
  );
};

export const useNFTAirdrop = () => useContext(NFTAirdropDataContext);
