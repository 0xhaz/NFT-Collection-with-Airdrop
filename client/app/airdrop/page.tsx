"use client";
import React, { useState, useEffect } from "react";
import CustomButton from "../components/CustomButton";
import { useAccount, useNFTAirdrop } from "../context";
import Loader from "../components/Loader";
import Image from "next/image";
import { keccak256 } from "ethers/lib/utils";
import { generateMerkleTree, verifyProof } from "../utils/generate-merkle-tree";
import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";

interface TreeProps {
  treeInstance: MerkleTree | null;
}

type Proof = ethers.Bytes[];

const Airdrop = () => {
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState<Proof>([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const { account } = useAccount();
  const { canClaim, claimAirdrop, merkleTree } = useNFTAirdrop();

  const generateProof = async () => {
    if (account) {
      const tree = await generateMerkleTree();
      const proof = tree.getHexProof(keccak256(account));
      const convertedProof: Proof = proof.map(item =>
        ethers.utils.arrayify(item)
      );
      // console.log("Proof: ", convertedProof);
      setProof(convertedProof);
      return convertedProof;
    }
  };

  const checkEligibility = async () => {
    setLoading(true);

    try {
      if (account) {
        const eligible = verifyProof(
          proof.map(item => ethers.utils.hexlify(item)),
          account,
          merkleTree as MerkleTree
        );
        console.log("Eligible: ", eligible);
        setIsEligible(eligible);
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
      if (proof.length > 0) {
        await claimAirdrop(proof);
        setIsEligible(false);
      }
    } catch (error) {
      console.log("Error claiming airdrop: ", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!account) return;
    if (isButtonClicked) {
      checkEligibility();
    }
  }, [isButtonClicked]);

  useEffect(() => {
    if (!account) return;

    generateProof();
  }, [account]);

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
          {isEligible && isButtonClicked ? (
            <p>Congratulations! You are eligible for the Airdrop.</p>
          ) : isButtonClicked && !isEligible ? (
            <p>Sorry! You are not eligible for the Airdrop.</p>
          ) : null}

          <CustomButton
            btnType="button"
            title="Check Eligibility"
            handleClick={checkEligibility}
            styles="w-[500px] text-2xl"
          />

          {isEligible && (
            <CustomButton
              btnType="submit"
              title="Claim Airdrop"
              handleClick={claimAirDrop}
              styles="w-[500px] text-2xl"
            />
          )}
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default Airdrop;
