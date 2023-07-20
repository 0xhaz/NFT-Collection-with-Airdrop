import Image from "next/image";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import NFTModal from "../NFTModal/page";

type Attribute = {
  token_id: number | string;
  trait_type: string;
  value: string;
  attributeList?: Attribute[];
};

type AiAttribute = {
  token_id: number | string;
  name: string;
  description: string;
  image: string;
};

type NFTCardProps = {
  tokenId: number;
  tokenURI: string;
  attributes?: Attribute[] | undefined;
  textData?: AiAttribute | undefined;
  handleClick: () => void;
};

const NFTCard = ({
  tokenId,
  tokenURI,
  attributes,
  handleClick,
  textData,
}: NFTCardProps) => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const toggleModal = () => {
    setShowModal(prev => !prev);
  };

  const handleCardClick = () => {
    handleClick();
    setSelectedTokenId(tokenId);
  };

  return (
    <>
      <div
        className="w-[250px] h-[300px] border border-gray-200 rounded-lg p-4 flex flex-col mt-4 cursor-pointer mb-2"
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
          {textData ? (
            <p className="text-sm font-bold">{textData.name}</p>
          ) : (
            <p className="text-sm font-bold">Punks #{tokenId.toString()}</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onRequestClose={toggleModal}
        contentLabel="NFT Modal"
        className="w-[850px] h-[600px] bg-black border rounded-lg m-auto p-0"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center"
        ariaHideApp={false}
      >
        {showModal && (
          <NFTModal
            isLoading={loading}
            tokenId={tokenId}
            tokenURI={tokenURI}
            handleClick={toggleModal}
            attributes={attributes}
            textData={textData}
          />
        )}
      </Modal>
    </>
  );
};

export default NFTCard;
