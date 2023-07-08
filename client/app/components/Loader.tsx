import React from "react";
import Image from "next/image";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-10 h-screen bg-[rgba(0, 0, 0, 0.7)] flex items-center justify-center flex-col">
      <Image
        className="h-80 w-80 object-contain "
        src="/assets/loader.gif"
        width={0}
        height={0}
        alt="Loader"
      />
      <p className="mt-[20px] font-bold text-[20px] text-white text-center">
        Transaction is in progress <br /> Please wait...
      </p>
    </div>
  );
};

export default Loader;
