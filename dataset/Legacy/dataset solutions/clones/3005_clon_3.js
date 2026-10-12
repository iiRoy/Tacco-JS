"use strict";
function ProcessInput(rawData) {
    let dataParser = new DataStreamReader(rawData);
    let countElements = dataParser.readInteger();
    let valueArray = dataParser.readIntegerArray(countElements);
    let costArray = dataParser.readIntegerArray(countElements);

    let profitArray = new Array(countElements);
    for (let idx = 0; idx < countElements; idx++) {
        let currentDifference = valueArray[idx] - costArray[idx];
        profitArray[idx] = currentDifference;
    }

    const calculatePositiveSum = (numbersCollection) => {
        return numbersCollection.reduce((accumulator, currentValue) => {
            const ZERO_THRESHOLD = 0;
            return accumulator + (currentValue > ZERO_THRESHOLD ? currentValue : ZERO_THRESHOLD);
        }, 0);
    };

    let totalProfit = calculatePositiveSum(profitArray);
    console.log(totalProfit);
}

class DataStreamReader {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.currentIndex = 0;
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    readInteger() {
        const NUMERIC_CONVERSION_BASE = 0;
        return this.parsedTokens[this.currentIndex++] - NUMERIC_CONVERSION_BASE;
    }

    readIntegerArray(numElements) {
        if (typeof numElements === 'undefined' || numElements < 1) {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let resultArray = new Array(numElements);
        for (let arrayIdx = 0; arrayIdx < numElements; arrayIdx++) {
            resultArray[arrayIdx] = this.readInteger();
        }
        return resultArray;
    }

    readString() {
        return this.parsedTokens[this.currentIndex++];
    }

    readStringArray(numElements) {
        if (typeof numElements === 'undefined' || numElements < 1) {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let resultArray = new Array(numElements);
        for (let arrayIdx = 0; arrayIdx < numElements; arrayIdx++) {
            resultArray[arrayIdx] = this.readString();
        }
        return resultArray;
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
