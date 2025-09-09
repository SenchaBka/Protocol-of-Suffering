// Game utility functions that use the game services
import { PlayerService } from "../PlayerService";
import { InputService } from "../InputService";
import { CollisionService } from "../CollisionService";

export class GameUtils {
  static createPlayerWithServices(scene: Phaser.Scene, x: number, y: number) {
    const playerService = new PlayerService();
    const inputService = new InputService();
    const collisionService = new CollisionService();

    // Initialize services
    inputService.initializeInput(scene);
    const player = playerService.initializePlayer(scene, x, y);
    collisionService.setPlayer(player);

    return {
      playerService,
      inputService,
      collisionService,
      player,
    };
  }

  static setupBasicMovement(
    playerService: PlayerService,
    inputService: InputService,
    updateCallback: () => void
  ) {
    // This could be used in any scene to set up basic movement
    const gameLoop = () => {
      const input = inputService.getMovementInput();

      if (input.x !== 0) {
        playerService.movePlayer(input.x > 0 ? "right" : "left");
      } else {
        playerService.stopHorizontalMovement();
      }

      if (input.y !== 0) {
        playerService.movePlayer(input.y > 0 ? "down" : "up");
      } else {
        playerService.stopVerticalMovement();
      }

      updateCallback();
    };

    return gameLoop;
  }

  static createTriggerZone(
    scene: Phaser.Scene,
    collisionService: CollisionService,
    x: number,
    y: number,
    width: number,
    height: number,
    onEnter: () => void,
    onExit: () => void
  ) {
    const zone = collisionService.createTriggerZone(scene, x, y, width, height);
    collisionService.setupPlayerZoneCollision(scene, zone, onEnter, onExit);
    return zone;
  }
}
