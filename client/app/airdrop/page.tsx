"use client";
import React, { useState } from "react";
import CustomButton from "../components/CustomButton";

const Airdrop = () => {
  const [isEligible, setIsEligible] = useState(false);

  const checkEligibility = () => {
    setIsEligible(true);
  };

  const claimAirDrop = () => {
    setIsEligible(false);
  };

  return (
    <div className="flex flex-col items-center space-y-6 mt-10">
      <h1 className="text-3xl font-bold">Claim Your Airdrop</h1>

      <div className="flex flex-col items-center justify-center">
        {isEligible ? (
          <p>Congratulations! You are eligible for the Airdrop.</p>
        ) : (
          <p>Sorry! You are not eligible for the Airdrop.</p>
        )}

        <CustomButton
          btnType="button"
          title="Check Eligibility"
          handleClick={checkEligibility}
          styles="w-[500px]"
        />

        {isEligible && (
          <CustomButton
            btnType="submit"
            title="Claim Airdrop"
            handleClick={claimAirDrop}
            styles="w-[500px]"
          />
        )}
      </div>
    </div>
  );
};

export default Airdrop;
