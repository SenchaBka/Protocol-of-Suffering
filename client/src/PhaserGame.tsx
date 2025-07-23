import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';

interface PhaserGameProps {
  width?: number;
  height?: number;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {x: 0, y: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      backgroundColor: '#2d2d2d'
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={containerRef} 
        className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg"
      />
      <div className="text-center">
        <p className="text-gray-300">Use Arrow Keys or WASD to move</p>
      </div>
    </div>
  );
};