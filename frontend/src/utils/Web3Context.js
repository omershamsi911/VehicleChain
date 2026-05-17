// src/utils/Web3Context.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  ADDRESSES,
  GOV_TOKEN_ABI,
  VEHICLE_REGISTRY_ABI,
  VEHICLE_HISTORY_ABI,
  THEFT_REPORT_ABI,
  OWNERSHIP_TRANSFER_ABI,
  DISPUTE_DAO_ABI,
} from "./contracts";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider,   setProvider]   = useState(null);
  const [signer,     setSigner]     = useState(null);
  const [account,    setAccount]    = useState(null);
  const [network,    setNetwork]    = useState(null);
  const [contracts,  setContracts]  = useState({});
  const [connecting, setConnecting] = useState(false);
  const [error,      setError]      = useState(null);

  const buildContracts = useCallback((signerOrProvider) => {
    return {
      govToken:          new ethers.Contract(ADDRESSES.GOV_TOKEN,          GOV_TOKEN_ABI,          signerOrProvider),
      vehicleRegistry:   new ethers.Contract(ADDRESSES.VEHICLE_REGISTRY,   VEHICLE_REGISTRY_ABI,   signerOrProvider),
      vehicleHistory:    new ethers.Contract(ADDRESSES.VEHICLE_HISTORY,    VEHICLE_HISTORY_ABI,    signerOrProvider),
      theftReport:       new ethers.Contract(ADDRESSES.THEFT_REPORT,       THEFT_REPORT_ABI,       signerOrProvider),
      ownershipTransfer: new ethers.Contract(ADDRESSES.OWNERSHIP_TRANSFER, OWNERSHIP_TRANSFER_ABI, signerOrProvider),
      disputeDAO:        new ethers.Contract(ADDRESSES.DISPUTE_DAO,        DISPUTE_DAO_ABI,        signerOrProvider),
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer  = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const _network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setNetwork(_network);
      setContracts(buildContracts(_signer));
      
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }, [buildContracts]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setNetwork(null);
    setContracts({});
  }, []);

  // Listen for account / chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else connectWallet();
    };
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged",    handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged",    handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  // Auto-connect if already authorized
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) connectWallet();
      });
    }
  }, [connectWallet]);

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  const formatToken = (wei) => {
    if (!wei) return "0";
    return parseFloat(ethers.formatEther(wei)).toFixed(2);
  };

  
  const parseToken = (amount) => ethers.parseEther(String(amount));

  return (
    <Web3Context.Provider value={{
      provider, signer, account, network, contracts,
      connecting, error,
      connectWallet, disconnectWallet,
      shortAddress, formatToken, parseToken,
      isConnected: !!account,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
};
