"use client";
import Image from "next/image";
import CustomButton from "../components/CustomButton";

const Mint = () => {
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
              className="w-80 h-10 bg-gray-100 rounded-full text-center text-gray-600 text-2xl font-bold lg:w-96"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <CustomButton
          btnType="button"
          title="Mint NFT (0.01 ETH)"
          styles="mt-[50px] text-2xl"
          handleClick={() => {}}
        />
      </div>
    </>
  );
};

export default Mint;
