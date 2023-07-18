"use client";
import React, { useState, useEffect } from "react";
import {
  useNFT,
  useAccount,
  useNFTAirdrop,
  useGeneratedNFT,
} from "../context/";
import NFTCard from "../components/NFTCard";
import Loader from "../components/Loader";
import axios from "axios";
import Image from "next/image";

const Gallery = () => {
  const { getWallet } = useNFT();
  const { account } = useAccount();
  const { getAirdropBalance } = useGeneratedNFT();
  const { isTokenExists } = useNFTAirdrop();
  const [walletData, setWalletData] = useState<{
    tokenIds: number[];
    tokenURIs: string[];
  }>({
    tokenIds: [],
    tokenURIs: [],
  });
  const [airdropTokens, setAirdropTokens] = useState<number>(0);
  const [tokenExists, setTokenExists] = useState<boolean>(false);

  const fetchWallet = async () => {
    try {
      if (!account) return;
      const wallet = await getWallet(account);

      const metadata = wallet.tokenURIs.map(async tokenURI => {
        const { data } = await axios.get(
          tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
        );
        const imageUrl = data.image;

        return imageUrl;
      });

      const metadataResponse = await Promise.all(metadata);

      setWalletData(prev => ({
        ...prev,
        tokenIds: wallet.tokenIds,
        tokenURIs: metadataResponse,
      }));
    } catch (error) {
      console.log("Error fetching wallet: ", error);
    }
  };

  const fetchAirdropTokens = async () => {
    try {
      if (!account) return;
      const tokens = await getAirdropBalance(account);
      setAirdropTokens(tokens);
    } catch (error) {
      console.log("Error fetching airdrop tokens: ", error);
    }
  };

  const checkTokenExists = async () => {
    try {
      if (!account) return;
      const tokenExists = await isTokenExists(account);
      setTokenExists(tokenExists);
    } catch (error) {
      console.log("Error checking token exists: ", error);
    }
  };

  useEffect(() => {
    if (!account) return;
    fetchWallet();
    fetchAirdropTokens();
    checkTokenExists();
  }, [account, getWallet]);

  if (!account || walletData.tokenIds.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <div className="mt-10 lg:mt-40 flex flex-col space-y-6 lg:space-y-0 ">
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold mb-10">
          My Collections
        </h1>
        <div className="flex flex-1 ">
          <h1 className="font-extralight sm:w-80">
            My{" "}
            <span className="font-extrabold underline decoration-pink-600/50">
              NFT Punks{" "}
            </span>{" "}
            Collection
          </h1>
        </div>
        <hr className="my-2 border" />
        <div className="grid grid-cols-3 gap-4">
          {walletData?.tokenIds?.map((tokenId, index) => {
            const imageUrl = walletData?.tokenURIs[index].replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
            return (
              <NFTCard key={tokenId} tokenId={tokenId} tokenURI={imageUrl} />
            );
          })}
        </div>

        {tokenExists && (
          <>
            <div className="flex flex-1">
              <h1 className="font-extralight sm:w-80 mt-4">
                My{" "}
                <span className="font-extrabold underline decoration-pink-600/50">
                  Airdrops{" "}
                </span>{" "}
              </h1>
            </div>
            <hr className="my-2 border" />
            <div className="flex items-center justify-center">
              <div>
                <Image
                  className="w-50 object-contain mt-4 pb-4 lg:h-50 lg:w-86"
                  src="/assets/airdrop.gif"
                  alt="NFT Airdrop"
                  width={200}
                  height={200}
                />
              </div>
              <p className="ml-4">
                You have {airdropTokens.toString()} airdrops left{" "}
              </p>
              <div className="flex flex-1 justify-center"></div>
            </div>
          </>
        )}

        <div className="flex flex-1 ">
          <h1 className="font-extralight sm:w-80">
            My{" "}
            <span className="font-extrabold underline decoration-pink-600/50">
              Gen Arts{" "}
            </span>{" "}
            Collection
          </h1>
        </div>
        <hr className="my-2 border" />
      </div>
    </>
  );
};

export default Gallery;
