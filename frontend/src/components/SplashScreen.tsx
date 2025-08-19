import React, { useState, useEffect } from 'react';

import POH from '/public/POH.svg';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [showSlogan, setShowSlogan] = useState(false);
  const [typedText, setTypedText] = useState('');
  const slogan = "You weren't there... but you know what happened.";

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowSlogan(true);
    }, 1500);

    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (!showSlogan) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= slogan.length) {
        setTypedText(slogan.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(onComplete, 2000);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [showSlogan, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent"></div>
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div
              key={i}
              className="border border-neon-green/10 animate-pulse"
              style={{
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-green rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <div className="mb-12 animate-fade-in">
          <div className="relative inline-block mb-6">
            <img src={POH} className="w-80 h-80 text-neon-green mx-auto neon-glow animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-neon-green/30 rounded-lg animate-spin-slow"></div>
          </div>
          <h1 className="cyber-font text-7xl font-black text-white tracking-wider neon-text">
            PROOF
            <span className="block text-neon-green mt-2 neon-text">OF HEIST</span>
          </h1>
        </div>

        {showSlogan && (
          <div className="text-xl text-gray-300 font-mono max-w-lg mx-auto">
            <div className="border-l-2 border-neon-green pl-4">
              <span className="inline-block">
                {typedText}
                <span className="animate-blink text-neon-green ml-1">|</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan opacity-60"></div>
      </div>
    </div>
  );
};

export default SplashScreen;