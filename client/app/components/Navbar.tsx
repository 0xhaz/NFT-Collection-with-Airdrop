import React from "react";

const Navbar = () => {
  return (
    <div>
      <header className="items-center flex justify-between">
        <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
          The{" "}
          <span className="font-extrabold underline decoration-pink-600/50">
            NFT Punks
          </span>{" "}
          Collection
        </h1>
        <button className="rounded-full bg-rose-400 text-white px-4 py-2 text-xs font-bold lg:px-5 lg:py-3 lg:text-base">
          Sign in
        </button>
      </header>

      <hr className="my-2 border" />
    </div>
  );
};

export default Navbar;
