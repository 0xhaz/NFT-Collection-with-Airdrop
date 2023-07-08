"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

type Account = string | null;
type AccountWeb3Provider = any | null;
type Wallet = boolean;
type Signer = null;

type AccountContextValue = {
  account?: Account;
  accountProvider: AccountWeb3Provider;
  connect: () => void;
  disconnect: () => void;
};

type AccountProviderProps = {
  children: React.ReactNode;
};

const AccountContext = createContext<AccountContextValue>(
  {} as AccountContextValue
);

export const AccountProvider = ({
  children,
}: AccountProviderProps): JSX.Element => {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountProvider, setAccountProvider] =
    useState<AccountWeb3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const getWeb3Modal = () => {
    const modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
          },
        },
      },
    });
    return modal;
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      return alert("Please install MetaMask");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      }

      const networkId = await window.ethereum.request({
        method: "net_version",
      });

      if (
        networkId !== process.env.NEXT_PUBLIC_NETWORK_ID &&
        process.env.NEXT_PUBLIC_ENVIRONMENT !== "local"
      ) {
        const confirmed = window.confirm(
          "Please switch to the Sepolia network"
        );
        if (confirmed) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: process.env.NEXT_PUBLIC_NETWORK_ID }],
          });
        }
      }

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      });
    } catch (error) {
      console.log("Error retrieving accounts: ", error);
    }
  };

  const connect = async () => {
    try {
      const modal = getWeb3Modal();
      const connecion = await modal.connect();
      const provider = new ethers.providers.Web3Provider(connecion);
      const accounts = await provider.listAccounts();

      setAccount(accounts[0]);
    } catch (error) {
      console.log("Error connecting wallet: ", error);
    }
  };

  const disconnect = async () => {
    try {
      const modal = getWeb3Modal();
      modal.clearCachedProvider();
      setAccount(null);
      setAccountProvider(null);
      setSigner(null);
    } catch (error) {
      console.log("Error disconnecting wallet: ", error);
    }
  };

  const getWalletProvider = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setAccountProvider(provider);
    } else {
      console.log("No ethereum provider found");
    }
  };

  useEffect(() => {
    getWalletProvider();
    checkIfWalletIsConnected();
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        accountProvider,
        connect,
        disconnect,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
