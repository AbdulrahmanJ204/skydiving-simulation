// Checked
export class InputManager {
    keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
    };
    callbacks;
    constructor() {

        this.callbacks = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener("keydown", (event) => {
            this.handleKeyDown(event);
        });

        window.addEventListener("keyup", (event) => {
            this.handleKeyUp(event);
        });
    }

    handleKeyDown(event) {
        if (event.code in this.keys) {
            this.keys[event.code] = true;
        }
        switch (event.key) {
            case "h":
                this.triggerCallback("toggleGUI");
                break;
            case "f":
                this.triggerCallback("openParachute");
                break;
            case "F":
                this.triggerCallback("openParachute");
                break;
            case "ب":
                this.triggerCallback("openParachute");
                break;
        }
    }

    handleKeyUp(event) {
        if (event.code in this.keys) {
            this.keys[event.code] = false;
        }
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    registerCallback(action, callback) {
        if (!this.callbacks.has(action)) {
            this.callbacks.set(action, []);
        }
        this.callbacks.get(action).push(callback);
    }

    triggerCallback(action, ...args) {
        if (this.callbacks.has(action)) {
            this.callbacks.get(action).forEach(callback => {
                callback(...args);
            });
        }
    }

    getKeyStates() {
        return {...this.keys};
    }
}
