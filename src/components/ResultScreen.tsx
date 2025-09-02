import React from 'react';
import { Trophy, RotateCcw, Award, Sparkles, Zap } from 'lucide-react';

import MintNFTCard from './MintNFTCard';

interface ResultScreenProps {
  success: boolean;
  score: number;
  onRestart: () => void;
  onMintSuccess: (nft: any) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ success, score, onRestart, onMintSuccess }) => {
  if (success) {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="relative inline-block">
              <Trophy className="w-32 h-32 text-neon-green mx-auto neon-glow animate-pulse" />
              <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-neon-green/30 rounded-full animate-spin-slow"></div>
            </div>
          </div>

          <div className="bg-dark-gray border border-neon-green/50 rounded-2xl p-8 mb-8 neon-glow">
            <h2 className="cyber-font text-5xl font-black text-white mb-4 neon-text">
              HEIST COMPLETE!
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Congratulations! You've successfully demonstrated your knowledge of NFT security breaches. 
              You've earned the right to mint your exclusive "Proof of Heist" NFT.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/50 border border-neon-green/20 rounded-lg p-4">
                <Award className="w-6 h-6 text-neon-green mx-auto mb-2" />
                <div className="text-lg font-bold text-white">Expert Level</div>
                <div className="text-sm text-gray-400">Security Knowledge</div>
              </div>
              <div className="bg-black/50 border border-neon-green/20 rounded-lg p-4">
                <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">Rare NFT</div>
                <div className="text-sm text-gray-400">Unlocked</div>
              </div>
            </div>


            {/* Show MintNFTCard only if score > 14 */}
            {score > 14 ? (
              <MintNFTCard onMintSuccess={onMintSuccess} />
            ) : (
              <div className="text-center text-red-400 font-bold mb-4">You need at least 15 correct answers to mint the NFT.</div>
            )}

            <p className="text-sm text-gray-500">
              Your NFT will be minted to your connected wallet
            </p>
          </div>

          <button
            onClick={onRestart}
            className="px-8 py-3 border border-gray-600 rounded-lg text-gray-400 hover:border-neon-green hover:text-neon-green transition-all duration-300"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 border-4 border-red-500/50 rounded-full mx-auto flex items-center justify-center">
              <span className="text-6xl text-red-400">×</span>
            </div>
          </div>
        </div>

        <div className="bg-dark-gray border border-red-500/30 rounded-2xl p-8 mb-8">
          <h2 className="cyber-font text-4xl font-black text-white mb-4">
            HEIST FAILED
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Don't give up! Even the best investigators need multiple attempts to crack the case. 
            Study the patterns, learn from the mistakes, and try again.
          </p>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-mono">
              You made 3 incorrect answers. The heist security was too strong this time.
            </p>
          </div>

          <button
            onClick={onRestart}
            className="w-full border-2 border-neon-green bg-transparent text-neon-green py-4 rounded-xl font-bold text-xl cyber-font hover:bg-neon-green hover:text-black transition-all duration-300 flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            TRY AGAIN
          </button>
        </div>

        <p className="text-gray-500 text-sm">
          Each attempt helps you learn more about NFT security patterns
        </p>
      </div>
    </div>
  );
};

export default ResultScreen;