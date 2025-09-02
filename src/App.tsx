import React, { useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { AppProviders } from './providers';
import useMiniKit from '@farcaster/miniapp-sdk';
import '@coinbase/onchainkit/styles.css';
import SplashScreen from './components/SplashScreen';
import WalletHeader from './components/WalletHeader';
import QuizEntry from './components/QuizEntry';
import QuizGame from './components/QuizGame';
import ResultScreen from './components/ResultScreen';
import NFTReveal from './components/NFTReveal';
import NFTGallery from './components/NFTGallery';
import { ToastContainer } from './components/ToastNotification';
import { useToast } from './hooks/useToast';
import { useQuestions } from './hooks/useQuestions';
import { getConnectedAddress } from './lib/web3';
import { useOwnedNFTs } from './hooks/useOwnedNFTs';

type GameState = 'splash' | 'entry' | 'quiz' | 'result' | 'reveal' | 'gallery';

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({ appName: 'Proof of Heist' }),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

function App() {
  const miniKit = useMiniKit;
  React.useEffect(() => {
    // Set frame ready on mount
    miniKit.actions.ready && miniKit.actions.ready();
  }, []);
  const [gameState, setGameState] = useState<GameState>('splash');
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const { toasts, removeToast, showSuccess } = useToast();
  const { questions, loading } = useQuestions();
  const [revealedNFT, setRevealedNFT] = useState<any | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const { nfts: chainNFTs } = useOwnedNFTs(connectedAddress ?? undefined);

  React.useEffect(() => {
    getConnectedAddress().then(setConnectedAddress).catch(() => setConnectedAddress(null));
  }, []);

  const handleSplashComplete = () => {
    setGameState('entry');
  };

  const handleStartQuiz = () => {
    setGameState('quiz');
  };

  const handleQuizComplete = (success: boolean, score: number) => {
    setQuizSuccess(success);
    setQuizScore(score);
    setGameState('result');
  };

  const handleRestart = () => {
    setGameState('entry');
  };


  const handleRevealComplete = () => {
    showSuccess('NFT Added to Gallery', 'Your new NFT is now available in your gallery!');
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
    <WagmiProvider config={wagmiConfig}>
      <AppProviders>
        <div className="min-h-screen bg-black">
          <ToastContainer toasts={toasts} onRemove={removeToast} />

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

          {gameState === 'entry' && <QuizEntry onStartQuiz={handleStartQuiz} />}
          {gameState === 'quiz' && (
            loading ? (
              <div className="min-h-[60vh] flex items-center justify-center text-white">Loading questions...</div>
            ) : (
              <QuizGame onComplete={handleQuizComplete} questions={questions} />
            )
          )}
          {gameState === 'result' && (
            <ResultScreen 
              success={quizSuccess}
              score={quizScore}
              onRestart={handleRestart}
              onMintSuccess={(nft) => {
                setRevealedNFT({
                  ...nft,
                  id: nft.tokenId,
                  name: nft.metadata?.name ?? `POH #${nft.tokenId}`,
                  image: nft.metadata?.image ?? '',
                  description: nft.metadata?.description ?? 'Proof of Heist NFT',
                  mintDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  rarity: (nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value ?? 'Rare'),
                  attributes: Array.isArray(nft.metadata?.attributes) ? nft.metadata.attributes : []
                });
                setOwnedNFTs((prev) => [
                  ...prev,
                  {
                    ...nft,
                    id: nft.tokenId,
                    name: nft.metadata?.name ?? `POH #${nft.tokenId}`,
                    image: nft.metadata?.image ?? '',
                    description: nft.metadata?.description ?? 'Proof of Heist NFT',
                    mintDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    rarity: (nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value ?? 'Rare'),
                    attributes: Array.isArray(nft.metadata?.attributes) ? nft.metadata.attributes : []
                  }
                ]);
                setGameState('reveal');
              }}
            />
          )}
          {gameState === 'reveal' && revealedNFT && (
            <NFTReveal 
              onComplete={handleRevealComplete}
              onViewGallery={handleViewGallery}
              nft={revealedNFT}
            />
          )}
          {gameState === 'gallery' && (
            <NFTGallery 
              ownedNFTs={(connectedAddress ? chainNFTs : ownedNFTs) as any[]}
              onBack={handleBackFromGallery}
            />
          )}
        </div>
      </AppProviders>
    </WagmiProvider>
  );
}
  {/* MiniKitProvider is now handled in AppProviders or providers.tsx */}
export default App;