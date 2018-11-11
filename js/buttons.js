class RollDiceButton {
    constructor(id) {
        this._element = document.getElementById(id);
        this._element.innerHTML = "Roll Dice";
        this._enabled = true;
        this.Enable();
    }

    Enable() {
        this._element.classList.add("button-green");
        this._element.classList.remove("button-disabled");
        this._element.addEventListener("click", this.Click.bind(this));
        this._enabled = true;
    }

    Disable() {
        this._element.classList.add("button-disabled");
        this._element.classList.remove("button-green");
        this._element.removeEventListener("click", this.Click);
        this._enabled = false;
    }

    Click() {
        if (!diceManager.IsRolling) {
            this.Disable();
            diceManager.Roll();
        }
    }

    Update() {
        if (!this._enabled && !diceManager.IsRolling) {
            this.Enable();
        }
    }
}
