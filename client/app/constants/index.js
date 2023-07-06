import airdrop from "/public/assets/airdrop.svg";
import wallet from "/public/assets/wallet.svg";
import home from "/public/assets/home.svg";
import generative from "/public/assets/generative.svg";
import gallery from "/public/assets/gallery.svg";

export const MENU = [
  {
    name: "Home",
    path: "/",
    icon: home,
    disabled: false,
    link: "/",
  },
  {
    name: "Airdrop",
    path: "/airdrop",
    icon: airdrop,
    disabled: false,
    link: "/airdrop",
  },
  {
    name: "Generative AI",
    path: "/generative",
    icon: generative,
    disabled: false,
    link: "/generative",
  },
  {
    name: "Wallet",
    path: "/wallet",
    icon: wallet,
    disabled: false,
    link: "/wallet",
  },
  {
    name: "Gallery",
    path: "/gallery",
    icon: gallery,
    disabled: false,
    link: "/gallery",
  },
];
