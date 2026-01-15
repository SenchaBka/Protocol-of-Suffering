import Phaser from "phaser";

export class PlayerCharacter {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private facingRight = true;
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    speed = 200,
    scale = 0.3
  ) {
    this.scene = scene;
    this.speed = speed;
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    

    if (!scene.anims.exists("walk")) {
      scene.anims.create({
        key: "walk",
        frames: scene.anims.generateFrameNumbers(key, { frames: [2,3,4,5,6,7,8,9] }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("idle")) {
      scene.anims.create({
        key: "idle",
        frames: scene.anims.generateFrameNumbers(key, { frames: [0,1] }),
        frameRate: 2,
        repeat: -1,
      });
    }

    this.sprite = scene.physics.add.sprite(x, y, key);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(scale);
    this.sprite.play("idle", true);
  }

  public update(isInputActive: boolean) {
    if (isInputActive) {
      this.stop();
      this.setVelocityY(0);
      return;
    }

    let isMoving = false;

    // Left/Right arrow keys
    if (this.cursors.left.isDown) {
      this.moveLeft();
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.moveRight();
      isMoving = true;
    } else {
      // Optional: A/D keys
      const aKey = this.scene.input.keyboard!.keys.find(
        (k) => k && k.keyCode === 65 && k.isDown
      );
      const dKey = this.scene.input.keyboard!.keys.find(
        (k) => k && k.keyCode === 68 && k.isDown
      );
      if (aKey) {
        this.moveLeft();
        isMoving = true;
      } else if (dKey) {
        this.moveRight();
        isMoving = true;
      } else {
        this.stop();
      }
    }

    // Ensure character doesn't fall
    this.setVelocityY(0);
  }

  private moveLeft() {
    this.sprite.setVelocityX(-this.speed);
    if (this.facingRight) {
      this.sprite.setFlipX(true);
      this.facingRight = false;
    }
    if (this.sprite.anims.currentAnim?.key !== "walk") {
      this.sprite.play("walk", true);
    }
  }

  private moveRight() {
    this.sprite.setVelocityX(this.speed);
    if (!this.facingRight) {
      this.sprite.setFlipX(false);
      this.facingRight = true;
    }
    if (this.sprite.anims.currentAnim?.key !== "walk") {
      this.sprite.play("walk", true);
    }
  }

  private stop() {
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

  public get anims() {
    return this.sprite.anims;
  }

  destroy() {
    this.sprite.destroy();
  }
}

export default PlayerCharacter;
