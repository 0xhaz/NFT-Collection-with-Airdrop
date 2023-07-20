import Image from "next/image";
import React, { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";

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

type NFTModalProps = {
  isLoading: boolean;
  tokenId: number;
  tokenURI: string;
  handleClick: () => void;
  attributes?: Attribute[] | undefined;
  textData?: AiAttribute | undefined;
};

const NFTModal = ({
  isLoading,
  tokenId,
  tokenURI,
  handleClick,
  attributes,
  textData,
}: NFTModalProps) => {
  return (
    <div className="p-5 w-full h-auto">
      <div className="justify-between flex gap-5 text-center  ">
        <div className="w-1/2">
          {isLoading ? (
            <div className="w-full h-full bg-gray-200 rounded-lg">
              Loading...
            </div>
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
        <div className="w-1/2 md:ml-4 ">
          {textData ? (
            <>
              <h2 className="text-2xl font-bold">{textData.name}</h2>
              <div className="flex pt-10 justify-center">
                <p className="text-xl leading-10">{textData?.description}</p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">
                Punks #{tokenId.toString()}
              </h2>
              {attributes?.map((attribute: Attribute, index: number) => (
                <div key={index} className="flex justify-between">
                  <p className="text-xl leading-10">{attribute?.trait_type}</p>
                  <p className="text-xl leading-10">{attribute?.value}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center ">
        <CustomButton
          btnType="button"
          title="Close"
          styles="mt-[50px] w-[180px] text-2xl "
          handleClick={handleClick}
        />
      </div>
    </div>
  );
};

export default NFTModal;
