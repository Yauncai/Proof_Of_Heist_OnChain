import React, { useEffect, useState } from 'react';
import { Wallet, Wifi } from 'lucide-react';
import { BrowserProvider } from 'ethers';

const WalletHeader: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkLabel, setNetworkLabel] = useState('Unknown');

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) return;
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const accounts: string[] = await provider.send('eth_accounts', []);
      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        const addr = accounts[0];
        setWalletAddress(addr.slice(0, 6) + '...' + addr.slice(-4));
      }
      const net = await provider.getNetwork();
      setNetworkLabel(`${net.name || 'Chain'} (${Number(net.chainId)})`);
    } catch (e) {
      // ignore
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const handler = async () => {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts: string[] = await provider.send('eth_accounts', []);
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          const addr = accounts[0];
          setWalletAddress(addr.slice(0, 6) + '...' + addr.slice(-4));
          const net = await provider.getNetwork();
          setNetworkLabel(`${net.name || 'Chain'} (${Number(net.chainId)})`);
        } else {
          setIsConnected(false);
          setWalletAddress('');
        }
      } catch {}
    };
    (window as any).ethereum.on?.('accountsChanged', handler);
    (window as any).ethereum.on?.('chainChanged', handler);
    handler();
    return () => {
      (window as any).ethereum.removeListener?.('accountsChanged', handler);
      (window as any).ethereum.removeListener?.('chainChanged', handler);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-gray border border-neon-green/30 rounded-lg">
        <div className="network-dot"></div>
        <Wifi className="w-4 h-4 text-neon-green" />
        <span className="text-sm text-gray-300 font-mono">{networkLabel}</span>
      </div>

      
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