
import React from 'react';
import { NFTMintCardDefault } from '@coinbase/onchainkit/nft';
import { ethers } from 'ethers';
import ProofOfHeistABI from '../abi/ProofOfHeist.json';
import { useAccount } from 'wagmi';

interface MintNFTCardProps {
  onMintSuccess: (nftData: any) => void;
}

const MintNFTCard: React.FC<MintNFTCardProps> = ({ onMintSuccess }) => {
  const { address } = useAccount();

  // Handler for mint success
  const handleMintSuccess = async () => {
    try {
      // Connect to provider (assume window.ethereum or injected)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        ProofOfHeistABI.abi,
        provider
      );
      // Get balance to find the latest tokenId
      const balance = await contract.balanceOf(address);
      if (balance > 0) {
        // Get the latest tokenId owned by the user
        const tokenId = await contract.tokenOfOwnerByIndex(address, balance - 1);
        const tokenURI = await contract.tokenURI(tokenId);
        // Fetch metadata from tokenURI
        const response = await fetch(tokenURI);
        const metadata = await response.json();
        onMintSuccess({ tokenId, tokenURI, metadata });
      }
    } catch (err) {
      // Optionally handle error
      console.error('Failed to fetch NFT metadata after mint:', err);
    }
  };

  return (
    <div className="flex justify-center my-8">
      <NFTMintCardDefault
        contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS}
        onSuccess={handleMintSuccess}
      />
    </div>
  );
};

export default MintNFTCard;
