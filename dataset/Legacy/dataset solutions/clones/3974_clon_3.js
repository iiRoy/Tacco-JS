"use strict";

function findLowerBound(sortedArr, targetVal) {
    let leftIdx = 0;
    let rightIdx = sortedArr.length - 1;
    let resultIdx = sortedArr.length;

    while (leftIdx <= rightIdx) {
        const midIdx = Math.floor((leftIdx + rightIdx) / 2);
        if (targetVal <= sortedArr[midIdx]) {
            resultIdx = midIdx;
            rightIdx = midIdx - 1;
        } else {
            leftIdx = midIdx + 1;
        }
    }
    return resultIdx;
}

function calculateBitParity(currentMaskedAValue, sortedMaskedBArray, currentThreshold) {
    const T = currentThreshold;
    
    const fromRange1 = findLowerBound(sortedMaskedBArray, 1 * T - currentMaskedAValue);
    const toRange1 = findLowerBound(sortedMaskedBArray, 2 * T - currentMaskedAValue);
    const fromRange2 = findLowerBound(sortedMaskedBArray, 3 * T - currentMaskedAValue);
    const toRange2 = findLowerBound(sortedMaskedBArray, 4 * T - currentMaskedAValue);

    const contributionSum = (toRange1 - fromRange1) + (toRange2 - fromRange2);
    return contributionSum % 2;
}

function processInput(rawData) {
    const inputReader = new InputParser(rawData);
    const numElements = inputReader.getInt();
    const arrA = inputReader.getIntArray(numElements);
    const arrB = inputReader.getIntArray(numElements);

    let finalResult = 0;

    for (let bitPosition = 0; bitPosition < 30; bitPosition++) {
        let currentParityCount = 0;
        const currentMask = (1 << (bitPosition + 1)) - 1;

        const maskedAValues = arrA.map(val => val & currentMask);
        const maskedBValues = arrB.map(val => val & currentMask);
        
        maskedBValues.sort((val1, val2) => val1 - val2);

        const thresholdValue = 1 << bitPosition;

        for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
            const currentContributionParity = calculateBitParity(
                maskedAValues[elementIndex],
                maskedBValues,
                thresholdValue
            );
            currentParityCount = (currentParityCount + currentContributionParity) % 2;
        }

        if (currentParityCount === 1) {
            finalResult |= (1 << bitPosition);
        }
    }
    console.log(finalResult);
}

class InputParser {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.currentIndex = 0;
        this.parsedItems = sourceText.split(/\n|\s/);
    }

    _ensureArgumentProvided(argValue, argName) {
        if (typeof argValue === 'undefined') {
            throw new Error(`Argument (${argName}) cannot be omitted!`);
        }
    }

    getInt() {
        return parseInt(this.parsedItems[this.currentIndex++], 10);
    }

    _getArray(size, parserFn) {
        this._ensureArgumentProvided(size, '1 or more');
        const resultArray = new Array(size);
        for (let loopIndex = 0; loopIndex < size; loopIndex++) {
            resultArray[loopIndex] = parserFn.call(this);
        }
        return resultArray;
    }

    getIntArray(size) {
        return this._getArray(size, this.getInt);
    }

    getStr() {
        return this.parsedItems[this.currentIndex++];
    }

    getStrArray(size) {
        return this._getArray(size, this.getStr);
    }
}

if (typeof window === "undefined") {
    processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
