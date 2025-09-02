import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Clock, Target, Heart, CheckCircle, XCircle } from 'lucide-react';
import { getWriteContract } from '../lib/web3';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple' | 'boolean';
}

interface QuizGameProps {
  onComplete: (success: boolean) => void;
  questions: Question[];
}

const QuizGame: React.FC<QuizGameProps> = ({ onComplete, questions }) => {
  const { isConnected } = useAccount();
  const [disconnected, setDisconnected] = useState(false);
  // Disconnect detection: if wallet disconnects during quiz, end game as failed
  useEffect(() => {
    if (!isConnected) {
      setDisconnected(true);
      setTimeout(() => onComplete(false), 2000); // Give user time to see the message
    }
  }, [isConnected]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  
  if (disconnected) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">Wallet Disconnected</div>
          <div className="text-lg text-gray-300">You have been disconnected from the game.<br/>Please reconnect your wallet to try again.</div>
        </div>
      </div>
    );
  }
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-gray-300 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-2">Loading questions...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult]);

  const handleTimeUp = () => {
    setWrongAnswers(prev => prev + 1);
    setShowResult(true);
    setIsCorrect(false);
    
    setTimeout(async () => {
      if (wrongAnswers + 1 >= 3) {
        try {
          const contract = await getWriteContract();
          const totalWrong = wrongAnswers + 1;
          const finalScore = Math.max(0, questions.length - totalWrong);
          await (await contract.submitScore(finalScore)).wait();
        } catch {}
        onComplete(false);
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    
    if (!correct) {
      setWrongAnswers(prev => prev + 1);
    }

    setTimeout(async () => {
      if (!correct && wrongAnswers + 1 >= 3) {
        try {
          const contract = await getWriteContract();
          const totalWrong = wrongAnswers + 1;
          const finalScore = Math.max(0, questions.length - totalWrong);
          await (await contract.submitScore(finalScore)).wait();
        } catch {}
        onComplete(false);
      } else if (currentQuestion >= questions.length - 1) {
        try {
          const contract = await getWriteContract();
          const totalWrong = wrongAnswers + (correct ? 0 : 1);
          const finalScore = Math.max(0, questions.length - totalWrong);
          await (await contract.submitScore(finalScore)).wait();
        } catch {}
        onComplete(true);
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
  };

  const getAnswerButtonClass = (index: number) => {
    let baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-300 font-medium ";
    
    if (showResult) {
      if (index === questions[currentQuestion].correctAnswer) {
        baseClass += "border-neon-green bg-neon-green/20 text-neon-green neon-glow-sm";
      } else if (index === selectedAnswer && index !== questions[currentQuestion].correctAnswer) {
        baseClass += "border-red-500 bg-red-500/20 text-red-400";
      } else {
        baseClass += "border-gray-600 bg-gray-800/50 text-gray-500";
      }
    } else {
      baseClass += "border-gray-600 bg-dark-gray hover:border-neon-green hover:bg-neon-green/10 text-gray-300 hover:text-white";
    }

    return baseClass;
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 p-6 bg-dark-gray border border-neon-green/30 rounded-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-green" />
              <span className="font-mono text-white">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-mono text-white">
                {3 - wrongAnswers} attempts left
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-neon-green'}`} />
            <span className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
            <div 
              className="bg-neon-green h-3 rounded-full transition-all duration-500 neon-glow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-dark-gray border border-neon-green/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={getAnswerButtonClass(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neon-green font-bold">
                    {questions[currentQuestion].type === 'boolean' 
                      ? (index === 0 ? 'T' : 'F')
                      : String.fromCharCode(65 + index)
                    }.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className="text-center">
            <div className={`flex items-center justify-center gap-3 text-3xl font-bold mb-4 ${isCorrect ? 'text-neon-green' : 'text-red-400'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="w-8 h-8" />
                  CORRECT!
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8" />
                  INCORRECT!
                </>
              )}
            </div>
            {!isCorrect && (
              <div className="text-red-400 font-mono">
                Wrong answers: {wrongAnswers}/3
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGame;