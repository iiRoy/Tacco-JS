'use strict';

class InputProcessor {
    constructor(inputString) {
        const rawLines = inputString.split('\n');
        if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') {
            rawLines.pop();
        }
        this.lines = rawLines;
        this.currentLineIndex = 0;
    }

    readIntsLine() {
        const lineContent = this.lines[this.currentLineIndex++];
        return lineContent.split(' ').map(valueStr => Number(valueStr));
    }

    readAllInts() {
        const startIndex = this.currentLineIndex;
        this.currentLineIndex = this.lines.length;
        return this.lines.slice(startIndex).map(valueStr => Number(valueStr));
    }

    readAllStrings() {
        const startIndex = this.currentLineIndex;
        this.currentLineIndex = this.lines.length;
        return this.lines.slice(startIndex);
    }

    readNStrings(count) {
        const startIndex = this.currentLineIndex;
        this.currentLineIndex += count;
        return this.lines.slice(startIndex, startIndex + count);
    }
}

const inputHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

(() => {
    const [arrayLength, targetCount] = inputHandler.readIntsLine();
    const dataArray = inputHandler.readIntsLine();

    const allSubarraySums = [];

    const generateAndCollectSums = (sourceArray, length) => {
        for (let outerIdx = 0; outerIdx < length; outerIdx++) {
            let currentSubarraySum = 0;
            for (let innerIdx = outerIdx; innerIdx < length; innerIdx++) {
                currentSubarraySum += sourceArray[innerIdx];
                allSubarraySums.push(currentSubarraySum);
            }
        }
    };

    generateAndCollectSums(dataArray, arrayLength);

    allSubarraySums.sort((valA, valB) => valB - valA);

    let finalResult = 0;

    const checkBitwiseMatch = (elementValue, requiredPattern) => {
        return (elementValue & requiredPattern) === requiredPattern;
    };

    const MAX_BIT_POSITION = 41; // As per original code's loop range

    for (let bitPosition = MAX_BIT_POSITION; bitPosition >= 0; bitPosition--) {
        const currentBitValue = 1 << bitPosition; // Equivalent to Math.pow(2, bitPosition)
        const potentialResultWithBit = finalResult + currentBitValue;

        const matchingSumsCount = allSubarraySums.filter(element =>
            checkBitwiseMatch(element, potentialResultWithBit)
        ).length;

        if (matchingSumsCount >= targetCount) {
            finalResult = potentialResultWithBit;
        }
    }

    console.log(finalResult);

})();
