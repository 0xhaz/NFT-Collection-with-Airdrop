"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MENU } from "../constants";

interface IconProps {
  styles?: string;
  name?: string;
  icon?: string;
  isActive?: string;
  disabled?: boolean;
  handleClick?: () => void;
}

const Icon: React.FC<IconProps> = ({
  styles = "",
  name = "",
  icon = "",
  isActive,
  disabled,
  handleClick,
}) => {
  return (
    <div
      className={`w-[48px] h-[48px] rounded-[10px] ${
        isActive &&
        isActive === name &&
        "bg-gradient-to-br from-yellow-400 to-purple-600"
      } flex justify-center items-center ${
        !disabled && "cursor-pointer"
      } ${styles}`}
      onClick={handleClick}
    >
      {!isActive ? (
        <Image
          src={icon}
          width={30}
          height={30}
          alt={name}
          className="w-1/2 h-1/2"
        />
      ) : (
        <Image
          src={icon}
          width={30}
          height={30}
          alt={name}
          className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"}`}
        />
      )}
    </div>
  );
};

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    // set active icon to the current path
    const isActive = MENU.find(item => item.path === pathname);
    if (isActive) {
      setIsActive(isActive.name);
    }
  }, [pathname]);

  return (
    <div className="lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500">
      <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
        <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
          <Image
            className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
            src="/assets/4.png"
            width={500}
            height={500}
            alt="NFT Punk Logo"
          />
        </div>

        <div className="text-center p-5 space-y-2">
          <h1 className="text-4xl font-bold text-white">NFT Punks</h1>
          <h2 className="text-xl text-gray-300">
            A collection of 10,000 unique NFTs with airdrop for generative
          </h2>
        </div>

        <div className="flex  mb-10 lg:mb-0 lg:flex-col justify-around items-stretch outline-none gap-2 mt-12">
          {MENU.map(item => (
            <div
              key={item.name}
              className={`flex items-center gap-2 cursor-pointer ${
                isActive === item.name ? "text-white" : "text-purple-200"
              }`}
              onClick={() => {
                if (!item.disabled) {
                  setIsActive(item.name);
                  router.push(`${item.path}`);
                }
              }}
            >
              <Icon
                {...item}
                isActive={isActive}
                styles={
                  !isActive || isActive !== item.name ? "text-color-600" : ""
                }
              />
              <span className="text-[16px] ml-2 mt-1">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
