"use strict";

class InputProcessor {
    #dataLines;
    #currentLineIndex;
    #totalLines;

    constructor(filePath) {
        const fileContent = require("fs").readFileSync(filePath, "utf8");
        this.#dataLines = fileContent.trim().split("\n");
        this.#currentLineIndex = 0;
        this.#totalLines = this.#dataLines.length;
    }

    canReadNext() {
        return this.#currentLineIndex < this.#totalLines;
    }

    readNextLine() {
        if (!this.canReadNext()) {
            throw new Error("ArrayIndexOutOfBoundsException: Attempted to read past end of input.");
        }
        return this.#dataLines[this.#currentLineIndex++];
    }
}

const inputProcessorInstance = new InputProcessor("/dev/stdin");

const getNextLine = () => inputProcessorInstance.readNextLine();
const getNextInt = () => parseInt(inputProcessorInstance.readNextLine());
const getNextStringArray = () => inputProcessorInstance.readNextLine().split(" ");
const getNextIntArray = () => inputProcessorInstance.readNextLine().split(" ").map(Number);
const getNextCharArray = () => inputProcessorInstance.readNextLine().split("");
const hasMoreLines = () => inputProcessorInstance.canReadNext();
const printOutput = (...args) => console.log(...args);

const computePrefixSums = (inputArray) => {
    const prefixSums = [0];
    let currentAccumulatedSum = 0;
    for (let k = 0; k < inputArray.length; k++) {
        currentAccumulatedSum += inputArray[k];
        prefixSums.push(currentAccumulatedSum);
    }
    return prefixSums;
};

const executeMainLogic = () => {
    let [numN, numM, numK] = getNextIntArray();
    let arrayA = getNextIntArray();
    let arrayB = getNextIntArray();

    const prefixSumsA = computePrefixSums(arrayA);
    const prefixSumsB = computePrefixSums(arrayB);

    let maxBooksRead = 0;

    const nLoopLimit = numN;
    for (let idxA = 0, idxB = numM; idxA <= nLoopLimit; idxA++) {
        const currentSumOfA = prefixSumsA[idxA];
        if (currentSumOfA > numK) {
            break;
        }

        while (idxB >= 0) {
            const combinedCost = currentSumOfA + prefixSumsB[idxB];
            if (combinedCost > numK) {
                idxB--;
            } else {
                break;
            }
        }
        
        const currentTotalBooks = idxA + idxB;
        maxBooksRead = Math.max(maxBooksRead, currentTotalBooks);
    }
    printOutput(maxBooksRead);
};

executeMainLogic();
