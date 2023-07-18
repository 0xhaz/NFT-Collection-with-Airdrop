import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../modal/page";

type NFTCardProps = {
  tokenId: number;
  tokenURI: string;
};

const NFTCard = ({ tokenId, tokenURI }: NFTCardProps) => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // This effect is used to determine when the image has loaded
    setLoading(false);
  }, []);

  const toggleModal = () => {
    setShowModal(prev => !prev);
  };

  return (
    <>
      <div
        className="w-[250px] h-[300px] border border-gray-200 rounded-lg p-4 flex flex-col mt-4 cursor-pointer"
        onClick={toggleModal}
      >
        {loading ? (
          <div className="w-full h-full bg-gray-200 rounded-lg">Loading...</div>
        ) : (
          <Image
            src={tokenURI}
            alt={`NFT ${tokenId}`}
            width={300}
            height={300}
            className="w-full h-auto mb-4"
          />
        )}

        <div className="text-center mt-2">
          <p className="text-sm font-bold">Punks #{tokenId.toString()}</p>
        </div>
      </div>

      {showModal && (
        <Modal
          isLoading={false}
          tokenId={tokenId}
          tokenURI={tokenURI}
          handleClick={toggleModal}
        />
      )}
    </>
  );
};

export default NFTCard;
