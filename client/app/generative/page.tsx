"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Loader from "../components/Loader";
import { useAccount } from "../context";
import CustomButton from "../components/CustomButton";

const Generative = () => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [nft, setNft] = useState(null);
  const [nftName, setNftName] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [nftImage, setNftImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { account } = useAccount();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (nftName === "" || nftDescription === "") {
      setMessage("Please fill in all fields");
    }
  };

  const generateImage = async () => {
    setMessage("Generating Image...");
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`;
    try {
      const response = await axios({
        url: URL,
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
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

  return (
    <>
      <div className="mt-10 lg:mt-40 flex flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold mb-10">
          Generative Art
        </h1>
        <div className="grid grid-cols-2 gap-6 ">
          <form onSubmit={() => {}} className="flex flex-col gap-4 ">
            <div className="justify-center items-center">
              <input
                type="text"
                placeholder="Create a name..."
                onChange={() => {}}
                className="w-80 lg:h-14 bg-gray-100 rounded-md text-center text-gray-600 text-2xl font-bold lg:w-96"
              />
              <input
                type="text"
                placeholder="Create a description..."
                onChange={() => {}}
                className="mt-4 w-80 h-20 lg:w-50 lg:h-40 bg-gray-100 rounded-md text-center text-gray-600 text-2xl font-bold lg:w-96"
              />
            </div>
            <div className="flex justify-center ">
              <CustomButton
                btnType="button"
                title="Create Image"
                styles="mt-[20px] text-xl w-22 h-12 lg:h-12 lg:w-20  flex-1"
                handleClick={() => {}}
                disabled={isWaiting || !account}
              />
            </div>
            <div className="flex justify-center">
              <CustomButton
                btnType="button"
                title="Mint"
                styles="mt-[10px] text-xl h-12 w-22"
                handleClick={() => {}}
                disabled={isWaiting || !account}
              />
            </div>
          </form>

          <div className="border border-white h-auto w-auto lg:h-[120] lg:w-[120]">
            {!isWaiting && nftImage ? (
              <Image
                className="w-80 object-cover pb-10 lg:h-40 lg:w-96 "
                src={nftImage}
                alt="AI Generated Image"
                width={500}
                height={500}
              />
            ) : isWaiting ? (
              <Loader />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Generative;
