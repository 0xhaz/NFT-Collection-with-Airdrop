import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";

type NFTCardProps = {
  tokenId: number;
  tokenURI: string;
};

const NFTCard = ({ tokenId, tokenURI }: NFTCardProps) => {
  useEffect(() => {
    console.log("tokenURI:", tokenURI);
  }, [tokenURI]);

  return (
    <div className="w-[200px] h-[300px] border border-gray-200 rounded-lg p-4 flex flex-col mt-4">
      {tokenURI ? (
        <img
          src={tokenURI}
          alt={`NFT ${tokenId}`}
          width={300}
          height={300}
          className="w-full h-auto"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg">Loading...</div>
      )}

      <div className="text-center mt-2">
        <p className="text-sm font-bold">{tokenId.toString()}</p>
      </div>
    </div>
  );
};

export default NFTCard;
