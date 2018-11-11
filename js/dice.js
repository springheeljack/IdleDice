//Classes
class Points {
    constructor(pointsID, fadeID) {
        this._points = 10000;
        this._pointsElement = document.getElementById(pointsID);
        this._fadeElement = document.getElementById(fadeID);
        this._fadeTime = 0;
        this._fadeNumber;
    }

    Update() {
        if (this._fadeTime > 0) {
            if (this._fadeTime === 1000) {
                this._fadeElement.innerText = (this._fadeNumber > 0 ? "+" : "") + this._fadeNumber
            }
            this._fadeElement.style = "opacity:" + this._fadeTime / 1000;
            this._fadeTime -= tickSpeed;
            if (this._fadeTime <= 0) {
                this._fadeTime = 0;
                this._fadeElement.innerText = "";
                this._fadeElement.classList.remove("text-green");
                this._fadeElement.classList.remove("text-red");
            }
        }
    }

    Add(number) {
        let total = number;
        total += diceManager.NumberOfDice * diceManager.DicePointBonus;
        let multiplier = 1;
        let mults = diceManager.DiceMultipliers;
        let dice = diceManager.DiceNumbers;
        for (let i = 0; i < mults.length; i++) {
            multiplier *= dice[mults[i]];
        }
        total *= multiplier;
        this.UpdateNumber(total);
    }

    Subract(number) {
        this.UpdateNumber(-number);
    }

    UpdateNumber(number) {
        this._points += number;
        this._fadeNumber = number;
        this._fadeTime = 1000;
        this._pointsElement.innerText = this._points;
        this._fadeElement.classList.add(number > 0 ? "text-green" : "text-red");
    }

    get Get() {
        return this._points;
    }
}

class DiceManager {
    constructor(boxID, informationID) {
        this._boxElement = document.getElementById(boxID);
        this._informationElement = document.getElementById(informationID);
        this._numberOfDice = 1;
        this._numbers = [];
        this._currentRollTime = 0;
        this._rollTime = 5000;
        this._diceLowerBound = 1;
        this._diceUpperBound = 6;
        this._dicePointBonus = 0;
        this._diceMultipliers = [];
        this.UpdateInformation();
    }

    get DiceMultipliers() {
        return this._diceMultipliers;
    }

    AddDiceMultiplier(number) {
        this._diceMultipliers.push(number);
    }

    AddDicePointBonus(number) {
        this._dicePointBonus += number;
        this.UpdateInformation();
    }

    get DicePointBonus() {
        return this._dicePointBonus;
    }

    ChangeRollTime(multiplier) {
        this._rollTime *= multiplier;
        this.UpdateInformation();
    }

    Roll() {
        this._currentRollTime = this._rollTime;
        this._boxElement.classList.add("text-red");
    }

    get IsRolling() {
        return this._currentRollTime > 0;
    }

    Add(number) {
        this._numberOfDice += number;
        this._boxElement.innerText += "  1";
        this.UpdateInformation();
    }

    Remove(number) {
        this._numberOfDice -= number;
    }

    IncreaseDiceSize(number) {
        this._diceUpperBound += number;
        this.UpdateInformation();
    }

    RandomizeDice() {
        this._numbers = [];
        for (let i = 0; i < this._numberOfDice; i++) {
            this._numbers.push(RandomInt(this._diceLowerBound, this._diceUpperBound));
        }
        let text = this._numbers[0];
        for (let i = 1; i < this._numberOfDice; i++) {
            text += "  " + this._numbers[i];
        }
        this._boxElement.innerText = text;
    }

    get DiceNumbers() {
        return this._numbers;
    }

    get DiceNumberTotal() {
        let total = 0;
        for (let i = 0; i < this._numberOfDice; i++) {
            total += this._numbers[i];
        }
        return total;
    }

    get NumberOfDice() {
        return this._numberOfDice;
    }

    UpdateInformation() {
        let html = "<strong>Dice owned: </strong>" + this._numberOfDice + "<br/>";
        html += "<strong>Dice size: </strong> D" + this._diceUpperBound + "<br/>";
        html += "<strong>Dice point bonus: </strong>" + this._dicePointBonus + "<br/>";
        html += "<strong>Dice roll time: </strong>" + this._rollTime / 1000 + " seconds";
        this._informationElement.innerHTML = html;
    }

