import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Share2, Eye } from 'lucide-react';

interface NFTRevealProps {
  onComplete: (nft: any) => void;
  onViewGallery: () => void;
}

const NFTReveal: React.FC<NFTRevealProps> = ({ onComplete, onViewGallery }) => {
  const [isRevealing, setIsRevealing] = useState(true);
  const [revealedNFT, setRevealedNFT] = useState<any>(null);

  // Sample NFT data - in real app this would come from blockchain
  const heistNFTs = [
    {
      id: "POH-001",
      name: "The OpenSea Exploit",
      image: "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "A legendary NFT commemorating the infamous OpenSea marketplace exploit of February 2022, where attackers purchased high-value NFTs at outdated prices.",
      rarity: "Legendary",
      attributes: [
        { trait_type: "Heist Type", value: "Marketplace Exploit" },
        { trait_type: "Year", value: "2022" },
        { trait_type: "Platform", value: "OpenSea" },
        { trait_type: "Damage", value: "$1.7M" },
        { trait_type: "Method", value: "Smart Contract" },
        { trait_type: "Complexity", value: "Expert" }
      ]
    },
    {
      id: "POH-002", 
      name: "The BAYC Instagram Hack",
      image: "https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "An epic NFT representing the Bored Ape Yacht Club Instagram hack that resulted in millions of dollars in stolen NFTs through phishing attacks.",
      rarity: "Epic",
      attributes: [
        { trait_type: "Heist Type", value: "Social Engineering" },
        { trait_type: "Year", value: "2022" },
        { trait_type: "Platform", value: "Instagram" },
        { trait_type: "Damage", value: "$3M" },
        { trait_type: "Method", value: "Phishing" },
        { trait_type: "Complexity", value: "Advanced" }
      ]
    },
    {
      id: "POH-003",
      name: "The Premint Vulnerability", 
      image: "https://images.pexels.com/photos/5380792/pexels-photo-5380792.jpeg?auto=compress&cs=tinysrgb&w=400",
      description: "A rare NFT documenting the Premint platform hack where a cross-site scripting vulnerability led to widespread wallet compromises.",
      rarity: "Rare",
      attributes: [
        { trait_type: "Heist Type", value: "XSS Vulnerability" },
        { trait_type: "Year", value: "2022" },
        { trait_type: "Platform", value: "Premint" },
        { trait_type: "Damage", value: "$375K" },
        { trait_type: "Method", value: "Cross-Site Scripting" },
        { trait_type: "Complexity", value: "Intermediate" }
      ]
    }
  ];

  useEffect(() => {
    // Simulate NFT reveal process
    const revealTimer = setTimeout(() => {
      const randomNFT = heistNFTs[Math.floor(Math.random() * heistNFTs.length)];
      const mintDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
      
      setRevealedNFT({
        ...randomNFT,
        mintDate
      });
      setIsRevealing(false);
    }, 3000);

    return () => clearTimeout(revealTimer);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'shadow-gray-400/50';
      case 'Rare': return 'shadow-blue-400/50';
      case 'Epic': return 'shadow-purple-400/50';
      case 'Legendary': return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  if (isRevealing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          {/* Revealing Animation */}
          <div className="relative mb-8">
            <div className="w-64 h-64 mx-auto bg-dark-gray border-2 border-neon-green rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent animate-pulse"></div>
              
              {/* Spinning particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-neon-green rounded-full animate-ping"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
              
              <Sparkles className="w-16 h-16 text-neon-green animate-spin" />
            </div>
          </div>

          <h2 className="cyber-font text-4xl font-bold mb-4 neon-text">
            REVEALING NFT...
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Your Proof of Heist NFT is being generated on the blockchain
          </p>
          
          {/* Progress indicator */}
          <div className="w-64 mx-auto bg-gray-800 rounded-full h-2">
            <div className="bg-neon-green h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-neon-green/10 border border-neon-green rounded-full mb-4">
            <Sparkles className="w-12 h-12 text-neon-green" />
          </div>
          <h2 className="cyber-font text-5xl font-bold mb-4 neon-text">
            NFT REVEALED!
          </h2>
          <p className="text-gray-400 text-xl">
            Your exclusive Proof of Heist NFT has been minted successfully
          </p>
        </div>

        {/* NFT Display */}
        <div className="bg-dark-gray border border-neon-green/30 rounded-2xl p-8 mb-8 neon-glow">
          <div className="grid md:grid-cols-2 gap-8">
            {/* NFT Image */}
            <div className="space-y-4">
              <div className={`relative rounded-xl overflow-hidden border-2 ${getRarityColor(revealedNFT.rarity)} shadow-2xl ${getRarityGlow(revealedNFT.rarity)}`}>
                <img
                  src={revealedNFT.image}
                  alt={revealedNFT.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded border ${getRarityColor(revealedNFT.rarity)} font-bold bg-black/80 backdrop-blur-sm`}>
                    {revealedNFT.rarity}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-600 rounded-lg text-gray-400 hover:border-neon-green hover:text-neon-green transition-all duration-300">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-600 rounded-lg text-gray-400 hover:border-neon-green hover:text-neon-green transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* NFT Metadata */}
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">{revealedNFT.name}</h3>
                <p className="text-gray-400 leading-relaxed">{revealedNFT.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-3">Attributes</h4>
                <div className="grid grid-cols-2 gap-3">
                  {revealedNFT.attributes.map((attr: any, index: number) => (
                    <div key={index} className="bg-black/50 border border-gray-700 rounded-lg p-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">
                        {attr.trait_type}
                      </div>
                      <div className="text-white font-medium">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Minted on</div>
                <div className="text-white font-mono">{revealedNFT.mintDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewGallery}
            className="flex items-center justify-center gap-3 px-8 py-4 border border-neon-green rounded-xl text-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 font-bold"
          >
            <Eye className="w-5 h-5" />
            View Gallery
          </button>
          <button
            onClick={() => onComplete(revealedNFT)}
            className="px-8 py-4 bg-neon-green text-black rounded-xl font-bold hover:bg-neon-green/80 transition-all duration-300 neon-glow"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTReveal;