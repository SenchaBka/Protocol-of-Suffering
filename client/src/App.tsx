import { PhaserGame } from './PhaserGame';
import { EstablishConnection } from './contexts/WebsocketConnection'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Phaser + React Game
        </h1>
        <PhaserGame width={800} height={600} />

      </div>
    </div>
  );
}

export default App;