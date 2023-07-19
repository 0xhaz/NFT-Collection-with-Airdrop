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
import axios, { all } from "axios";
import Image from "next/image";

type Attribute = {
  token_id: number | string;
  trait_type: string;
  value: string;
  attributes?: Attribute[] | undefined;
};

const Gallery = () => {
  const { getWallet } = useNFT();
  const { account } = useAccount();
  const { getAirdropBalance } = useGeneratedNFT();
  const { isTokenExists } = useNFTAirdrop();
  const [walletData, setWalletData] = useState<{
    tokenIds: number[];
    tokenURIs: string[];
    metadata: string[];
  }>({
    tokenIds: [],
    tokenURIs: [],
    metadata: [],
  });
  const [airdropTokens, setAirdropTokens] = useState<number>(0);
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const fetchWallet = async () => {
    try {
      if (!account) return;
      const wallet = await getWallet(account);

      const metadata = wallet.tokenURIs.map(async tokenURI => {
        const imageUrl = tokenURI?.replace?.(
          "ipfs://",
          "https://ipfs.io/ipfs/"
        );

        if (imageUrl) {
          const { data } = await axios.get(imageUrl);
          return data.image;
        }

        return "";
      });

      const metadataResponse = await Promise.all(metadata);

      setWalletData(prev => ({
        ...prev,
        tokenIds: wallet.tokenIds,
        tokenURIs: metadataResponse,
        metadata: metadataResponse,
      }));
    } catch (error) {
      console.log("Error fetching wallet: ", error);
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

  const fetchAirdropTokens = async () => {
    try {
      if (!account) return;
      const tokens = await getAirdropBalance(account);
      setAirdropTokens(tokens);
    } catch (error) {
      console.log("Error fetching airdrop tokens: ", error);
    }
  };

  // fetch attributes from tokenURI metadata
  const fetchMetadata = async () => {
    try {
      if (!account) return;
      const walletData = await getWallet(account);

      let data = await Promise.all(
        walletData.tokenURIs.map(async tokenURI => {
          if (tokenURI.startsWith("ipfs://")) {
            const ipfsUrl = tokenURI.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
            const { data } = await axios.get(ipfsUrl);
            return data;
          }
        })
      );

      return data;
    } catch (error) {
      console.log("Error fetching Metadata: ", error);
    }
  };

  useEffect(() => {
    if (!account) return;

    fetchWallet();
    checkTokenExists();
    fetchAirdropTokens();
  }, [account, getWallet]);

  useEffect(() => {
    if (walletData.metadata.length === 0) return;

    const fetchAttributesForAllNFTs = async () => {
      try {
        if (!account) return;

        let metadata = await fetchMetadata();

        const allAttributes: Attribute[] = [];

        metadata?.forEach((data, index) => {
          const attributesForNFT: Attribute[] = data.attributes.map(
            (attr: any) => {
              return {
                token_id: walletData.tokenIds[index].toString(),
                trait_type: attr.trait_type,
                value: attr.value,
              };
            }
          );

          allAttributes.push(...attributesForNFT);
        });

        setAttributes(allAttributes);
      } catch (error) {
        console.log("Error fetching attributes: ", error);
      }
    };

    fetchAttributesForAllNFTs();
  }, [walletData.metadata]);

  if (!account || walletData.tokenIds.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <div className="mt-10  flex flex-col space-y-6 lg:space-y-0 ">
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold mb-10">
          My{" "}
          <span className="font-extrabold underline decoration-pink-600/50">
            Collections
          </span>
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
              <NFTCard
                key={tokenId}
                tokenId={tokenId}
                tokenURI={imageUrl}
                attributes={attributes.filter(
                  attr => attr.token_id === tokenId.toString()
                )}
                handleClick={() => setSelectedTokenId(null)}
              />
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
                You have {airdropTokens?.toString()} airdrops left{" "}
              </p>
              <div className="flex flex-1 justify-center"></div>
            </div>
          </>
        )}

        <div className="flex flex-1 mt-4 ">
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
