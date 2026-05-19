const fs = require("fs");

class ElementQueue {
    constructor(initialElements = []) {
        this.dataStore = initialElements;
        this.currentSize = initialElements.length;
        this.readPointer = 0;
    }

    enqueue(elementToAdd) {
        this.currentSize += 1;
        this.dataStore.push(elementToAdd);
    }

    dequeue() {
        if (this.readPointer >= this.dataStore.length) {
            return undefined;
        }
        const removedElement = this.dataStore[this.readPointer];
        this.currentSize -= 1;
        this.readPointer += 1;
        return removedElement;
    }

    peek() {
        if (this.readPointer >= this.dataStore.length) {
            return undefined;
        }
        return this.dataStore[this.readPointer];
    }

    clear() {
        this.dataStore = [];
        this.currentSize = 0;
        this.readPointer = 0;
    }

    hasRemaining() {
        return this.readPointer < this.dataStore.length;
    }
}

class StreamParser {
    static get WHITESPACE_REGEX() {
        return /\s+/g;
    }

    constructor(rawInputText) {
        const tokenizedInput = rawInputText.trim().split(StreamParser.WHITESPACE_REGEX);
        this.inputQueue = new ElementQueue(tokenizedInput);
    }

    readString() {
        return this.inputQueue.dequeue();
    }

    readInt() {
        const stringValue = this.inputQueue.dequeue();
        return parseInt(stringValue, 10);
    }

    clearInput() {
        this.inputQueue.clear();
    }

    hasMoreData() {
        return this.inputQueue.hasRemaining();
    }
}

function processInputData(inputProcessor) {
    const numElements = inputProcessor.readInt();
    const inputValues = new Array(numElements);

    for (let loopIndex = 0; loopIndex < numElements; loopIndex++) {
        inputValues[loopIndex] = inputProcessor.readInt();
    }

    const INITIAL_BOUND_VALUE = 2;
    const lowerBounds = new Array(numElements + 1);
    const upperBounds = new Array(numElements + 1);

    lowerBounds[numElements] = INITIAL_BOUND_VALUE;
    upperBounds[numElements] = INITIAL_BOUND_VALUE;

    for (let reverseIndex = numElements - 1; reverseIndex >= 0; reverseIndex--) {
        let currentCandidate = inputValues[reverseIndex];
        const nextLowerBound = lowerBounds[reverseIndex + 1];

        while (currentCandidate <= nextLowerBound) {
            currentCandidate += inputValues[reverseIndex];
        }

        const calculatedLowerBound = currentCandidate - 1;
        const calculatedUpperBound = currentCandidate - inputValues[reverseIndex];

        const isInvalidRange = calculatedLowerBound < inputValues[reverseIndex] || calculatedUpperBound > calculatedLowerBound;

        if (isInvalidRange) {
            console.log(-1);
            return;
        }

        lowerBounds[reverseIndex] = calculatedLowerBound;
        upperBounds[reverseIndex] = calculatedUpperBound;
    }

    console.log(`${upperBounds[0]} ${lowerBounds[0]}`);
}

const stdinContent = fs.readFileSync("/dev/stdin", "utf8");
const parserInstance = new StreamParser(stdinContent);
processInputData(parserInstance);
