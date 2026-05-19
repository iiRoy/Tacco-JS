"use strict"
class DataStreamProcessor {
    #sourceLines;
    #currentPosition;

    constructor() {
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.#sourceLines = rawContent.trim().split("\n");
        this.#currentPosition = 0;
    }

    hasMoreEntries() {
        return this.#currentPosition < this.#sourceLines.length;
    }

    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#sourceLines[this.#currentPosition++];
    }

    retrieveNumericEntry() {
        return Number(this.retrieveNextEntry());
    }

    retrieveTokenArray() {
        return this.retrieveNextEntry().split(" ");
    }

    retrieveNumericArray() {
        return this.retrieveTokenArray().map(Number);
    }

    retrieveCharSequence() {
        return Array.from(this.retrieveNextEntry());
    }
}

const inputHandler = new DataStreamProcessor();

const getNextEntry = () => inputHandler.retrieveNextEntry();
const getNextNumeric = () => inputHandler.retrieveNumericEntry();
const getNextTokenArray = () => inputHandler.retrieveTokenArray();
const getNextNumericArray = () => inputHandler.retrieveNumericArray();
const getNextCharSequence = () => inputHandler.retrieveCharSequence();
const checkMoreEntries = () => inputHandler.hasMoreEntries();

const displayOutput = (...items) => console.log(...items);

const processApplication = () => {
    const initialValue = getNextNumeric();
    const zeroBuffer = Array.from({ length: initialValue }, () => 0);

    const firstCollection = [];
    const secondCollection = [];

    while (checkMoreEntries()) {
        const currentPairData = getNextNumericArray();
        firstCollection.push(currentPairData[0]);
        secondCollection.push(currentPairData[1]);
    }

    const finalAdjustment = Array.from({ length: initialValue }, (_, i) => i)
        .reduceRight((currentAdjustment, idx) => {
            let intermediateSum = firstCollection[idx] + currentAdjustment;
            
            currentAdjustment += (secondCollection[idx] - (intermediateSum % secondCollection[idx])) % secondCollection[idx];

            intermediateSum += zeroBuffer[idx]; 

            return currentAdjustment;
        }, 0);

    const computedResult = zeroBuffer.reduce((accumulator, currentElement) => accumulator + currentElement, 0);
    displayOutput(computedResult);
};

processApplication();
