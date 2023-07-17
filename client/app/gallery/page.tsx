"use client";
import React, { useState, useEffect } from "react";
import { useNFT, useAccount, NFTDataProvider } from "../context/";
import NFTCard from "../components/NFTCard";
import Loader from "../components/Loader";
import axios from "axios";

const Gallery = () => {
  const { getWallet } = useNFT();
  const { account } = useAccount();
  const [walletData, setWalletData] = useState<{
    tokenIds: number[];
    tokenURIs: string[];
  }>({
    tokenIds: [],
    tokenURIs: [],
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        if (!account) return;
        const walletData = await getWallet(account);
        const updatedTokenURIs = await Promise.all(
          walletData.tokenURIs.map(async tokenURI => {
            if (tokenURI.startsWith("ipfs://")) {
              const ipfsUrl = `https://gateway.ipfs.io/ipfs/${tokenURI.replace(
                "ipfs://",
                ""
              )}`; // Append ".png" to the tokenURI

              const response = await axios.get(ipfsUrl);
              const json = response.data;
              return json.image;
            }
            return tokenURI;
          })
        );
        setWalletData({
          tokenIds: walletData.tokenIds,
          tokenURIs: updatedTokenURIs,
        });
        console.log("walletData: ", walletData);
      } catch (error) {
        console.log("Error fetching wallet: ", error);
      }
    };
    fetchWallet();
  }, [account, getWallet]);

  useEffect(() => {
    console.log("Wallet Ids: ", walletData.tokenIds);
    console.log("Wallet URIs: ", walletData.tokenURIs);
  }, [walletData]);

  // if (!account || walletData.tokenIds.length === 0) {
  //   return <Loader />;
  // }

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
            const tokenURI = walletData.tokenURIs[index];
            return (
              <NFTCard key={tokenId} tokenId={tokenId} tokenURI={tokenURI} />
            );
          })}
        </div>
        <div className="flex flex-1">
          <h1 className="font-extralight sm:w-80">
            My{" "}
            <span className="font-extrabold underline decoration-pink-600/50">
              Airdrops{" "}
            </span>{" "}
          </h1>
        </div>
        <div className="flex flex-1 ">
          <h1 className="font-extralight sm:w-80">
            My{" "}
            <span className="font-extrabold underline decoration-pink-600/50">
              Gen Arts{" "}
            </span>{" "}
            Collection
          </h1>
        </div>
      </div>
    </>
  );
};

export default Gallery;
