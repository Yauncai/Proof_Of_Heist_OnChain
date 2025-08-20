import React from 'react';
import { Play, Zap, Trophy, Target } from 'lucide-react';
import { getWriteContract } from '../lib/web3';

interface QuizEntryProps {
  onStartQuiz: () => void;
}

const QuizEntry: React.FC<QuizEntryProps> = ({ onStartQuiz }) => {
  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-dark-gray border border-neon-green/30 rounded-2xl p-8 neon-glow-sm">
          <div className="text-center mb-8">
            <h2 className="cyber-font text-4xl font-black text-white mb-4 neon-text">
              ENTER THE HEIST
            </h2>
            <p className="text-lg text-gray-400 max-w-md mx-auto">
              Test your knowledge of NFT security breaches and blockchain exploits. 
              Only the most skilled investigators will earn their proof.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-black/50 rounded-lg border border-neon-green/20">
              <Target className="w-6 h-6 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">16</div>
              <div className="text-sm text-gray-400">Questions</div>
            </div>
            <div className="text-center p-4 bg-black/50 rounded-lg border border-neon-green/20">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-gray-400">Max Wrong</div>
            </div>
            <div className="text-center p-4 bg-black/50 rounded-lg border border-neon-green/20">
              <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">NFT</div>
              <div className="text-sm text-gray-400">Reward</div>
            </div>
          </div>

          <div className="bg-black/30 border border-neon-green/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Entry Fee</h3>
                <p className="text-sm text-gray-400">Required to participate in the quiz</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-green">0.001 ETH</div>
                <div className="text-sm text-gray-400">Payable on-chain</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Quiz Rules</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-1">•</span>
                Answer 16 questions about NFT heists and blockchain security
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-1">•</span>
                You have 3 chances - quiz ends after 3 wrong answers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-1">•</span>
                Complete successfully to mint your "Proof of Heist\" NFT
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neon-green mt-1">•</span>
                Each question has a 30-second time limit
              </li>
            </ul>
          </div>

          <button
            onClick={async () => {
              try {
                const contract = await getWriteContract();
                const fee = await contract.ENTRY_FEE();
                const tx = await contract.enterGame({ value: fee });
                await tx.wait();
                onStartQuiz();
              } catch (e) {
                // handle in real flow with toasts
              }
            }}
            className="w-full neon-button py-4 rounded-xl font-bold text-lg cyber-font flex items-center justify-center gap-3 neon-glow hover:neon-glow-intense transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            START QUIZ
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            By starting the quiz, you agree to the entry fee and game rules
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizEntry;