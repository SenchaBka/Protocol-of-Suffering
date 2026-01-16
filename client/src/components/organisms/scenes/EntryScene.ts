import Phaser from "phaser";
import professorSprite from "../../../assets/sprites/professor-sprite.png";
import backgroundImage from "../../../assets/background/entry-scene.jpg";
import triggerZone from "../../../assets/characters/entry_scene_sceleton.png";
import PlayerCharacter from "../characters/PlayerCharacter";
import { processUserMessage } from "../../../services/dialogue";
import InputBox from "../../../services/inputBox";

export class EntryScene extends Phaser.Scene {
  private player!: PlayerCharacter;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private speed = 200;
  private isInTriggerZone = false;
  private triggerZone!: Phaser.Physics.Arcade.Sprite;
  private inputBox?: InputBox;
  private textBox!: Phaser.GameObjects.Text;
  private isInputActive = false;

  constructor() {
    super({ key: "EntryScene" });
  }

  preload() {
    this.load.image("background", backgroundImage);
    this.load.spritesheet("professor-sprite", professorSprite, {
      frameWidth: 307.2,
      frameHeight: 517,
    });
    this.load.image("trigger-image", triggerZone);
  }

  create() {
    const background = this.add.image(400, 300, "background");
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    background.setDisplaySize(gameWidth * 1.5, gameHeight * 1.13);
    background.setDepth(-1);



    const startX = 40;
    const startY = this.scale.height - 40;
    this.player = new PlayerCharacter(this, startX, startY, "professor-sprite");

    this.game.events.emit("ui:setTitle", "Welcome!");
    this.game.events.emit("ui:setHint", "Use Arrow Keys or WASD to move");
    
    this.triggerZone = this.physics.add.sprite(750, 500, "trigger-image"); 
    (this.triggerZone as Phaser.Physics.Arcade.Sprite).setImmovable(true);
    this.triggerZone.setScale(0.43);
    this.physics.add.overlap(
      this.player.sprite,
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


  }

  private onEnterTriggerZone() {
    if (!this.isInTriggerZone) {
      this.isInTriggerZone = true;
      this.game.events.emit(
        "ui:setHint",
        "Talk to Big Skeleton to advance the story."
      );
      this.showInputBox();
    }
  }

  private async showInputBox() {
    if (this.isInputActive) return;
    this.isInputActive = true;

    this.inputBox = new InputBox(this);

    const playerX = this.player.sprite.x;
    const playerY = this.player.sprite.y;
    const camera = this.cameras.main;
    const canvasRect = this.game.canvas.getBoundingClientRect();

    // world -> screen -> page
    const screenX = playerX - camera.worldView.x;
    const screenY = playerY - camera.worldView.y;
    const pageX = canvasRect.left + screenX;
    const pageY = canvasRect.top + screenY;

    // show input above player (tweak offsets as needed)
    const offsetX = 75;  // half input width
    const offsetY = 100; // distance above the character
    const result = await this.inputBox.showAt(pageX - offsetX, pageY - offsetY);

    this.isInputActive = false;
    this.inputBox = undefined;

    if (result === null) return;

    this.displayText("Processing your message...");
    try {
      const processedText = await processUserMessage(result, "ANGRY_SKELETON");
      this.displayText(processedText);
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      const message = error?.message || "Sorry, I couldn't process that. Please try again.";
      this.displayText(`Error: ${message}`);
    }
  }

  private displayText(text: string) {
    this.textBox.setText(text);
    this.textBox.setVisible(true);
    this.time.delayedCall(10000, () => {
      this.textBox.setVisible(false);
    });
  }

  update() {
    if (this.player) {
      this.player.update(this.isInputActive); // just tell player if input box is active
    }

    // trigger zone logic
    if (this.isInTriggerZone && !this.physics.overlap(this.player.sprite, this.triggerZone)) {
      this.isInTriggerZone = false;
    }

    // update input box position
    if (this.isInputActive && this.inputBox) {
      const playerX = this.player.sprite.x;
      const playerY = this.player.sprite.y;
      const camera = this.cameras.main;
      const canvasRect = this.game.canvas.getBoundingClientRect();
      const screenX = playerX - camera.worldView.x;
      const screenY = playerY - camera.worldView.y;
      const pageX = canvasRect.left + screenX;
      const pageY = canvasRect.top + screenY;
      const offsetX = 75;
      const offsetY = 100;
      this.inputBox.setPosition(pageX - offsetX, pageY - offsetY);
    }
  }
}
