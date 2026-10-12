const fileSystemModule = require('fs');

class DataStreamProcessor {
    #dataTokens;
    #currentPosition;

    constructor(rawDataString) {
        this.#dataTokens = rawDataString.trim().split(/\s+/).filter(Boolean);
        this.#currentPosition = 0;
    }

    getNextInteger() {
        if (this.#currentPosition >= this.#dataTokens.length) {
            return NaN;
        }
        const tokenValue = this.#dataTokens[this.#currentPosition];
        this.#currentPosition++;
        return parseInt(tokenValue, 10);
    }
}

function calculateMinRemovalsForConsecutiveSequence(inputProcessor) {
    const totalElementsCount = inputProcessor.getNextInteger();

    const sequenceNumbers = new Array(totalElementsCount);
    for (let i = 0; i < totalElementsCount; i++) {
        sequenceNumbers[i] = inputProcessor.getNextInteger();
    }

    const consecutiveLengths = Array.from({ length: totalElementsCount + 1 }, () => 0);

    for (const currentNumber of sequenceNumbers) {
        consecutiveLengths[currentNumber] = consecutiveLengths[currentNumber - 1] + 1;
    }

    let maximumConsecutiveLength = 0;
    for (let k = 0; k <= totalElementsCount; k++) {
        if (consecutiveLengths[k] > maximumConsecutiveLength) {
            maximumConsecutiveLength = consecutiveLengths[k];
        }
    }

    console.log(totalElementsCount - maximumConsecutiveLength);
}

try {
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const processorInstance = new DataStreamProcessor(standardInputContent);
    calculateMinRemovalsForConsecutiveSequence(processorInstance);
} catch (error) {
    throw error;
}