    Update() {
        if (this._currentRollTime > 0) {
            this.RandomizeDice();
            this._currentRollTime -= tickSpeed;
            if (this._currentRollTime <= 0) {
                this._boxElement.classList.remove("text-red");
                this._currentRollTime = 0;
                points.Add(this.DiceNumberTotal);
            }
        }
    }
}

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

class Upgrade {
    constructor(price, name, type, magnitude, prerequisite) {
        this._name = name;
        this._price = price;
        this._purchased = false;
        this._type = type;
        this._magnitude = magnitude;
        this._prerequisite = prerequisite;
    }

    get HasPrerequisite() {
        return this._prerequisite !== undefined;
    }

    get Prerequisite() {
        return upgradeManager.Upgrades[this._prerequisite];
    }

    get Name() {
        return this._name;
    }

    get CanPurchase() {
        return points.Get >= this._price;
    }

    get Price() {
        return this._price;
    }

    get Type() {
        return this._type;
    }

    get Magnitude() {
        return this._magnitude;
    }

    Purchase() {
        this._purchased = true;
        points.Subract(this._price);
        switch (this._type) {
            case "AddDice":
                diceManager.Add(this._magnitude);
                break;
            case "BiggerDice":
                diceManager.IncreaseDiceSize(this._magnitude);
                break;
            case "FasterRoll":
                diceManager.ChangeRollTime(this._magnitude);
                break;
            case "DicePointBonus":
                diceManager.AddDicePointBonus(this._magnitude);
                break;
            case "DiceMultiplier":
                diceManager.AddDiceMultiplier(this._magnitude);
                break;
            default:
        }
        upgradeManager.CheckPrerequisites();
    }

    get Purchased() {
        return this._purchased;
    }
}

class UpgradeManager {
    constructor(id) {
        this._element = document.getElementById(id);
        this._upgrades = {};
        this._buttons = [];
    }

    Add(key, upgrade) {
        this._upgrades[key] = upgrade;
    }

    get Upgrades() {
        return this._upgrades;
    }

    get PurchasedUpgrades() {
        let purchased = [];
        const keys = Object.keys(this._upgrades);
        for (let i = 0; i < keys.length; i++) {
            const u = this._upgrades[keys[i]];
            if (u.Purchased) {
                purchased.push(u);
            }
        }
        return purchased;
    }

    get UnpurchasedUpgrades() {
        let unpurchased = [];
        const keys = Object.keys(this._upgrades);
        for (let i = 0; i < keys.length; i++) {
            const u = this._upgrades[keys[i]];
            if (!u.Purchased) {
                unpurchased.push(u);
            }
        }
        return unpurchased;
    }

    CreateElements() {
        //Create the HTML buttons
        let html = "";
        const keys = Object.keys(this._upgrades);
        for (let i = 0; i < keys.length; i++) {
            html += `<button id="UpgradeButton` + i + `"/>`
        }
        this._element.innerHTML = html;

        //Create the button instances
        for (let i = 0; i < keys.length; i++) {
            this._buttons.push(new UpgradeButton("UpgradeButton" + i, this._upgrades[keys[i]]));
        }
    }

    CheckPrerequisites() {
        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i].CheckPrerequisites();
        }
    }

    Update() {
        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i].Update();
        }
    }
}

class UpgradeButton {
    constructor(id, upgrade) {
        this._element = document.getElementById(id);
        this._upgrade = upgrade;
        this._enabled = false;
        this._element.innerHTML = this._upgrade.Name + "<br/> Price: " + this._upgrade.Price;
        this._click = this.Click.bind(this);
        this.Disable();
        this.Hide();
    }

    Hide() {
        this._element.classList.add("hidden");
    }

    Reveal() {
        this._element.classList.remove("hidden");
    }

    Enable() {
        this._element.classList.add("button-green");
        this._element.classList.remove("button-disabled");
        this._element.addEventListener("click", this._click);
        this._enabled = true;
    }

