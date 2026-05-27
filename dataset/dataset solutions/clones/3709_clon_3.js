"use strict";
function ProcessInput(rawData) {
    let dataParser = new InputProcessor(rawData);
    let arraySize = dataParser.getInt();
    let originalValues = dataParser.getIntArray(arraySize);

    const calculateTransformedValue = (val, index) => {
        const offset = index + 1;
        return val - offset;
    };

    let transformedValues = originalValues.map((val, index) => calculateTransformedValue(val, index));
    
    transformedValues.sort((a, b) => a - b);

    const middleIndex = Math.floor(arraySize / 2);
    const medianValue = transformedValues[middleIndex];

    const calculateAbsoluteDifference = (originalVal, index, median) => {
        const targetValue = median + index + 1;
        return Math.abs(originalVal - targetValue);
    };

    let finalSum = 0;
    for (let i = 0; i < arraySize; i++) {
        finalSum += calculateAbsoluteDifference(originalValues[i], i, medianValue);
    }
    
    console.log(finalSum);
}

class InputProcessor {
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.currentIndex = 0;
        this.parsedTokens = sourceText.split(/\s+/);
    }

    _validateCount(count) {
        if (typeof count === 'undefined') {
            throw new Error('Argument (count) cannot be omitted!');
        }
        if (count < 1) {
            throw new Error('Argument count must be 1 or greater!');
        }
    }

    getInt() {
        return Number(this.parsedTokens[this.currentIndex++]);
    }

    getIntArray(count) {
        this._validateCount(count);
        return Array.from({ length: count }, () => this.getInt());
    }

    getStr() {
        return this.parsedTokens[this.currentIndex++];
    }

    getStrArray(count) {
        this._validateCount(count);
        return Array.from({ length: count }, () => this.getStr());
    }
}

if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
