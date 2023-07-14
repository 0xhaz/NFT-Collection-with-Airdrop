"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Loader from "../components/Loader";
import { NFTStorage } from "nft.storage";
import { useAccount, useGeneratedNFT } from "../context";
import CustomButton from "../components/CustomButton";

const Generative = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [nft, setNft] = useState(null);
  const [nftName, setNftName] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [airdropBalance, setAirdropBalance] = useState<number>(0);
  const [nftImage, setNftImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { account } = useAccount();
  const { mintNFT, getAirdropBalance } = useGeneratedNFT();

  const generateImage = async () => {
    setMessage("Generating Image...");
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1`;
    try {
      const response = await axios({
        url: URL,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          inputs: nftDescription,
          options: { wait_for_model: true },
        }),
        responseType: "arraybuffer",
      });

      if (response.headers && response.headers["content-type"]) {
        const type = response.headers["content-type"];
        const data = response.data;

        const base64data = Buffer.from(data).toString("base64");
        const img = `data:${type};base64,` + base64data;
        setNftImage(img);

        return data;
      } else {
        throw new Error("No content type");
      }
    } catch (error) {
      console.log("Error generating image: ", error);
    }
  };

  const uploadImage = async (imageData: any) => {
    setMessage("Uploading Image...");

    if (!process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY) {
      console.error("No NFT Storage API Key found");
      return;
    }

    const nftStorage = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
    });

    const { ipnft } = await nftStorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: nftName,
      description: nftDescription,
    });

    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;
    console.log("URL: ", url);
    setUrl(url);

    return url;
  };

  const mintNftHandler = async (tokenURI: string) => {
    setMessage("Minting NFT...");

    try {
      await mintNFT(tokenURI);
      setMessage("NFT Minted Successfully");
    } catch (error) {
      console.log("Error minting NFT: ", error);
    }
  };

  const getBalance = async () => {
    if (account) {
      const balance = await getAirdropBalance(account);
      setAirdropBalance(balance);
      console.log("Balance: ", balance.toString());
    }
  };

  const handleGenerateImage = async () => {
    try {
      setIsWaiting(true);
      const imageData = await generateImage();
      const url = await uploadImage(imageData);
      setUrl(url || "");
      setIsWaiting(false);
    } catch (error) {
      console.log("Error generating image: ", error);
      setIsWaiting(false);
      setMessage("Error generating image");
    }
  };

  useEffect(() => {
    if (!account) return;
    getBalance();
  }, []);

  return (
    <>
      <div className="mt-10 lg:mt-40 flex flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold mb-10">
          Generative Art
        </h1>
        <div className="grid grid-cols-2 gap-6 ">
          <div className="justify-center items-center">
            <input
              type="text"
              placeholder="Create a name..."
              value={nftName}
              onChange={e => setNftName(e.target.value)}
              className="w-80 lg:h-14 bg-gray-100 rounded-md text-center text-gray-600 text-2xl font-bold lg:w-96"
            />
            <input
              type="text"
              placeholder="Create a description..."
              value={nftDescription}
              onChange={e => setNftDescription(e.target.value)}
              className="mt-4 w-80 h-20 lg:w-50 lg:h-40 bg-gray-100 rounded-md text-center text-gray-600 text-2xl font-bold lg:w-96"
            />
            <div className="flex justify-center mt-8">
              <CustomButton
                btnType="button"
                title="Create Image"
                styles="text-xl w-12 h-12  flex-1"
                handleClick={handleGenerateImage}
                disabled={isWaiting || !account}
              />
            </div>
            <div className="flex justify-center ">
              {airdropBalance > 0 ? (
                <CustomButton
                  btnType="button"
                  title={`Mint (${airdropBalance} left)`}
                  styles="text-xl h-12 w-22"
                  handleClick={() => mintNftHandler(url || "")}
                  disabled={isWaiting || !account}
                />
              ) : (
                <CustomButton
                  btnType="button"
                  title="Mint"
                  styles="text-xl h-12 w-22"
                  handleClick={() => mintNftHandler(url || "")}
                  disabled={isWaiting || !account}
                />
              )}
            </div>
          </div>
          <div className="border border-white object-cover h-full w-full ">
            {nftImage ? (
              <Image
                className=" object-cover h-full w-full"
                src={nftImage}
                alt="AI Generated Image"
                width={500}
                height={700}
              />
            ) : (
              <div className="flex justify-center items-center h-full">
                {isWaiting ? <Loader /> : <span>No image generated</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Generative;
