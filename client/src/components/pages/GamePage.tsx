import { PhaserGame } from "../organisms/PhaserGame";
import { EntryScene } from "../organisms/scenes/EntryScene";

const GamePage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-6xl font-bold text-center mb-8">
          Welcome!
        </h1>
        <PhaserGame width={800} height={600} scenes={[EntryScene]} />
      </div>
    </div>
  );
};

export default GamePage;
