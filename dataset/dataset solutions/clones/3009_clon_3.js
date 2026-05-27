"use strict";
function processApplication(sourceData) {
    let dataProcessor = new InputDataStream(sourceData);
    let totalElements = dataProcessor.readNextInteger();
    let numericSequence = dataProcessor.readIntegerSequence(totalElements);

    function computeGreatestCommonDivisor(valA, valB) {
        let currentA = valA;
        let currentB = valB;
        while (currentB !== 0) {
            let tempRemainder = currentA % currentB;
            currentA = currentB;
            currentB = tempRemainder;
        }
        return currentA;
    }

    let leftPrefixGCDs = Array.from({ length: totalElements + 2 });
    leftPrefixGCDs[0] = 0;

    for (let index = 0; index <= totalElements; index++) {
        leftPrefixGCDs[index + 1] = computeGreatestCommonDivisor(leftPrefixGCDs[index], numericSequence[index]);
    }

    let rightSuffixGCDs = Array.from({ length: totalElements + 1 });
    rightSuffixGCDs[totalElements] = 0;

    for (let index = totalElements - 1; index >= 0; index--) {
        rightSuffixGCDs[index] = computeGreatestCommonDivisor(rightSuffixGCDs[index + 1], numericSequence[index]);
    }

    let intermediateGCDs = Array.from({ length: totalElements });

    for (let index = 0; index < totalElements; index++) {
        intermediateGCDs[index] = computeGreatestCommonDivisor(leftPrefixGCDs[index], rightSuffixGCDs[index + 1]);
    }

    let maximumPossibleGCD = 0;
    if (intermediateGCDs.length > 0) {
        maximumPossibleGCD = intermediateGCDs[0];
        for (let index = 1; index < intermediateGCDs.length; index++) {
            if (intermediateGCDs[index] > maximumPossibleGCD) {
                maximumPossibleGCD = intermediateGCDs[index];
            }
        }
    }
    console.log(maximumPossibleGCD);
}

class InputDataStream {
    constructor(inputStringContent) {
        if (typeof inputStringContent === 'undefined') {
            throw new Error('引数（stdin）を省略できません！');
        }
        this.currentReadIndex = 0;
        this.tokenizedInput = inputStringContent.split(/\n|\s/);
    }

    readNextInteger() {
        return parseInt(this.tokenizedInput[this.currentReadIndex++], 10);
    }

    readIntegerSequence(count) {
        if (typeof count === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let collectedValues = new Array(count);
        for (let loopCounter = 0; loopCounter < count; loopCounter++) {
            collectedValues[loopCounter] = this.readNextInteger();
        }
        return collectedValues;
    }

    readNextString() {
        return this.tokenizedInput[this.currentReadIndex++];
    }

    readStringSequence(count) {
        if (typeof count === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let collectedValues = new Array(count);
        for (let loopCounter = 0; loopCounter < count; loopCounter++) {
            collectedValues[loopCounter] = this.readNextString();
        }
        return collectedValues;
    }
}

if (typeof window === "undefined") {
    processApplication(require("fs").readFileSync("/dev/stdin", "utf8"));
}
