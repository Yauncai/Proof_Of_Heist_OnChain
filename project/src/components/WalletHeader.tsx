import React, { useState } from 'react';
import { Wallet, Wifi } from 'lucide-react';

const WalletHeader: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress('0x742d...4A2f');
    }, 1000);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Network Status */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-gray border border-neon-green/30 rounded-lg">
        <div className="network-dot"></div>
        <Wifi className="w-4 h-4 text-neon-green" />
        <span className="text-sm text-gray-300 font-mono">Ethereum</span>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="neon-button px-6 py-2 rounded-lg font-mono font-bold flex items-center gap-2 hover:neon-glow transition-all duration-300"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full"></div>
              <span className="text-neon-green font-mono text-sm">{walletAddress}</span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletHeader;