import React, { useState, useEffect } from 'react';
import { Shield, Clock, Trophy, Zap, Users, Target } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const GameInterface: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gamePhase, setGamePhase] = useState<'playing' | 'result' | 'leaderboard'>('playing');

  const questions: Question[] = [
    {
      id: 1,
      question: "Which NFT collection was famously 'heisted' in a smart contract exploit in 2022?",
      options: ["Bored Apes", "CryptoPunks", "Azuki", "Moonbirds"],
      correctAnswer: 0,
      difficulty: 'medium'
    },
    {
      id: 2,
      question: "What is the most common method used in NFT marketplace exploits?",
      options: ["Phishing", "Smart Contract Bugs", "Social Engineering", "All of the above"],
      correctAnswer: 3,
      difficulty: 'hard'
    },
    {
      id: 3,
      question: "Which blockchain has the highest number of reported NFT thefts?",
      options: ["Ethereum", "Solana", "Polygon", "Binance Smart Chain"],
      correctAnswer: 0,
      difficulty: 'easy'
    }
  ];

  useEffect(() => {
    if (timeLeft > 0 && gamePhase === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, gamePhase]);

  const handleTimeUp = () => {
    setShowResult(true);
    setStreak(0);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + (timeLeft * 10));
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGamePhase('leaderboard');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (gamePhase === 'leaderboard') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold font-mono mb-2">HEIST COMPLETE</h2>
            <p className="text-green-400 text-xl">Final Score: {score.toLocaleString()}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="text-green-400">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="text-yellow-400">{Math.max(streak, 3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="text-blue-400">87%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">Global Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "CryptoSleuth", score: 15420 },
                  { rank: 2, name: "NFTDetective", score: 14890 },
                  { rank: 3, name: "You", score: score },
                  { rank: 4, name: "BlockchainHawk", score: 12100 },
                  { rank: 5, name: "DigitalForensic", score: 11750 }
                ].map((player, index) => (
                  <div key={index} className={`flex justify-between items-center p-2 rounded ${player.name === 'You' ? 'bg-green-500/20 border border-green-500/50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">#{player.rank}</span>
                      <span className={player.name === 'You' ? 'text-green-400 font-bold' : ''}>{player.name}</span>
                    </div>
                    <span className="text-yellow-400">{player.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-green-500/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold font-mono">PROOF OF HEIST</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-mono">{score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="font-mono">x{streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-mono">1,247 online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main game area */}
      <main className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress and timer */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-mono">Question {currentQuestion + 1} of {questions.length}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(questions[currentQuestion].difficulty)}`}>
                  {questions[currentQuestion].difficulty.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className={`font-mono text-xl ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 leading-relaxed">
              {questions[currentQuestion].question}
            </h2>
            
            {/* Answer options */}
            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium ";
                
                if (showResult) {
                  if (index === questions[currentQuestion].correctAnswer) {
                    buttonClass += "border-green-500 bg-green-500/20 text-green-400";
                  } else if (index === selectedAnswer && index !== questions[currentQuestion].correctAnswer) {
                    buttonClass += "border-red-500 bg-red-500/20 text-red-400";
                  } else {
                    buttonClass += "border-gray-600 bg-gray-800 text-gray-400";
                  }
                } else {
                  buttonClass += "border-gray-600 bg-gray-800 hover:border-green-500 hover:bg-green-500/10 text-white";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <span className="font-mono text-green-400 mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result feedback */}
          {showResult && (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${selectedAnswer === questions[currentQuestion].correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === questions[currentQuestion].correctAnswer ? 'CORRECT!' : 'INCORRECT!'}
              </div>
              {selectedAnswer === questions[currentQuestion].correctAnswer && (
                <div className="text-yellow-400 font-mono">
                  +{timeLeft * 10} points • Streak x{streak + 1}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-scan"></div>
      </div>
    </div>
  );
};

export default GameInterface;