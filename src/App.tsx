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
import { useQuestions } from './hooks/useQuestions';
import { getWriteContract, getReadContract, ipfsToHttp, getConnectedAddress } from './lib/web3';
import { useOwnedNFTs } from './hooks/useOwnedNFTs';

type GameState = 'splash' | 'entry' | 'quiz' | 'result' | 'reveal' | 'gallery';

function App() {
  const [gameState, setGameState] = useState<GameState>('splash');
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const { toasts, removeToast, showSuccess, showError, showPending, updateToast } = useToast();
  const { questions, loading, error } = useQuestions();
  const [revealedNFT, setRevealedNFT] = useState<any | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const { nfts: chainNFTs, loading: galleryLoading } = useOwnedNFTs(connectedAddress ?? undefined);

  React.useEffect(() => {
    getConnectedAddress().then(setConnectedAddress).catch(() => setConnectedAddress(null));
  }, []);

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

  const handleMintNFT = async () => {
    const toastId = showPending('Minting NFT', 'Your Proof of Heist NFT is being minted on the blockchain...');
    try {
      const contract = await getWriteContract();
      const tx = await contract.mintNFT();
      const receipt = await tx.wait();

      let tokenId: string | null = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed?.name === 'NFTMinted') {
            tokenId = parsed.args[1].toString();
            break;
          }
          if (parsed?.name === 'Transfer' && parsed.args[0] === '0x0000000000000000000000000000000000000000') {
            tokenId = parsed.args[2].toString();
          }
        } catch {}
      }

      if (!tokenId) throw new Error('Token ID not found in receipt');

      const read = getReadContract();
      const uri = await read.tokenURI(tokenId);
      const httpUri = ipfsToHttp(uri);
      const meta = await fetch(httpUri).then((r) => r.json()).catch(() => ({}));

      const nft = {
        id: tokenId,
        name: meta.name ?? `POH #${tokenId}`,
        image: ipfsToHttp(meta.image ?? ''),
        description: meta.description ?? 'Proof of Heist NFT',
        mintDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        rarity: (meta.attributes?.find((a: any) => a.trait_type === 'Rarity')?.value ?? 'Rare') as any,
        attributes: Array.isArray(meta.attributes) ? meta.attributes : []
      };

      setRevealedNFT(nft);
      setOwnedNFTs((prev) => [...prev, nft]);

      updateToast(toastId, {
        type: 'success',
        title: 'NFT Minted Successfully!',
        message: `Token #${tokenId} has been added to your wallet.`,
        duration: 5000
      });

      setGameState('reveal');
    } catch (e: any) {
      updateToast(toastId, {
        type: 'error',
        title: 'Mint Failed',
        message: e?.message ?? 'Transaction failed',
        duration: 6000
      });
    }
  };

  const handleRevealComplete = (nft: any) => {
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
          onRestart={handleRestart}
          onMintNFT={handleMintNFT}
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
  );
}

export default App;