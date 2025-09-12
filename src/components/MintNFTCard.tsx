
import React from 'react';
import { Transaction, TransactionButton, TransactionStatus } from '@coinbase/onchainkit/transaction';

import { ethers } from 'ethers';
import ProofOfHeistABIJson from '../abi/ProofOfHeist.json';
import { Abi } from 'viem';
import { useAccount } from 'wagmi';

interface MintNFTCardProps {
  onMintSuccess: (nftData: any) => void;
}

const MintNFTCard: React.FC<MintNFTCardProps> = ({ onMintSuccess }) => {
  const { address } = useAccount();

  // Create mint transaction call
  // Remove unused context from useMiniKit
  // Ensure ABI is typed correctly for OnchainKit Transaction
  const mintCall = {
    address: import.meta.env.VITE_CONTRACT_ADDRESS,
    abi: ProofOfHeistABIJson.abi as Abi,
    functionName: 'mintNFT',
    args: [],
  };

  // Handler for transaction success
  const handleTransactionSuccess = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        ProofOfHeistABIJson.abi,
        provider
      );
      const balance = await contract.balanceOf(address);
      if (balance > 0) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, balance - 1);
        const tokenURI = await contract.tokenURI(tokenId);
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        onMintSuccess({ tokenId, tokenURI, metadata });
      }
    } catch (err) {
      console.error('Failed to fetch NFT metadata after mint:', err);
    }
  };

  return (
    <div className="flex justify-center my-8">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-yellow-400 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Mint Your Proof of Heist NFT</h2>
        <Transaction
          calls={[mintCall]}
          onSuccess={handleTransactionSuccess}
          isSponsored={false} // Set to true for gasless, if supported
        >
          <TransactionButton text="Mint NFT" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-xl mb-4" />
          <TransactionStatus className="mb-2" />
        </Transaction>
        <p className="text-gray-300 text-center mt-2">Your NFT will be minted to your connected wallet on Base.</p>
      </div>
    </div>
  );
};

export default MintNFTCard;
