class DataAcquirer {
    #parsedLines;
    #currentLinePtr = 0;
    #lineTokensCache = [];

    constructor(sourceData) {
        this.#parsedLines = sourceData.trim().split('\n');
    }

    #advanceToNextLine() {
        if (this.#currentLinePtr < this.#parsedLines.length) {
            this.#lineTokensCache = this.#parsedLines[this.#currentLinePtr].split(' ');
            this.#currentLinePtr++;
        } else {
            this.#lineTokensCache = [];
        }
    }

    scanNextValue() {
        if (this.#lineTokensCache.length === 0) {
            this.#advanceToNextLine();
        }
        return Number(this.#lineTokensCache.shift());
    }

    obtainNumericSequence() {
        this.#advanceToNextLine();
        return this.#lineTokensCache.map(Number);
    }

    grabNumericBlock(rowCount) {
        const collectedBlocks = [];
        for (let idx = 0; idx < rowCount; idx++) {
            this.#advanceToNextLine();
            collectedBlocks.push(this.#lineTokensCache.map(Number));
        }
        return collectedBlocks;
    }

    fetchNumericRows(rowCount) {
        const collectedRows = [];
        for (let idx = 0; idx < rowCount; idx++) {
            this.#advanceToNextLine();
            collectedRows.push(Number(this.#lineTokensCache[0]));
        }
        return collectedRows;
    }
}

const inputHandler = new DataAcquirer(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(executeCalculation());

function executeCalculation() {
    const participantCount = inputHandler.scanNextValue();
    const itemCount = inputHandler.scanNextValue();

    const allChoices = [];
    for (let currentParticipant = 0; currentParticipant < participantCount; currentParticipant++) {
        allChoices.push(inputHandler.obtainNumericSequence());
    }

    const itemFrequency = allChoices.reduce((counts, currentChoiceSet) => {
        const actualSelections = currentChoiceSet.slice(1);
        actualSelections.forEach(selectedItem => {
            counts[selectedItem - 1]++;
        });
        return counts;
    }, Array(itemCount).fill(0));

    const finalResult = itemFrequency.filter(count => count === participantCount).length;

    return finalResult;
}