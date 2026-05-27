const fileSystem = require("fs");

class DataQueue {
    constructor(initialElements = []) {
        this.currentItems = initialElements;
        this.currentIndex = 0;
        this.queueSize = initialElements.length;
    }

    enqueue(itemToAdd) {
        this.queueSize++;
        this.currentItems.push(itemToAdd);
    }

    dequeue() {
        const dequeuedItem = this.currentItems[this.currentIndex];
        this.queueSize--;
        this.currentIndex++;
        return dequeuedItem;
    }

    clearQueue() {
        this.currentItems = [];
        this.queueSize = 0;
        this.currentIndex = 0;
    }
}

class InputProcessor {
    constructor(rawInputString) {
        const inputParts = rawInputString.trim().split(/\s+/g);
        this.inputQueue = new DataQueue(inputParts);
    }

    readNextString() {
        return this.inputQueue.dequeue();
    }

    readNextInt() {
        return parseInt(this.inputQueue.dequeue(), 10);
    }

    finishProcessing() {
        this.inputQueue.clearQueue();
    }
}

const MODULO_CONSTANT = 1000000007;
const REMAINDER_COUNT = 13;
const TARGET_FINAL_REMAINDER = 5;

function updateDynamicProgrammingEntry(dpTable, currentStringPosition, nextRemainderValue, valueFromPreviousState) {
    dpTable[currentStringPosition][nextRemainderValue] = (dpTable[currentStringPosition][nextRemainderValue] + valueFromPreviousState) % MODULO_CONSTANT;
}

const solveProblemLogic = function (inputReaderInstance) {
    const inputSequence = inputReaderInstance.readNextString();
    const sequenceLength = inputSequence.length;

    const dpTable = Array.from({ length: sequenceLength + 1 }, () => Array(REMAINDER_COUNT).fill(0));

    dpTable[0][0] = 1;

    for (let currentPosition = 1; currentPosition <= sequenceLength; currentPosition++) {
        const charAtCurrentPosition = inputSequence[currentPosition - 1];

        if (charAtCurrentPosition === "?") {
            for (let previousRemainder = 0; previousRemainder < REMAINDER_COUNT; previousRemainder++) {
                for (let digitOption = 0; digitOption < 10; digitOption++) {
                    const newRemainder = (previousRemainder * 10 + digitOption) % REMAINDER_COUNT;
                    updateDynamicProgrammingEntry(dpTable, currentPosition, newRemainder, dpTable[currentPosition - 1][previousRemainder]);
                }
            }
        } else {
            const fixedDigitValue = Number(charAtCurrentPosition);
            for (let previousRemainder = 0; previousRemainder < REMAINDER_COUNT; previousRemainder++) {
                const newRemainder = (previousRemainder * 10 + fixedDigitValue) % REMAINDER_COUNT;
                updateDynamicProgrammingEntry(dpTable, currentPosition, newRemainder, dpTable[currentPosition - 1][previousRemainder]);
            }
        }
    }

    console.log(dpTable[sequenceLength][TARGET_FINAL_REMAINDER]);
};

const executeSolution = function (inputDataString) {
    const processor = new InputProcessor(inputDataString);
    solveProblemLogic(processor);
};

executeSolution(fileSystem.readFileSync("/dev/stdin", "utf8"));
