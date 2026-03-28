import { useEffect, useState, useRef } from "react";
import logoImg from "../assets/logo.png";

interface SmoothRotatingLogoProps {
  isVisible: boolean;
}

const SmoothRotatingLogo = ({ isVisible }: SmoothRotatingLogoProps) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const rotationRef = useRef(0);
  const speedRef = useRef(1);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    let frameId: number;

    const animate = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const baseRotationPerMs = 360 / 20000;
      rotationRef.current -= baseRotationPerMs * delta * speedRef.current;
      
      if (logoRef.current) {
        logoRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible]);

  useEffect(() => {
    const targetSpeed = isHovered ? 4 : 1;
    const rampDuration = 1000;
    const startSpeed = speedRef.current;
    const startTime = performance.now();

    let rampFrameId: number;
    const ramp = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / rampDuration, 1);
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      speedRef.current = startSpeed + (targetSpeed - startSpeed) * easeProgress;
      if (progress < 1) rampFrameId = requestAnimationFrame(ramp);
    };

    rampFrameId = requestAnimationFrame(ramp);
    return () => cancelAnimationFrame(rampFrameId);
  }, [isHovered]);

  if (!isVisible) return null;

  return (
    <div 
      className="logo-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10
      }}
    >
      <img 
        ref={logoRef} 
        src={logoImg} 
        alt="logo" 
        className="logo" 
        style={{ 
          height: '200px',
          width: 'auto',
          animation: 'none',
          transform: `rotate(${rotationRef.current}deg)`,
          pointerEvents: 'auto'
        }} 
      />
    </div>
  );
};

export default SmoothRotatingLogo;
