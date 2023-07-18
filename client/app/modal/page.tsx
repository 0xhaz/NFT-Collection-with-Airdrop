import Image from "next/image";
import React from "react";
import CustomButton from "../components/CustomButton";

type ModalProps = {
  isLoading: boolean;
  tokenId: number;
  tokenURI: string;
  handleClick: () => void;
  metadata?: any;
};

const Modal = ({
  isLoading,
  tokenId,
  tokenURI,
  handleClick,
  metadata,
}: ModalProps) => {
  return (
    <div className="p-6 flex">
      <div className="w-1/2">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 rounded-lg">Loading...</div>
        ) : (
          <Image
            src={tokenURI}
            alt={`NFT ${tokenId}`}
            width={500}
            height={500}
            className="w-full h-auto mb-4"
          />
        )}
      </div>
      <div className="w-1/2 px-4">
        <h2 className="text-2xl font-bold">NFT #{tokenId.toString()}</h2>
        {metadata?.attributes?.map((attribute: any) => (
          <div key={attribute.trait_type} className="flex justify-between">
            <p className="text-xl">{attribute.trait_type}</p>
            <p className="text-xl">{attribute.value}</p>
          </div>
        ))}
      </div>
      <CustomButton
        btnType="button"
        title="Close"
        styles="mt-[50px] text-2xl"
        handleClick={handleClick}
      />
    </div>
  );
};

export default Modal;
