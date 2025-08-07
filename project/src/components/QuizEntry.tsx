import React from 'react';
import {ethers, randomBytes} from "ethers";
import ProofOfHeistABI from '../contracts/ProofOfHeist.json';
import { Play, Zap, Trophy, Target } from 'lucide-react';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// interface QuizEntryProps {
//   onStartQuiz: () => void;
// }

const QuizEntry: React.FC = () => {

   const onStartQuiz = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ProofOfHeistABI.abi, signer);

      const dummyAnswers = Array(16).fill(1);
      const nonce = BigInt("0x" + Array.from(randomBytes(8)).map(b => b.toString(16).padStart(2, '0')).join(''));     
       const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["uint8[]", "uint256"], [dummyAnswers, nonce])
      );

      const tx = await contract.startQuiz(commitment, {
        value: ethers.parseEther("0.01")
      });

      await tx.wait();

      console.log("Quiz started!");

      localStorage.setItem("quizAnswers", JSON.stringify(dummyAnswers));
      localStorage.setItem("quizNonce", nonce.toString());

    } catch (err) {
      console.error("Failed to start quiz:", err);
    }
  };


  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Entry Card */}
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

          {/* Quiz Stats */}
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

          {/* Entry Fee */}
          <div className="bg-black/30 border border-neon-green/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Entry Fee</h3>
                <p className="text-sm text-gray-400">Required to participate in the quiz</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-green">0.01 ETH</div>
                <div className="text-sm text-gray-400">≈ $38,34</div>
              </div>
            </div>
          </div>

          {/* Rules */}
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

          {/* Start Button */}
          <button
            onClick={onStartQuiz}
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