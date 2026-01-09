import Phaser from "phaser";
import professorSprite from "../../../assets/sprites/professor-sprite.png";
import backgroundImage from "../../../assets/background/entry-scene.jpg";
import { getAIresponse } from "../../../services/websocket/WebsocketConnection";

export class EntryScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 200;
  private triggerZone!: Phaser.GameObjects.Rectangle;
  private redDot!: Phaser.GameObjects.Graphics;
  private isInTriggerZone = false;
  private inputBox!: HTMLInputElement;
  private textBox!: Phaser.GameObjects.Text;
  private isInputActive = false;
  private facingRight = true;

  constructor() {
    super({ key: "EntryScene" });
  }

  preload() {
    this.load.image("background", backgroundImage);
    this.load.spritesheet("professor-sprite", professorSprite, {
      frameWidth: 307.2,
      frameHeight: 517,
    });
  }

  create() {
    const background = this.add.image(400, 300, "background");
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    background.setDisplaySize(gameWidth * 1.5, gameHeight * 1.13);
    background.setDepth(-1);

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

    const startX = 40;
    const startY = this.scale.height - 40;
    this.player = this.physics.add.sprite(startX, startY, "professor-sprite");
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.3);
    this.player.play("idle", true);

    this.triggerZone = this.add.rectangle(750, 500, 100, 200, 0xff0000, 0.3);
    this.physics.add.existing(this.triggerZone, false);
    this.physics.add.overlap(
      this.player,
      this.triggerZone,
      this.onEnterTriggerZone,
      undefined,
      this
    );

    this.textBox = this.add.text(400, 200, "", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    });
    this.textBox.setOrigin(0.5);
    this.textBox.setVisible(false);

    this.cursors = this.input.keyboard!.createCursorKeys();

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

    const playerX = this.player.x;
    const playerY = this.player.y;
    const playerScreenPos = this.cameras.main.getWorldPoint(playerX, playerY);

    this.inputBox.style.left = `${playerScreenPos.x - 75}px`;
    this.inputBox.style.top = `${playerScreenPos.y - 100}px`;
    this.inputBox.style.width = "150px";

    document.body.appendChild(this.inputBox);
    this.inputBox.focus();

    this.input.keyboard!.enabled = false;

    this.inputBox.addEventListener("keydown", async (event) => {
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
    this.input.keyboard!.enabled = true;
  }

  private async processUserInput(userInput: string): Promise<void> {
    try {
      this.displayText("Processing your message...");
      const processedText = await getAIresponse(userInput);
      this.displayText(processedText);
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      const errorMessage =
        error?.message || "Sorry, I couldn't process that. Please try again.";
      this.displayText(`Error: ${errorMessage}`);
    }
  }

  private displayText(text: string) {
    this.textBox.setText(text);
    this.textBox.setVisible(true);
    this.time.delayedCall(5000, () => {
      this.textBox.setVisible(false);
    });
  }

  update() {
    if (this.isInputActive) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0);
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle", true);
      }
      return;
    }

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

    this.player.setVelocityY(0);

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

    if (isMoving) {
      if (this.player.anims.currentAnim?.key !== "walk") {
        this.player.play("walk", true);
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.play("idle", true);
      }
    }

    if (
      this.isInTriggerZone &&
      !this.physics.overlap(this.player, this.triggerZone)
    ) {
      this.isInTriggerZone = false;
    }

    if (this.isInputActive && this.inputBox) {
      const playerX = this.player.x;
      const playerY = this.player.y;
      const playerScreenPos = this.cameras.main.getWorldPoint(playerX, playerY);

      this.inputBox.style.left = `${playerScreenPos.x - 75}px`;
      this.inputBox.style.top = `${playerScreenPos.y - 100}px`;
    }
  }
}
