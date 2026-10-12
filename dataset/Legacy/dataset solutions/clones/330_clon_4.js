class DiamondPlay {
    #totalInnings;
    #currentOuts;
    #maxOuts;
    #onBase;
    #currentScore;

    constructor(inningGroups) {
        this.#totalInnings = +inningGroups;
        this.#currentOuts = 0;
        this.#maxOuts = this.#totalInnings * 3;
        this.#onBase = [];
        this.#currentScore = 0;
    }

    isGameConcluded() {
        return this.#currentOuts === this.#maxOuts;
    }

    displayScoreAndReset() {
        console.log(this.#currentScore);
        this.#currentScore = 0;
        this.#onBase = [];
    }

    #handleHitPlay() {
        let nextBaseOccupants = [];
        let runsScoredThisTurn = 0;

        for (let i = 0; i < this.#onBase.length; i++) {
            if (this.#onBase[i] === 3) {
                runsScoredThisTurn++;
            } else {
                nextBaseOccupants.push(this.#onBase[i] + 1);
            }
        }
        nextBaseOccupants.push(1); // New batter reaches first base
        this.#currentScore += runsScoredThisTurn;
        this.#onBase = nextBaseOccupants;
        return 'continue_play';
    }

    #handleHomerunPlay() {
        this.#currentScore += this.#onBase.length + 1;
        this.#onBase.length = 0;
        return 'continue_play';
    }

    #handleOutPlay() {
        this.#currentOuts++;
        return (this.#currentOuts % 3 === 0) ? 'inning_change' : 'continue_play';
    }

    processPlay(command) {
        const playDispatch = {
            'HIT': this.#handleHitPlay,
            'HOMERUN': this.#handleHomerunPlay,
            'OUT': this.#handleOutPlay
        };
        const handlerFunction = playDispatch[command];
        if (handlerFunction) {
            return handlerFunction.call(this);
        }
        return 'continue_play';
    }
}

const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split('\n');
let gameInstance = new DiamondPlay(inputData.shift());

let commandPointer = 0;
while (commandPointer < inputData.length) {
    const currentCommand = inputData[commandPointer++];
    const outcome = gameInstance.processPlay(currentCommand);
    if (outcome === 'inning_change') {
        gameInstance.displayScoreAndReset();
        if (gameInstance.isGameConcluded()) {
            break;
        }
    }
}
