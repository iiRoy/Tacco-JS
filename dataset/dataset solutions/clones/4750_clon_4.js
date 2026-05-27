"use strict";

class InputLineProvider {
    #sourceLines;
    #currentLineIndex;

    constructor(filePath) {
        this.#sourceLines = require("fs").readFileSync(filePath, "utf8").trim().split("\n");
        this.#currentLineIndex = 0;
    }

    fetchNext() {
        if (!this.hasMoreLines()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#sourceLines[this.#currentLineIndex++];
    }

    hasMoreLines() {
        return this.#currentLineIndex < this.#sourceLines.length;
    }
}

const dataStream = new InputLineProvider("/dev/stdin");

const retrieveNextLine = () => dataStream.fetchNext();
const extractNextInteger = () => parseInt(dataStream.fetchNext());
const extractNextIntegerArray = () => dataStream.fetchNext().split(" ").map(Number);
const extractNextCharacterArray = () => dataStream.fetchNext().split("");
const checkMoreData = () => dataStream.hasMoreLines();

const outputResult = (...values) => console.log(...values);

const executeProcessing = () => {
    const totalEntries = extractNextInteger();
    const entryPairs = [];

    while (checkMoreData()) {
        const currentEntry = extractNextIntegerArray();
        entryPairs.push({ primary: currentEntry[0], secondary: currentEntry[1] });
    }

    const finalAccumulation = entryPairs.reduceRight((currentAccumulator, pair) => {
        const combinedValue = pair.primary + currentAccumulator;
        const modulusDivisor = pair.secondary;
        const currentRemainder = combinedValue % modulusDivisor;

        const neededIncrement = (modulusDivisor - currentRemainder) % modulusDivisor;

        return currentAccumulator + neededIncrement;
    }, 0);

    outputResult(finalAccumulation);
};

executeProcessing();