    Disable() {
        this._element.classList.add("button-disabled");
        this._element.classList.remove("button-green");
        this._element.removeEventListener("click", this._click);
        this._enabled = false;
    }

    Click() {
        this._upgrade.Purchase();
        this.Hide();
    }

    CheckPrerequisites() {
        if (!this._upgrade.Purchased) {
            if (this._upgrade.HasPrerequisite) {
                if (this._upgrade.Prerequisite.Purchased) {
                    this.Reveal();
                }
            }
            else {
                this.Reveal();
            }
        }
    }

    Update() {
        if (!this._upgrade.Purchased) {
            if (this._enabled) {
                if (!this._upgrade.CanPurchase) {
                    this.Disable();
                }
            }
            else {
                if (this._upgrade.CanPurchase) {
                    this.Enable();
                }
            }
        }
    }
}

//Functions
function Load() {
    updateInterval = setInterval(Update, tickSpeed);
    points = new Points("Points", "PointsFade");
    diceManager = new DiceManager("DiceBox", "DiceInformation");
    rollDiceButton = new RollDiceButton("RollDiceButton");

    //Upgrades
    upgradeManager = new UpgradeManager("Upgrades");
    upgradeManager.Add("DicePointBonus1", new Upgrade(50, "Get 1 more point from each dice", "DicePointBonus", 1));
    upgradeManager.Add("DicePointBonus2", new Upgrade(100, "Get 2 more points from each dice", "DicePointBonus", 2, "DicePointBonus1"));
    upgradeManager.Add("DicePointBonus3", new Upgrade(150, "Get 3 more points from each dice", "DicePointBonus", 3, "DicePointBonus2"));
    upgradeManager.Add("DicePointBonus4", new Upgrade(300, "Get 4 more points from each dice", "DicePointBonus", 4, "DicePointBonus3"));
    upgradeManager.Add("AddDice1", new Upgrade(100, "Add 1 more dice", "AddDice", 1));
    upgradeManager.Add("AddDice2", new Upgrade(200, "Add 1 more dice", "AddDice", 1, "AddDice1"));
    upgradeManager.Add("AddDice3", new Upgrade(400, "Add 1 more dice", "AddDice", 1, "AddDice2"));
    upgradeManager.Add("AddDice4", new Upgrade(1000, "Add 1 more dice", "AddDice", 1, "AddDice3"));
    upgradeManager.Add("BiggerDice1", new Upgrade(15, "Use bigger dice", "BiggerDice", 1));
    upgradeManager.Add("BiggerDice2", new Upgrade(30, "Use bigger dice", "BiggerDice", 1, "BiggerDice1"));
    upgradeManager.Add("BiggerDice3", new Upgrade(60, "Use bigger dice", "BiggerDice", 1, "BiggerDice2"));
    upgradeManager.Add("BiggerDice4", new Upgrade(60, "Use bigger dice", "BiggerDice", 1, "BiggerDice3"));
    upgradeManager.Add("FasterRoll1", new Upgrade(50, "Roll 20% faster", "FasterRoll", 0.8));
    upgradeManager.Add("FasterRoll2", new Upgrade(100, "Roll 20% faster", "FasterRoll", 0.8, "FasterRoll1"));
    upgradeManager.Add("FasterRoll3", new Upgrade(200, "Roll 20% faster", "FasterRoll", 0.8, "FasterRoll2"));
    upgradeManager.Add("DiceMultiplier1", new Upgrade(250, "Multiply all dice points by first dice", "DiceMultiplier", 0));
    upgradeManager.Add("DiceMultiplier2", new Upgrade(10000, "Multiply all dice points by second dice", "DiceMultiplier", 1,"DiceMultiplier1"));
    upgradeManager.CreateElements();
    upgradeManager.CheckPrerequisites();
}

function RandomInt(lower, upper) {
    const difference = (upper + 1) - lower;
    const random = Math.random() * difference;
    return Math.ceil(random + lower) - 1;
}

function Update() {
    points.Update();
    diceManager.Update();
    rollDiceButton.Update();
    upgradeManager.Update();
}

//Globals
var updateInterval;
var tickSpeed = 50;

var points;
var diceManager;
var rollDiceButton;
var upgradeManager;

window.onload = Load;