class InputManager {
    constructor() {
        this.dataSegments = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split(/\s+/);
        this.currentPosition = 0;
    }

    retrieveNextNumber() {
        if (this.currentPosition >= this.dataSegments.length) {
            throw new Error("Input exhausted.");
        }
        const val = Number(this.dataSegments[this.currentPosition]);
        this.currentPosition++;
        return val;
    }
}

(function executeProcessing() {
    const dataStream = new InputManager();

    const itemsToRead = dataStream.retrieveNextNumber();

    const buildNumericCollection = (count, collector = []) => {
        if (count === 0) {
            return collector;
        }
        collector.push(dataStream.retrieveNextNumber());
        return buildNumericCollection(count - 1, collector);
    };
    const inputNumbers = buildNumericCollection(itemsToRead);

    const determineAggregateXor = (elements, idx = 0, currentTotal = 0) => {
        if (idx === elements.length) {
            return currentTotal;
        }
        return determineAggregateXor(elements, idx + 1, currentTotal ^ elements[idx]);
    };
    const overallXorResult = determineAggregateXor(inputNumbers);

    const resultantSequence = [];
    const deriveOutputSequence = (originalElements, index = 0) => {
        if (index === originalElements.length) {
            return;
        }
        resultantSequence.push(overallXorResult ^ originalElements[index]);
        deriveOutputSequence(originalElements, index + 1);
    };
    deriveOutputSequence(inputNumbers);

    console.log(resultantSequence.join(' '));
})();