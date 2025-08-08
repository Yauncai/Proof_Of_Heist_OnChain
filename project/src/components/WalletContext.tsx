import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import ProofOfHeistABI from '../contracts/ProofOfHeist.json';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  mintNFT: (tokenId?: number) => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}


const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Your smart contract details
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = ProofOfHeistABI.abi;

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const address = accounts[0];
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        
        setIsConnected(true);
        setWalletAddress(address);
        setProvider(ethersProvider);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    } else {
      alert('MetaMask not detected. Please install it to continue.');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setProvider(null);
  };

  const mintNFT = async (tokenId?: number) => {
    if (!provider || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Random NFT selection logic
      const randomTokenId = tokenId || Math.floor(Math.random() * 1000) + 1;
      
      // Call mint function
      const tx = await contract.mint(walletAddress, randomTokenId);
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      console.log('NFT minted successfully!', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Minting failed:', error);
      throw error;
    }
  };

  const value = {
    isConnected,
    walletAddress,
    provider,
    connectWallet,
    disconnectWallet,
    mintNFT,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};