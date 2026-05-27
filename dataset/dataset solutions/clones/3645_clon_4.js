"use strict";

function ProcessInput(inputContent) {
    let dataHandler = new DataProcessor(inputContent);
    let inputSequence = dataHandler.retrieveString();
    let sequenceLength = inputSequence.length;

    const targetPattern = "ABC";
    const primeModulus = 1000000007;

    let memoizationCache = Array.from({ length: sequenceLength + 1 }, () =>
        Array.from({ length: targetPattern.length + 1 }, () => null)
    );

    function calculateSubsequenceWays(currentStringPosition, currentPatternPosition) {
        if (currentPatternPosition === targetPattern.length) {
            return 1;
        }

        if (currentStringPosition === sequenceLength) {
            return 0;
        }

        if (memoizationCache[currentStringPosition][currentPatternPosition] !== null) {
            return memoizationCache[currentStringPosition][currentPatternPosition];
        }

        let totalWays = 0;
        const charInInput = inputSequence[currentStringPosition];
        const charInPattern = targetPattern[currentPatternPosition];

        totalWays = (calculateSubsequenceWays(currentStringPosition + 1, currentPatternPosition) * (charInInput === '?' ? 3 : 1)) % primeModulus;

        if (charInInput === '?' || charInInput === charInPattern) {
            totalWays = (totalWays + calculateSubsequenceWays(currentStringPosition + 1, currentPatternPosition + 1)) % primeModulus;
        }

        memoizationCache[currentStringPosition][currentPatternPosition] = totalWays;
        return totalWays;
    }

    console.log(calculateSubsequenceWays(0, 0));
}

class DataProcessor {
    constructor(sourceText) {
        this.positionIndex = 0;
        this.dataSegments = sourceText.split(/\n|\s/);
    }

    retrieveInteger() {
        return parseInt(this.dataSegments[this.positionIndex++], 10);
    }

    retrieveIntegerArray(count) {
        let resultCollection = new Array(count);
        for (let k = 0; k < count; k++) {
            resultCollection[k] = this.retrieveInteger();
        }
        return resultCollection;
    }

    retrieveString() {
        return this.dataSegments[this.positionIndex++];
    }

    retrieveStringArray(count) {
        let resultCollection = new Array(count);
        for (let k = 0; k < count; k++) {
            resultCollection[k] = this.retrieveString();
        }
        return resultCollection;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
