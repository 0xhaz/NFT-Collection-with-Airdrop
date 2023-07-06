"use client";
import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import Image from "next/image";

const Airdrop = () => {
  const [isEligible, setIsEligible] = useState(false);

  const checkEligibility = () => {
    setIsEligible(true);
  };

  const claimAirDrop = () => {
    setIsEligible(false);
  };

  return (
    <>
      <div className="mt-10 lg:m-0 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:mt-32 lg:justify-start">
        <Image
          className="w-80 object-contain pb-10 lg:h-50 lg:w-86"
          src="/assets/airdrop.gif"
          alt="NFT Airdrop"
          width={500}
          height={500}
        />
        <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
          Claim Your Airdrop
        </h1>

        <div className="flex flex-col justify-center ">
          {isEligible ? (
            <p>Congratulations! You are eligible for the Airdrop.</p>
          ) : (
            <p>Sorry! You are not eligible for the Airdrop.</p>
          )}

          <CustomButton
            btnType="button"
            title="Check Eligibility"
            handleClick={checkEligibility}
            styles="w-[500px] text-2xl"
          />

          {isEligible && (
            <CustomButton
              btnType="submit"
              title="Claim Airdrop"
              handleClick={claimAirDrop}
              styles="w-[500px] text-2xl"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Airdrop;
