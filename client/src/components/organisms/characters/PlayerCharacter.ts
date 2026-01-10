import Phaser from "phaser";

export class PlayerCharacter {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private facingRight = true;
  private scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    scale = 0.3
  ) {
    this.scene = scene;
    // Create animations if they don't exist yet
    if (!scene.anims.exists("walk")) {
      const walk = {
        key: "walk",
        frames: scene.anims.generateFrameNumbers(key, {
          frames: [2, 3, 4, 5, 6, 7, 8, 9],
        }),
        frameRate: 8,
        repeat: -1,
      };
      scene.anims.create(walk);
    }

    if (!scene.anims.exists("idle")) {
      const idle = {
        key: "idle",
        frames: scene.anims.generateFrameNumbers(key, {
          frames: [0, 1],
        }),
        frameRate: 2,
        repeat: -1,
      };
      scene.anims.create(idle);
    }

    this.sprite = scene.physics.add.sprite(x, y, key);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(scale);
    this.sprite.play("idle", true);
  }

  moveLeft(speed: number) {
    this.sprite.setVelocityX(-speed);
    if (this.facingRight) {
      this.sprite.setFlipX(true);
      this.facingRight = false;
    }
    if (this.sprite.anims.currentAnim?.key !== "walk") {
      this.sprite.play("walk", true);
    }
  }

  moveRight(speed: number) {
    this.sprite.setVelocityX(speed);
    if (!this.facingRight) {
      this.sprite.setFlipX(false);
      this.facingRight = true;
    }
    if (this.sprite.anims.currentAnim?.key !== "walk") {
      this.sprite.play("walk", true);
    }
  }

  stop() {
    this.sprite.setVelocityX(0);
    if (this.sprite.anims.currentAnim?.key !== "idle") {
      this.sprite.play("idle", true);
    }
  }

  setVelocityX(x: number) {
    this.sprite.setVelocityX(x);
  }

  setVelocityY(y: number) {
    this.sprite.setVelocityY(y);
  }

  play(key: string, ignoreIfPlaying?: boolean) {
    this.sprite.play(key, ignoreIfPlaying);
  }

  get anims() {
    return this.sprite.anims;
  }

  destroy() {
    this.sprite.destroy();
  }
}

export default PlayerCharacter;
