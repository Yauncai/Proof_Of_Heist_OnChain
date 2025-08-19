import React, { useState } from 'react';
import { Grid, Eye, Calendar, Hash, ExternalLink, X } from 'lucide-react';

interface NFT {
  id: string;
  name: string;
  image: string;
  description: string;
  mintDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTGalleryProps {
  ownedNFTs: NFT[];
  onBack: () => void;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ ownedNFTs, onBack }) => {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

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
      case 'Common': return 'shadow-gray-400/20';
      case 'Rare': return 'shadow-blue-400/20';
      case 'Epic': return 'shadow-purple-400/20';
      case 'Legendary': return 'shadow-yellow-400/20';
      default: return 'shadow-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:border-neon-green hover:text-neon-green transition-all duration-300"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <Grid className="w-8 h-8 text-neon-green" />
              <h1 className="cyber-font text-3xl font-bold text-white neon-text">
                NFT GALLERY
              </h1>
            </div>
          </div>
          <div className="text-gray-400 font-mono">
            {ownedNFTs.length} NFT{ownedNFTs.length !== 1 ? 's' : ''} owned
          </div>
        </div>

        {ownedNFTs.length === 0 ? (
          <div className="text-center py-20">
            <Grid className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No NFTs Yet</h3>
            <p className="text-gray-500">Complete quizzes to mint your first Proof of Heist NFT</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ownedNFTs.map((nft) => (
              <div
                key={nft.id}
                onClick={() => setSelectedNFT(nft)}
                className={`bg-dark-gray border-2 ${getRarityColor(nft.rarity)} rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${getRarityGlow(nft.rarity)} group`}
              >

                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>

                
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-lg truncate">{nft.name}</h3>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {nft.mintDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        
        {selectedNFT && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-dark-gray border border-neon-green/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-white">{selectedNFT.name}</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <img
                      src={selectedNFT.image}
                      alt={selectedNFT.name}
                      className="w-full rounded-lg border border-gray-700"
                    />
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded border ${getRarityColor(selectedNFT.rarity)} font-bold`}>
                        {selectedNFT.rarity}
                      </div>
                      <button className="flex items-center gap-2 text-neon-green hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        View on OpenSea
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                      <p className="text-gray-400 leading-relaxed">{selectedNFT.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-neon-green" />
                          <span className="text-gray-400">Token ID:</span>
                          <span className="text-white font-mono">{selectedNFT.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-neon-green" />
                          <span className="text-gray-400">Minted:</span>
                          <span className="text-white">{selectedNFT.mintDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Attributes</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedNFT.attributes.map((attr, index) => (
                          <div key={index} className="bg-black/50 border border-gray-700 rounded-lg p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              {attr.trait_type}
                            </div>
                            <div className="text-white font-medium">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;