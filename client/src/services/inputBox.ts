// client/src/services/inputBox.ts
import Phaser from "phaser";

export default class InputBox {
  private el?: HTMLInputElement;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private _isActive = false;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get isActive() {
    return this._isActive;
  }

  async showAt(x: number, y: number, options?: { width?: number; placeholder?: string; zIndex?: string }): Promise<string | null> {
    if (this._isActive) throw new Error("InputBox already active");
    this._isActive = true;

    const width = options?.width ?? 150;
    const placeholder = options?.placeholder ?? "Type your message...";
    const zIndex = options?.zIndex ?? "1000";

    this.el = document.createElement("input");
    this.el.type = "text";
    this.el.placeholder = placeholder;
    this.el.style.position = "absolute";
    this.el.style.zIndex = zIndex;
    this.el.style.padding = "8px";
    this.el.style.border = "2px solid #ffffff";
    this.el.style.borderRadius = "4px";
    this.el.style.backgroundColor = "#000000";
    this.el.style.color = "#ffffff";
    this.el.style.fontSize = "14px";
    this.el.style.width = `${width}px`;
    this.setPosition(x, y);

    document.body.appendChild(this.el);
    this.el.focus();

    // disable Phaser keyboard to avoid double-handling
    this.scene.input.keyboard!.enabled = false;

    return new Promise((resolve) => {
      this.keydownHandler = (event: KeyboardEvent) => {
        event.stopPropagation();

        if (event.key === "Enter") {
          const val = this.el!.value;
          this.hide();
          resolve(val);
        } else if (event.key === "Escape") {
          this.hide();
          resolve(null);
        }
      };

      this.el!.addEventListener("keydown", this.keydownHandler);
    });
  }

  setPosition(x: number, y: number) {
    if (!this.el) return;
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
  }

  hide() {
    if (!this.el) return;
    if (this.keydownHandler) {
      this.el.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = undefined;
    }
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = undefined;
    this._isActive = false;
    // re-enable Phaser keyboard
    this.scene.input.keyboard!.enabled = true;
  }
}