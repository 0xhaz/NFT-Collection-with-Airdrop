"use client";
import Image from "next/image";
import CustomButton from "../components/CustomButton";
import { useNFT, useAccount } from "../context";
import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { BigNumber, ethers } from "ethers";

const Mint = () => {
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [mintAmount, setMintAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [cost, setCost] = useState<string>("");
  const { account } = useAccount();
  const { mintNft, getTotalSupply, getCost, getBalance } = useNFT();

  useEffect(() => {
    if (!account) return;
    fetchTotalSupply();
    fetchCost();
  }, [account]);

  const fetchTotalSupply = async () => {
    try {
      const supply = await getTotalSupply();
      setTotalSupply(supply);
    } catch (error) {
      console.log("Error fetching total supply: ", error);
    }
  };

  const fetchCost = async () => {
    try {
      const cost = await getCost();
      setCost(cost.toString());
    } catch (error) {
      console.log("Error fetching cost: ", error);
    }
  };

  const handleMintNft = async () => {
    try {
      setLoading(true);
      await mintNft(mintAmount);
      setTotalSupply(prevTotalSupply => prevTotalSupply + mintAmount);
      setLoading(false);
    } catch (error) {
      console.log("Error minting NFT: ", error);
    }
  };

  return (
    <>
      <div className="mt-40 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
        <Image
          className="w-80 object-cover pb-10 lg:h-40 lg:w-96"
          src="/assets/cryptopunks-guide.png"
          alt="NFT Punk"
          width={500}
          height={500}
        />
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
          The NFT Punks Club
        </h1>

        <div>
          <div className="mt-20">
            <input
              type="number"
              placeholder="Enter Amount"
              min={1}
              max={10}
              value={mintAmount}
              onChange={e => setMintAmount(parseInt(e.target.value))}
              className="w-80 h-10 bg-gray-100 rounded-full text-center text-gray-600 text-2xl font-bold lg:w-96"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-bounce pt-2 text-xl text-rose-400">
            Loading Minted Count...
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mt-4">
            <p className="text-gray-500">
              Total NFT's Minted: {totalSupply.toString()}
            </p>
          </div>
        </>
      )}

      {loading && <Loader />}

      <div className="flex justify-center">
        <CustomButton
          btnType="button"
          title={`Mint NFT (${cost.toString()} ETH)`}
          styles="mt-[50px] text-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          handleClick={handleMintNft}
          disabled={loading || !account}
        />
      </div>
    </>
  );
};

export default Mint;
