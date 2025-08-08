import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from  '../../firebase';
import { Clock, Target, Heart, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  originalCorrectIndex?: number; // Track original correct answer position
}

interface QuizGameProps {
  onComplete: (success: boolean) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Shuffle array function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle options and track correct answer position
  const shuffleQuestionOptions = (question: Question): Question => {
    const originalCorrectIndex = question.options.findIndex(option => option === question.answer);
    
    // Create array with indices to track positions
    const optionsWithIndices = question.options.map((option, index) => ({
      option,
      originalIndex: index
    }));
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(optionsWithIndices);
    
    // Find new position of correct answer
    const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIndex === originalCorrectIndex);
    
    return {
      ...question,
      options: shuffledOptions.map(item => item.option),
      originalCorrectIndex: newCorrectIndex
    };
  };

  // Select 16 random questions from the fetched questions
  const selectRandomQuestions = (allQuestions: Question[], count: number = 16): Question[] => {
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, count).map(shuffleQuestionOptions);
  };

  // Define functions BEFORE useEffect
  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
  };

  const handleTimeUp = () => {
    setWrongAnswers(prev => prev + 1);
    setShowResult(true);
    setIsCorrect(false);
    
    setTimeout(() => {
      if (wrongAnswers + 1 >= 3) {
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
    
    // Use the tracked correct index from shuffled options
    const correctAnswerIndex = questions[currentQuestion].originalCorrectIndex ?? 
      questions[currentQuestion].options.findIndex(option => option === questions[currentQuestion].answer);
    
    const correct = answerIndex === correctAnswerIndex;
    setIsCorrect(correct);
    
    if (!correct) {
      setWrongAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (!correct && wrongAnswers + 1 >= 3) {
        onComplete(false);
      } else if (currentQuestion >= questions.length - 1) {
        onComplete(true);
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const getAnswerButtonClass = (index: number) => {
    let baseClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-300 font-medium ";
    
    if (showResult) {
      const correctAnswerIndex = questions[currentQuestion].originalCorrectIndex ?? 
        questions[currentQuestion].options.findIndex(option => option === questions[currentQuestion].answer);
      
      if (index === correctAnswerIndex) {
        baseClass += "border-neon-green bg-neon-green/20 text-neon-green neon-glow-sm";
      } else if (index === selectedAnswer && index !== correctAnswerIndex) {
        baseClass += "border-red-500 bg-red-500/20 text-red-400";
      } else {
        baseClass += "border-gray-600 bg-gray-800/50 text-gray-500";
      }
    } else {
      baseClass += "border-gray-600 bg-dark-gray hover:border-neon-green hover:bg-neon-green/10 text-gray-300 hover:text-white";
    }

    return baseClass;
  };

  // Fetch from Firestore on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'quizQuestions'));
        const allQuestions: Question[] = [];

        querySnapshot.forEach(doc => {
          allQuestions.push({ id: doc.id, ...doc.data() } as Question);
        });
        
        console.log('Fetched all questions:', allQuestions.length);
        
        // Select 16 random questions and shuffle their options
        const selectedQuestions = selectRandomQuestions(allQuestions, 16);
        console.log('Selected random questions:', selectedQuestions);
        
        setQuestions(selectedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult && questions.length > 0) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, questions.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-neon-green font-mono">
        <div className="mb-4 text-xl animate-pulse">
          Decrypting vault data...
        </div>
        <div className="text-sm mb-6 text-gray-400">
          Selecting 16 random questions from vault...
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-neon-green animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-neon-green animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-neon-green animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-neon-green font-mono">
        <div className="text-center">
          <div className="text-xl mb-4">No questions found. Vault is empty.</div>
          <div className="text-sm text-gray-400">Check Firebase collection: 'quizQuestions'</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-3 border border-gray-700">
            <div 
              className="bg-neon-green h-3 rounded-full transition-all duration-500 neon-glow-sm"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-dark-gray border border-neon-green/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
            {questions[currentQuestion].question}
          </h2>
          
          {/* Answer Options */}
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
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Result Feedback */}
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