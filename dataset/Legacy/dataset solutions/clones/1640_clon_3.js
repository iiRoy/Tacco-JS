"use strict";

const InputProcessor = (function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenStream = rawInputData.split(/ |\n/);
    let currentTokenIndex = 0;

    const readNextToken = () => {
        return tokenStream[currentTokenIndex++];
    };

    const readInteger = () => {
        return parseInt(readNextToken(), 10);
    };

    const readString = () => {
        return readNextToken();
    };

    const readBigInteger = () => {
        return BigInt(readNextToken());
    };

    const readMultiple = (count, convertToNumber = true) => {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(convertToNumber ? readInteger() : readNextToken());
        }
        return result;
    };

    const readMatrix = (height, width, convertToNumber = true) => {
        const matrix = [];
        for (let i = 0; i < height; i++) {
            matrix.push(readMultiple(width, convertToNumber));
        }
        return matrix;
    };

    const initializeMultiDimensionalArray = (initialElementValue, ...dimensions) => {
        if (dimensions.length === 0) {
            try {
                return JSON.parse(initialElementValue);
            } catch (e) {
                return initialElementValue;
            }
        }

        const createDimension = (dimIndex) => {
            const currentDimensionSize = dimensions[dimIndex];
            const array = new Array(currentDimensionSize);
            for (let i = 0; i < currentDimensionSize; i++) {
                if (dimIndex === dimensions.length - 1) {
                    try {
                        array[i] = JSON.parse(initialElementValue);
                    } catch (e) {
                        array[i] = initialElementValue;
                    }
                } else {
                    array[i] = createDimension(dimIndex + 1);
                }
            }
            return array;
        };
        return createDimension(0);
    };

    return {
        readInteger,
        readString,
        readBigInteger,
        readMultiple,
        readMatrix,
        initializeMultiDimensionalArray
    };
})();


class FenwickTree {
    constructor(size) {
        this.treeData = new Array(size + 1).fill(0);
        this.maxIndex = size;
    }

    update(valueToAdd, position) {
        for (let i = position; i <= this.maxIndex; i += i & -i) {
            this.treeData[i] += valueToAdd;
        }
    }

    query(position) {
        let sumResult = 0;
        for (let i = position; i > 0; i -= i & -i) {
            sumResult += this.treeData[i];
        }
        return sumResult;
    }
}

const applicationMain = () => {
    const arraySize = InputProcessor.readInteger();
    const numQueries = InputProcessor.readInteger();
    const colorValues = InputProcessor.readMultiple(arraySize);

    const colorOccurrenceIndices = InputProcessor.initializeMultiDimensionalArray("[1]", arraySize);
    const fenwickInstance = new FenwickTree(arraySize + 1);
    const firstSeenColors = new Set();

    for (let i = 0; i < arraySize; i++) {
        const currentColor = --colorValues[i];
        colorOccurrenceIndices[currentColor].push(i + 1);
        if (!firstSeenColors.has(currentColor)) {
            firstSeenColors.add(currentColor);
            fenwickInstance.update(1, i + 1);
        }
    }

    for (let i = 0; i < arraySize; i++) {
        colorOccurrenceIndices[i].push(arraySize + 1);
    }

    const rawQueries = new Array(numQueries);
    for (let i = 0; i < numQueries; i++) {
        rawQueries[i] = [InputProcessor.readInteger(), InputProcessor.readInteger(), i];
    }

    rawQueries.sort((queryA, queryB) => queryA[0] - queryB[0]);

    const queryResults = new Array(numQueries);
    let currentLeftPointer = 1;

    const advanceWindowLeftBoundary = (targetLeftBoundary) => {
        while (currentLeftPointer < targetLeftBoundary) {
            const colorAtPointer = colorValues[currentLeftPointer - 1];
            
            const nextOccurrenceIndexInList = ++colorOccurrenceIndices[colorAtPointer][0];
            
            fenwickInstance.update(-1, currentLeftPointer);
            
            fenwickInstance.update(1, colorOccurrenceIndices[colorAtPointer][nextOccurrenceIndexInList]);
            
            currentLeftPointer++;
        }
    };

    for (let i = 0; i < numQueries; i++) {
        const [leftBound, rightBound, originalIdx] = rawQueries[i];

        advanceWindowLeftBoundary(leftBound);

        queryResults[originalIdx] = fenwickInstance.query(rightBound);
    }

    return queryResults.join("\n");
};

const finalOutput = applicationMain();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}
