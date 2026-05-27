import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ParticleBgProps {
  count?: number;
  color?: string;
  className?: string;
}

export const ParticleBg: React.FC<ParticleBgProps> = ({
  count = 30,
  color = 'rgba(255, 255, 255, 0.3)',
  className = ''
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generatedParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      generatedParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    setParticles(generatedParticles);
  }, [count]);

  return (
    <div className={`particles-container ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// Gradient orbs for the background
interface GradientOrbsProps {
  className?: string;
}

export const GradientOrbs: React.FC<GradientOrbsProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Blue orb - top left */}
      <div
        className="absolute -top-1/4 -left-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(10, 132, 255, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Purple orb - bottom right */}
      <div
        className="absolute -bottom-1/4 -right-1/4 w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(191, 90, 242, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Subtle center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(100, 210, 255, 0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
};

export default ParticleBg;