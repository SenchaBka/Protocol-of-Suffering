import Phaser from "phaser";
import professorSprite from "../../assets/sprites/professor-sprite.png";
import backgroundImage from "../../assets/background/entry-scene.jpg";
import { getAIresponse } from "../../services/websocket/WebsocketConnection";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 200;
  private triggerZone!: Phaser.GameObjects.Rectangle;
  private redDot!: Phaser.GameObjects.Graphics;
  private isInTriggerZone = false;
  private inputBox!: HTMLInputElement;
  private textBox!: Phaser.GameObjects.Text;
  private isInputActive = false;
  private facingRight = true; // Track facing direction

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("background", backgroundImage);
    this.load.spritesheet("professor-sprite", professorSprite, {
      frameWidth: 307.2,
      frameHeight: 517,
    });
  }

  create() {
    // Add background image
    const background = this.add.image(400, 300, "background");

    // Get the game canvas dimensions
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    // Scale background to cover entire canvas and extend it wider and taller
    background.setDisplaySize(gameWidth * 1.5, gameHeight * 1.13); // 1.5x wider, 1.2x taller
    background.setDepth(-1); // Place behind everything else

    // Create animations
    const walk = {
      key: "walk",
      frames: this.anims.generateFrameNumbers("professor-sprite", {
        frames: [2, 3, 4, 5, 6, 7, 8, 9],
      }),
      frameRate: 8,
      repeat: -1,
    };

    const idle = {
      key: "idle",
      frames: this.anims.generateFrameNumbers("professor-sprite", {
        frames: [0, 1],
      }),
      frameRate: 2,
      repeat: -1,
    };

    this.anims.create(walk);
    this.anims.create(idle);

    // Create player sprite with physics - positioned at bottom-left with margins
    const startX = 40; // 40px from left
    const startY = this.scale.height - 40; // 40px from bottom
    this.player = this.physics.add.sprite(startX, startY, "professor-sprite");
    this.player.setCollideWorldBounds(true);

    // Make character smaller
    this.player.setScale(0.3);

    // Start with idle animation
    this.player.play("idle", true);

    // Create trigger zone on the right side
    this.triggerZone = this.add.rectangle(750, 500, 100, 200, 0xff0000, 0.3);
    this.physics.add.existing(this.triggerZone, false);
    // Add collision between player and trigger zone
    this.physics.add.overlap(
      this.player,
      this.triggerZone,
      this.onEnterTriggerZone,
      undefined,
      this
    );

    // Create text box (initially hidden)
    this.textBox = this.add.text(400, 200, "", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    });
    this.textBox.setOrigin(0.5);
    this.textBox.setVisible(false);

    // Create cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add WASD controls (horizontal movement only)
    this.input.keyboard!.on("keydown-A", () =>
      this.player.setVelocityX(-this.speed)
    );
    this.input.keyboard!.on("keyup-A", () => {
      if (this.player.body!.velocity.x < 0) this.player.setVelocityX(0);
    });

    this.input.keyboard!.on("keydown-D", () =>
      this.player.setVelocityX(this.speed)
    );
    this.input.keyboard!.on("keyup-D", () => {
      if (this.player.body!.velocity.x > 0) this.player.setVelocityX(0);
    });
  }

  private onEnterTriggerZone() {
    if (!this.isInTriggerZone) {
      this.isInTriggerZone = true;
      this.showInputBox();
    }
  }

  private showInputBox() {
    if (this.isInputActive) return;

    this.isInputActive = true;

    // Create input box
    this.inputBox = document.createElement("input");
    this.inputBox.type = "text";
    this.inputBox.placeholder = "Type your message...";
    this.inputBox.style.position = "absolute";
    this.inputBox.style.zIndex = "1000";
    this.inputBox.style.padding = "8px";
    this.inputBox.style.border = "2px solid #ffffff";
    this.inputBox.style.borderRadius = "4px";
    this.inputBox.style.backgroundColor = "#000000";
    this.inputBox.style.color = "#ffffff";
    this.inputBox.style.fontSize = "14px";

    // Position input box 100px above the player, centered horizontally
    const playerX = this.player.x;
    const playerY = this.player.y;
    const playerScreenPos = this.cameras.main.getWorldPoint(playerX, playerY);

    this.inputBox.style.left = `${playerScreenPos.x - 75}px`; // Center horizontally (150px width / 2 = 75px)
    this.inputBox.style.top = `${playerScreenPos.y - 100}px`; // 100px above player
    this.inputBox.style.width = "150px";

    document.body.appendChild(this.inputBox);
    this.inputBox.focus();

    // Disable game keyboard input when text box is active
    this.input.keyboard!.enabled = false;

    // Handle input submission
    this.inputBox.addEventListener("keydown", async (event) => {
      // Prevent the game from intercepting keys when typing
      event.stopPropagation();

      if (event.key === "Enter") {
        const userInput = this.inputBox.value;
        this.hideInputBox();
        await this.processUserInput(userInput);
      } else if (event.key === "Escape") {
        this.hideInputBox();
      }
    });
  }

  private hideInputBox() {
    if (this.inputBox && this.inputBox.parentNode) {
      this.inputBox.parentNode.removeChild(this.inputBox);
    }
    this.isInputActive = false;

    // Re-enable game keyboard input
    this.input.keyboard!.enabled = true;
  }

  private async processUserInput(userInput: string): Promise<void> {
    try {
      // Show loading message
      this.displayText("Processing your message...");

      // Get AI response asynchronously
      const processedText = await getAIresponse(userInput);

      // Display the response
      this.displayText(processedText);
    } catch (error: any) {
      // Show the actual error message from backend
      console.error("Error getting AI response:", error);
      const errorMessage = error?.message || "Sorry, I couldn't process that. Please try again.";
      this.displayText(`Error: ${errorMessage}`);
    }
  }

  private displayText(text: string) {
    this.textBox.setText(text);
    this.textBox.setVisible(true);

    // Hide text after 5 seconds
    this.time.delayedCall(5000, () => {
      this.textBox.setVisible(false);
    });
  }

  update() {
    // Don't allow movement when input is active (typing mode)
    if (this.isInputActive) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      // Switch to idle animation when input is active
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle", true);
      }
      return;
    }

    // Handle arrow key movement
    const { left, right } = this.cursors;
    let isMoving = false;

    if (left.isDown) {
      this.player.setVelocityX(-this.speed);
      isMoving = true;
      if (this.facingRight) {
        this.player.setFlipX(true);
        this.facingRight = false;
      }
    } else if (right.isDown) {
      this.player.setVelocityX(this.speed);
      isMoving = true;
      if (!this.facingRight) {
        this.player.setFlipX(false);
        this.facingRight = true;
      }
    } else if (
      !this.input.keyboard!.keys.find(
        (key) => key && (key.keyCode === 65 || key.keyCode === 68) && key.isDown
      )
    ) {
      this.player.setVelocityX(0);
    }

    // Disable vertical movement - keep Y velocity at 0
    this.player.setVelocityY(0);

    // Check if A or D keys are pressed (horizontal movement only)
    const aKey = this.input.keyboard!.keys.find(
      (key) => key && key.keyCode === 65 && key.isDown
    );
    const dKey = this.input.keyboard!.keys.find(
      (key) => key && key.keyCode === 68 && key.isDown
    );

    if (aKey) {
      if (this.facingRight) {
        this.player.setFlipX(true);
        this.facingRight = false;
      }
    }
    if (dKey) {
      if (!this.facingRight) {
        this.player.setFlipX(false);
        this.facingRight = true;
      }
    }

    if (aKey || dKey) {
      isMoving = true;
    }

    // Play appropriate animation based on movement
    if (isMoving) {
      if (this.player.anims.currentAnim?.key !== "walk") {
        this.player.play("walk", true);
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle", true);
      }
    }

    // Check if player left the trigger zone
    if (
      this.isInTriggerZone &&
      !this.physics.overlap(this.player, this.triggerZone)
    ) {
      this.isInTriggerZone = false;
    }

    // Update input box position if it's active
    if (this.isInputActive && this.inputBox) {
      const playerX = this.player.x;
      const playerY = this.player.y;
      const playerScreenPos = this.cameras.main.getWorldPoint(playerX, playerY);

      this.inputBox.style.left = `${playerScreenPos.x - 75}px`; // Center horizontally
      this.inputBox.style.top = `${playerScreenPos.y - 100}px`; // 100px above player
    }
  }
}
