import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import WalletHeader from './components/WalletHeader';
import QuizEntry from './components/QuizEntry';
import QuizGame from './components/QuizGame';
import ResultScreen from './components/ResultScreen';
import NFTReveal from './components/NFTReveal';
import NFTGallery from './components/NFTGallery';
import { ToastContainer } from './components/ToastNotification';
import { useToast } from './hooks/useToast';

type GameState = 'splash' | 'entry' | 'quiz' | 'result' | 'reveal' | 'gallery';

function App() {
  const [gameState, setGameState] = useState<GameState>('splash');
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const { toasts, removeToast, showSuccess, showError, showPending, updateToast } = useToast();

  const handleSplashComplete = () => {
    setGameState('entry');
  };

  const handleStartQuiz = () => {
    setGameState('quiz');
  };

  const handleQuizComplete = (success: boolean) => {
    setQuizSuccess(success);
    setGameState('result');
  };

  const handleRestart = () => {
    setGameState('entry');
  };

  const handleMintNFT = () => {
    // Show pending toast
    const toastId = showPending(
      'Minting NFT',
      'Your Proof of Heist NFT is being minted on the blockchain...'
    );

    // Simulate blockchain transaction
    setTimeout(() => {
      // Update to success
      updateToast(toastId, {
        type: 'success',
        title: 'NFT Minted Successfully!',
        message: 'Your Proof of Heist NFT has been added to your wallet.',
        duration: 5000
      });

      // Transition to reveal screen
      setGameState('reveal');
    }, 3000);
  };

  const handleRevealComplete = (nft: any) => {
    // Add NFT to owned collection
    setOwnedNFTs(prev => [...prev, nft]);
    
    showSuccess(
      'NFT Added to Gallery',
      'Your new NFT is now available in your gallery!'
    );
    
    setGameState('entry');
  };

  const handleViewGallery = () => {
    setGameState('gallery');
  };

  const handleBackFromGallery = () => {
    setGameState('entry');
  };

  if (gameState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Wallet Header - shown on all screens except splash and reveal */}
      {gameState !== 'reveal' && (
        <header className="relative z-10 p-6 border-b border-neon-green/20">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="cyber-font text-2xl font-bold text-white neon-text">
                PROOF OF HEIST
              </h1>
              {ownedNFTs.length > 0 && gameState === 'entry' && (
                <button
                  onClick={handleViewGallery}
                  className="ml-4 px-4 py-2 border border-neon-green/50 rounded-lg text-neon-green hover:bg-neon-green/10 transition-all duration-300 text-sm"
                >
                  Gallery ({ownedNFTs.length})
                </button>
              )}
            </div>
            <WalletHeader />
          </div>
        </header>
      )}

      {/* Main Content */}
      {gameState === 'entry' && <QuizEntry onStartQuiz={handleStartQuiz} />}
      {gameState === 'quiz' && <QuizGame onComplete={handleQuizComplete} />}
      {gameState === 'result' && (
        <ResultScreen 
          success={quizSuccess} 
          onRestart={handleRestart}
          onMintNFT={handleMintNFT}
        />
      )}
      {gameState === 'reveal' && (
        <NFTReveal 
          onComplete={handleRevealComplete}
          onViewGallery={handleViewGallery}
        />
      )}
      {gameState === 'gallery' && (
        <NFTGallery 
          ownedNFTs={ownedNFTs}
          onBack={handleBackFromGallery}
        />
      )}
    </div>
  );
}

export default App;