"use strict";

// Encapsulates input reading logic, replacing global state with an object-oriented approach.
class InputProcessor {
    constructor(sourceText) {
        // Tokenizes input by matching sequences of non-whitespace characters,
        // which is a divergent strategy from splitting by space or newline.
        this.tokenBuffer = sourceText.match(/\S+/g) || [];
        this.currentPosition = 0; // Tracks the current token index.
    }

    // Renamed from 'next' and uses Number() for explicit type conversion.
    retrieveNumber() {
        return Number(this.tokenBuffer[this.currentPosition++]);
    }

    // Renamed from 'nextstr'.
    retrieveString() {
        return this.tokenBuffer[this.currentPosition++];
    }

    // Renamed from 'nextbig'.
    retrieveBigInt() {
        return BigInt(this.tokenBuffer[this.currentPosition++]);
    }

    // Renamed from 'nexts'.
    retrieveMany(count, convertToNumbers) {
        const segment = this.tokenBuffer.slice(this.currentPosition, this.currentPosition + count);
        this.currentPosition += count;
        return convertToNumbers ? segment.map(Number) : segment;
    }

    // Renamed from 'nextm' and uses an imperative loop for matrix construction.
    retrieveMatrix(rows, columns, convertToNumbers) {
        const matrixResult = [];
        for (let rIdx = 0; rIdx < rows; rIdx++) {
            const rowSegment = this.tokenBuffer.slice(this.currentPosition, this.currentPosition + columns);
            this.currentPosition += columns;
            matrixResult.push(convertToNumbers ? rowSegment.map(Number) : rowSegment);
        }
        return matrixResult;
    }
}

// Renamed from 'xArray' and implemented using recursion instead of eval.
// This function constructs nested arrays filled with a specified value.
function createNestedArrays(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        createNestedArrays(fillValue, ...remainingDimensions)
    );
}

// The main logic function, renamed from 'main'.
function calculateNearestMultiple() {
    // Reads input from stdin using the Node.js 'fs' module.
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    // Initializes the custom input processor.
    const inputHandler = new InputProcessor(rawInputData);

    // Retrieves the single numeric input value, renamed from 'n'.
    const inputVal = inputHandler.retrieveNumber();

    // Core logic: Determines the smallest multiple of 111 that is greater than or equal to inputVal.
    // Original approach used Math.ceil(inputVal / 111) * 111.
    // This clone uses a divergent strategy based on modulo arithmetic:
    // 1. Calculate the remainder when inputVal is divided by 111.
    // 2. Determine the 'adjustment' needed to reach the next multiple.
    //    If remainder is 0, adjustment is 0.
    //    If remainder is not 0, adjustment is (111 - remainder).
    //    The (111 - remainder) % 111 handles both cases concisely.
    const remainder = inputVal % 111;
    const adjustment = (111 - remainder) % 111;
    return inputVal + adjustment;
}

// Executes the primary calculation and prints the result to console.
// Renamed 'myOut' to 'calculationResult'.
const calculationResult = calculateNearestMultiple();
if (calculationResult !== undefined) {
    console.log(calculationResult);
}
