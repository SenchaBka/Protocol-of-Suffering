import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

interface PhaserGameProps {
  width?: number;
  height?: number;
  scenes: (typeof Phaser.Scene)[]; // pass scenes in
}

export const PhaserGame: React.FC<PhaserGameProps> = ({
  width = 800,
  height = 600,
  scenes,
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
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      audio: {
        disableWebAudio: true,
      },
      scene: scenes,
      backgroundColor: "#2d2d2d",
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [width, height, scenes]);

  // UI text handling
  const [hint, setHint] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const game = gameRef.current;

    const handler = (text: string) => setHint(text);

    game.events.on("ui:setHint", handler);
    game.events.on("ui:setTitle", setTitle);

    return () => {
      game.events.off("ui:setHint", handler);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <h1 className="text-6xl font-bold text-center">{title}</h1>}
      <div
        ref={containerRef}
        className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-lg"
      />
      {hint && (
        <p className="text-gray-300 mt-2">{hint}</p>
      )}
    </div>
  );
};

export default PhaserGame;
