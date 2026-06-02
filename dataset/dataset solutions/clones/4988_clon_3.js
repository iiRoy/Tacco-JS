'use strict';

function ProcessInput(rawData) {
    let inputParser = new InputReader(rawData);

    let valA = inputParser.getNextInteger();
    let valB = inputParser.getNextInteger();
    let valC = inputParser.getNextInteger();

    // Early exit if any input value is even
    if (valA % 2 === 0 || valB % 2 === 0 || valC % 2 === 0) {
        console.log(0);
        return;
    }

    const currentMax = Math.max(valA, valB, valC);
    let maximumValue = currentMax; // Helper variable for clarity

    let firstHalfLen = Math.floor(maximumValue / 2);
    let secondHalfLen = maximumValue - firstHalfLen;

    let smallerValues = [];
    const allInputValues = [valA, valB, valC]; // Temporary array for iteration

    // Populate smallerValues array with values less than the maximum
    for (const singleVal of allInputValues) {
        if (singleVal < maximumValue) {
            smallerValues.push(singleVal);
        }
    }

    // Ensure smallerValues has at least two elements by adding maximumValue if needed
    while (smallerValues.length < 2) {
        smallerValues.push(maximumValue);
    }

    // Calculate intermediate results for the final output
    const heightDifference = Math.abs(secondHalfLen - firstHalfLen);
    const productOfOtherDims = smallerValues[0] * smallerValues[1];

    // Log the final computed result
    console.log(heightDifference * productOfOtherDims);
}

class InputReader {
    constructor(inputString) {
        this.tokenArray = [];
        this.currentTokenIndex = 0;

        if (typeof inputString === 'string') {
            const processedTokens = inputString.trim().split(/\s+/);
            this.tokenArray = processedTokens;
        }
    }

    hasMoreTokens() {
        return this.currentTokenIndex < this.tokenArray.length;
    }

    getNextToken() {
        if (this.hasMoreTokens()) {
            const currentToken = this.tokenArray[this.currentTokenIndex];
            this.currentTokenIndex++;
            return currentToken;
        }
        return null;
    }

    getNextInteger() {
        if (this.hasMoreTokens()) {
            const rawValue = this.tokenArray[this.currentTokenIndex];
            this.currentTokenIndex++;
            return parseInt(rawValue, 10);
        }
        return null;
    }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
