import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import logo from '../../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'fade-in' | 'transition' | 'exit'>('intro');

  useEffect(() => {
    // 1. Static logo fades in (No rotation loop here)
    const fadeInTimer = setTimeout(() => setPhase('fade-in'), 50);
    
    // 2. Static logo transverses and scales down
    const transitionTimer = setTimeout(() => setPhase('transition'), 2000);
    
    // 3. Complete and hand-off to Navbar
    const exitTimer = setTimeout(() => {
      setPhase('exit');
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(transitionTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (phase === 'exit') return null;

  return (
    <div className="splash-outer-container">
      <div className={`splash-overlay ${phase === 'transition' ? 'fade-out' : ''}`} />
      <div className={`splash-logo-container ${phase}`}>
        <img 
          src={logo} 
          alt="Logo" 
          className="splash-logo-img" 
          style={{ transform: 'rotate(0deg)' }} 
        />
      </div>
    </div>
  );
};

export default SplashScreen;
