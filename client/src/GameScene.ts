import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 200;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    // Create player sprite
    this.player = this.physics.add.sprite(400, 300, 'player');
    
    // Instead of loading an image, let's create a colored rectangle
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();
    
    this.player.setTexture('playerTexture');
    this.player.setCollideWorldBounds(true);
    
    // Create cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add WASD controls
    this.input.keyboard!.on('keydown-W', () => this.player.setVelocityY(-this.speed));
    this.input.keyboard!.on('keyup-W', () => {
      if (this.player.body!.velocity.y < 0) this.player.setVelocityY(0);
    });
    
    this.input.keyboard!.on('keydown-S', () => this.player.setVelocityY(this.speed));
    this.input.keyboard!.on('keyup-S', () => {
      if (this.player.body!.velocity.y > 0) this.player.setVelocityY(0);
    });
    
    this.input.keyboard!.on('keydown-A', () => this.player.setVelocityX(-this.speed));
    this.input.keyboard!.on('keyup-A', () => {
      if (this.player.body!.velocity.x < 0) this.player.setVelocityX(0);
    });
    
    this.input.keyboard!.on('keydown-D', () => this.player.setVelocityX(this.speed));
    this.input.keyboard!.on('keyup-D', () => {
      if (this.player.body!.velocity.x > 0) this.player.setVelocityX(0);
    });
  }

  update() {
    // Handle arrow key movement
    const { left, right, up, down } = this.cursors;
    
    if (left.isDown) {
      this.player.setVelocityX(-this.speed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.speed);
    } else if (!this.input.keyboard!.keys.find(key => key && (key.keyCode === 65 || key.keyCode === 68) && key.isDown)) {
      this.player.setVelocityX(0);
    }
    
    if (up.isDown) {
      this.player.setVelocityY(-this.speed);
    } else if (down.isDown) {
      this.player.setVelocityY(this.speed);
    } else if (!this.input.keyboard!.keys.find(key => key && (key.keyCode === 87 || key.keyCode === 83) && key.isDown)) {
      this.player.setVelocityY(0);
    }
  }
}