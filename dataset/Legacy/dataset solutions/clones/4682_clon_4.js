"use strict";

class InputProcessor {
    #dataLines;
    #currentLineIndex;
    #totalLines;

    constructor() {
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.#dataLines = rawContent.trim().split("\n");
        this.#currentLineIndex = 0;
        this.#totalLines = this.#dataLines.length;
    }

    hasMoreEntries() {
        return this.#currentLineIndex < this.#totalLines;
    }

    retrieveNextEntry() {
        if (!this.hasMoreEntries()) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return this.#dataLines[this.#currentLineIndex++];
    }
}

const dataStream = new InputProcessor();

const fetchLine = () => dataStream.retrieveNextEntry();
const fetchInteger = () => parseInt(dataStream.retrieveNextEntry());
const fetchStringArray = () => dataStream.retrieveNextEntry().split(" ");
const fetchIntegerArray = () => dataStream.retrieveNextEntry().split(" ").map(Number);
const fetchCharacterArray = () => dataStream.retrieveNextEntry().split("");
const checkMoreData = () => dataStream.hasMoreEntries();

const displayResult = (...values) => console.log(...values);

const reachabilityCache = new Map();

const evaluateReachability = (currentPosition, currentStep) => {
    const cacheKey = `${currentPosition},${currentStep}`;
    if (reachabilityCache.has(cacheKey)) {
        return reachabilityCache.get(cacheKey);
    }

    if (currentStep === 0) {
        return currentPosition === 0;
    }

    const canReach = evaluateReachability(currentPosition, currentStep - 1) ||
                     evaluateReachability(currentPosition - currentStep, currentStep - 1) ||
                     evaluateReachability(currentPosition + currentStep, currentStep - 1);
    
    reachabilityCache.set(cacheKey, canReach);
    return canReach;
};

const ProcessMain = () => {
    const targetValue = fetchInteger();

    for (let currentIteration = 1; ; currentIteration++) {
        if (evaluateReachability(targetValue - currentIteration, currentIteration - 1) || 
            evaluateReachability(targetValue + currentIteration, currentIteration - 1)) {
            displayResult(currentIteration);
            return;
        }
    }
};

ProcessMain();
