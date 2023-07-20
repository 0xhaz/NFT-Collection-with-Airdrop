"use client";
import React, { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import { useAccount, useNFTAirdrop } from "../context";
import Loader from "../components/Loader";
import Image from "next/image";
import { generateMerkleTree } from "../utils/generate-merkle-tree";
import { arrayify, keccak256 } from "ethers/lib/utils";
import { MerkleTree } from "merkletreejs";

interface TreeProps {
  treeInstance: MerkleTree | null;
}

type Proof = ArrayLike<number>[];

const Airdrop = () => {
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState<Proof>([]);
  const [nftTokens, setNftTokens] = useState<number[]>([]);
  const [claimStatus, setClaimStatus] = useState<boolean>(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const { account } = useAccount();
  const { getNFTTokens, claimAirdrop } = useNFTAirdrop();

  const generateProof = async (userAddress: string): Promise<boolean> => {
    const userLeaf = keccak256(userAddress);
    const tree = await generateMerkleTree();
    const proof = tree.getHexProof(userLeaf);

    const validProof = proof.map(item => arrayify(item));
    setProof(validProof);

    return tree.verify(proof, userLeaf, tree.getHexRoot());
  };

  const checkEligibility = async () => {
    setLoading(true);

    try {
      if (account) {
        const isUserEligible = await generateProof(account);
        setIsEligible(isUserEligible);
        setIsButtonClicked(true);
      }
    } catch (error) {
      console.log("Error checking eligibility: ", error);
    }
    setLoading(false);
  };

  const claimAirDrop = async () => {
    setLoading(true);
    try {
      if (account) {
        await claimAirdrop(proof);
        setClaimStatus(true);
      }
    } catch (error) {
      console.log("Error claiming airdrop: ", error);
    }
    setLoading(false);
  };

  const displayTokens = () => {
    if (nftTokens.length === 0) {
      return <p>{`You don&apos;t have any NFT`}</p>;
    }

    if (claimStatus) {
      return <p>You have already claimed your NFT</p>;
    }

    if (!isEligible) {
      return <p>You are not eligible for the airdrop</p>;
    }

    if (isEligible === true && isButtonClicked === true) {
      return (
        <div>
          <p>Congratulations! You are eligible for the Airdrop.</p>
          <p>You have {nftTokens.toString()} NFTs to claimed!</p>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    const fetchNFTTokens = async () => {
      if (account) {
        const tokens = await getNFTTokens(account);
        setNftTokens(tokens);
      }
    };

    fetchNFTTokens();
  }, [account, getNFTTokens]);

  return (
    <>
      <div className="mt-10 lg:m-0 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:mt-32 lg:justify-start">
        <Image
          className="w-80 object-contain pb-10 lg:h-50 lg:w-86"
          src="/assets/airdrop.gif"
          alt="NFT Airdrop"
          width={500}
          height={500}
        />
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
          Claim Your Airdrop
        </h1>

        <div className="flex flex-col justify-center ">
          {!isButtonClicked ? (
            <>
              <CustomButton
                btnType="button"
                title="Check Eligibility"
                handleClick={checkEligibility}
                styles="w-[500px] text-2xl"
              />
            </>
          ) : isEligible ? (
            <>
              {displayTokens()}
              {claimStatus ? (
                <p></p>
              ) : (
                <CustomButton
                  btnType="submit"
                  title="Claim Airdrop"
                  handleClick={claimAirDrop}
                  styles="w-[500px] text-2xl"
                />
              )}
            </>
          ) : (
            <p>Sorry! You are not eligible for the Airdrop.</p>
          )}
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default Airdrop;
