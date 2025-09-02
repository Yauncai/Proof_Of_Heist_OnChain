import React from 'react';
import { Wifi } from 'lucide-react';
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
  Address,
  EthBalance,
} from '@coinbase/onchainkit/identity';

const WalletHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      {/* Network info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-gray border border-neon-green/30 rounded-lg">
        <div className="network-dot"></div>
        <Wifi className="w-4 h-4 text-neon-green" />
        <span className="text-sm text-gray-300 font-mono">Base Sepolia</span>
      </div>

      {/* Unified wallet UI */}
      <Wallet>
        <ConnectWallet
          className="neon-button px-6 py-2 rounded-lg font-mono font-bold flex items-center gap-2 hover:neon-glow transition-all duration-300"
          disconnectedLabel="Connect Wallet"
        >
          <Avatar className="h-6 w-6" />
          <Name className="text-neon-green" />
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name className="text-neon-green"/>
            <Address className="text-gray-300" />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>

      {/* Contract address display for user visibility */}
      <div className="ml-4">
        <p className="text-xs sm:text-sm font-mono text-neon-green bg-black/70 px-3 py-2 rounded-lg break-all border border-neon-green/30 shadow-lg mt-2">
          Contract: {import.meta.env.VITE_CONTRACT_ADDRESS || '0xYourContractAddress'}
        </p>
      </div>
    </div>
  );
};

export default WalletHeader;