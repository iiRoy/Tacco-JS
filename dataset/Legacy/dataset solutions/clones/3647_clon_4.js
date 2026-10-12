"use strict";
function solveProblem(inputContent) {
    let dataHandler = new TextStreamProcessor(inputContent);
    let inputSequence = dataHandler.extractString();
    let sequenceLength = inputSequence.length;

    const targetPattern = "ABC";
    const moduloConstant = 1000000007;

    let memoizationStore = new Map();

    function countValidSubsequences(currentIdx, patternIdx) {
        const cacheKey = `${currentIdx}_${patternIdx}`;
        if (memoizationStore.has(cacheKey)) {
            return memoizationStore.get(cacheKey);
        }

        if (currentIdx === sequenceLength) {
            return patternIdx === 3 ? 1 : 0;
        }

        let currentCharacter = inputSequence[currentIdx];
        let waysCount = 0;

        let multiplierForNonMatch = (currentCharacter === '?' ? 3 : 1);
        waysCount = (countValidSubsequences(currentIdx + 1, patternIdx) * multiplierForNonMatch) % moduloConstant;

        if (patternIdx < 3 && (currentCharacter === '?' || currentCharacter === targetPattern[patternIdx])) {
            waysCount = (waysCount + countValidSubsequences(currentIdx + 1, patternIdx + 1)) % moduloConstant;
        }

        memoizationStore.set(cacheKey, waysCount);
        return waysCount;
    }

    let finalResult = countValidSubsequences(0, 0);
    console.log(finalResult);
}

class TextStreamProcessor {
    constructor(sourceText) {
        this.positionPointer = 0;
        this.tokenArray = sourceText.split(/\n|\s/);
    }

    extractInteger() {
        return parseInt(this.tokenArray[this.positionPointer++], 10);
    }

    extractIntegerSequence(count) {
        let sequence = new Array(count);
        for (let k = 0; k < count; k++) {
            sequence[k] = this.extractInteger();
        }
        return sequence;
    }

    extractString() {
        return this.tokenArray[this.positionPointer++];
    }

    extractStringSequence(count) {
        let sequence = new Array(count);
        for (let k = 0; k < count; k++) {
            sequence[k] = this.extractString();
        }
        return sequence;
    }
}

if (typeof window === "undefined") {
    solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
}
