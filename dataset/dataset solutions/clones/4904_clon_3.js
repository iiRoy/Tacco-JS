const fileSystemModule = require('fs');

class InputQueue {
    constructor(initialItems = []) {
        this.queueItems = initialItems;
        this.currentSize = initialItems.length;
        this.dequeueIndex = 0;
    }

    enqueueItem(itemToEnqueue) {
        this.currentSize++;
        this.queueItems.push(itemToEnqueue);
    }

    dequeueItem() {
        const dequeuedItem = this.queueItems[this.dequeueIndex];
        this.currentSize--;
        this.dequeueIndex++;
        return dequeuedItem;
    }

    clearQueue() {
        this.queueItems = [];
        this.currentSize = 0;
        this.dequeueIndex = 0;
    }
}

class DataInputReader {
    static _tokenizeInputString(rawInputContent) {
        return rawInputContent.trim().split(/\s+/g);
    }

    constructor(rawInputContent) {
        const tokenizedParts = DataInputReader._tokenizeInputString(rawInputContent);
        this.inputQueue = new InputQueue(tokenizedParts);
    }

    readStringToken() {
        return this.inputQueue.dequeueItem();
    }

    readIntegerToken() {
        const stringToken = this.inputQueue.dequeueItem();
        return parseInt(stringToken, 10);
    }

    clearInput() {
        this.inputQueue.clearQueue();
    }
}

function processNumberSequence(inputReaderInstance) {
    // Read and discard the first integer as per original logic
    inputReaderInstance.readIntegerToken();

    const numberOfElements = inputReaderInstance.readIntegerToken();
    const numberCollection = new Array(numberOfElements);

    let maximumValue = 0;
    let indexOfMaximum = -1;

    // Populate the array and identify the maximum value along with its index
    for (let currentPosition = 0; currentPosition < numberOfElements; currentPosition++) {
        const valueAtCurrentPosition = inputReaderInstance.readIntegerToken();
        numberCollection[currentPosition] = valueAtCurrentPosition;

        if (valueAtCurrentPosition > maximumValue) {
            maximumValue = valueAtCurrentPosition;
            indexOfMaximum = currentPosition;
        }
    }

    let sumOfOtherElements = 0;
    // Calculate the sum of all elements excluding the maximum one
    for (let iterationIndex = 0; iterationIndex < numberOfElements; iterationIndex++) {
        if (iterationIndex !== indexOfMaximum) {
            sumOfOtherElements += numberCollection[iterationIndex];
        }
    }

    const MINIMUM_OUTPUT_VALUE = 0;
    const finalCalculatedResult = maximumValue - 1 - sumOfOtherElements;

    if (finalCalculatedResult < MINIMUM_OUTPUT_VALUE) {
        console.log(MINIMUM_OUTPUT_VALUE);
    } else {
        console.log(finalCalculatedResult);
    }
}

function executeMainProcessing(inputContentString) {
    const dataReader = new DataInputReader(inputContentString);
    processNumberSequence(dataReader);
}

module.exports = executeMainProcessing;

// This immediately executes the main processing logic,
// mimicking the side effect of the original bundled code's IIFE.
executeMainProcessing(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
