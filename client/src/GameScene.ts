import Phaser from "phaser";
import { getAIresponse } from "./contexts/WebsocketConnection";

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

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image(
      "player",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    );
  }

  create() {
    // Create player sprite
    this.player = this.physics.add.sprite(400, 300, "player");

    // Instead of loading an image, let's create a colored rectangle
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("playerTexture", 32, 32);
    graphics.destroy();

    this.player.setTexture("playerTexture");
    this.player.setCollideWorldBounds(true);

    // Create trigger zone on the right side
    this.triggerZone = this.add.rectangle(750, 300, 100, 200, 0xff0000, 0.3);
    this.physics.add.existing(this.triggerZone, false);

    // Create red dot
    this.redDot = this.add.graphics();
    this.redDot.fillStyle(0xff0000, 1);
    this.redDot.fillCircle(750, 300, 10);

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

    // Add WASD controls
    this.input.keyboard!.on("keydown-W", () =>
      this.player.setVelocityY(-this.speed)
    );
    this.input.keyboard!.on("keyup-W", () => {
      if (this.player.body!.velocity.y < 0) this.player.setVelocityY(0);
    });

    this.input.keyboard!.on("keydown-S", () =>
      this.player.setVelocityY(this.speed)
    );
    this.input.keyboard!.on("keyup-S", () => {
      if (this.player.body!.velocity.y > 0) this.player.setVelocityY(0);
    });

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

    // Position input box above the player
    const playerWorldPos = this.player.getWorldTransformMatrix();
    const playerScreenPos = this.cameras.main.getWorldPoint(
      playerWorldPos.tx,
      playerWorldPos.ty
    );

    this.inputBox.style.left = `${playerScreenPos.x - 50}px`;
    this.inputBox.style.top = `${playerScreenPos.y - 60}px`;
    this.inputBox.style.width = "100px";

    document.body.appendChild(this.inputBox);
    this.inputBox.focus();

    // Handle input submission
    this.inputBox.addEventListener("keydown", async (event) => {
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
  }

  private async processUserInput(userInput: string): Promise<void> {
    try {
      // Show loading message
      this.displayText("Processing your message...");

      // Get AI response asynchronously
      const processedText = await getAIresponse(userInput);

      // Display the response
      this.displayText(processedText);
    } catch (error) {
      console.error("Error getting AI response:", error);
      this.displayText("Sorry, I couldn't process that. Please try again.");
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
    // Handle arrow key movement
    const { left, right, up, down } = this.cursors;

    if (left.isDown) {
      this.player.setVelocityX(-this.speed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.speed);
    } else if (
      !this.input.keyboard!.keys.find(
        (key) => key && (key.keyCode === 65 || key.keyCode === 68) && key.isDown
      )
    ) {
      this.player.setVelocityX(0);
    }

    if (up.isDown) {
      this.player.setVelocityY(-this.speed);
    } else if (down.isDown) {
      this.player.setVelocityY(this.speed);
    } else if (
      !this.input.keyboard!.keys.find(
        (key) => key && (key.keyCode === 87 || key.keyCode === 83) && key.isDown
      )
    ) {
      this.player.setVelocityY(0);
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
      const playerWorldPos = this.player.getWorldTransformMatrix();
      const playerScreenPos = this.cameras.main.getWorldPoint(
        playerWorldPos.tx,
        playerWorldPos.ty
      );

      this.inputBox.style.left = `${playerScreenPos.x - 50}px`;
      this.inputBox.style.top = `${playerScreenPos.y - 60}px`;
    }
  }
}
