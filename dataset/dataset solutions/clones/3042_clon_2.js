"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

function EntryProcessor(sourceText) {
    // Initialize a parser for the input data.
    let inputHandler = new TextParser(sourceText);

    // Read the number of elements and the array of integer elements.
    let elementCount = inputHandler.extractNumericValue();
    let dataElements = inputHandler.extractNumericArray(elementCount);

    // Define constants for array dimension and modular arithmetic.
    const MAX_ARRAY_DIM = 305;
    const MODULO_PRIME = 998244353;

    // Initialize an array to store cumulative sums.
    let cumulativeSums = new Array(MAX_ARRAY_DIM);
    cumulativeSums[0] = 0;

    // Initialize two dynamic programming tables, filled with zeros.
    let memoTable1 = new Array(MAX_ARRAY_DIM * MAX_ARRAY_DIM).fill(0);
    let memoTable2 = new Array(MAX_ARRAY_DIM * MAX_ARRAY_DIM).fill(0);

    // Helper function for modular addition.
    const modAdd = (valA, valB) => (valA % MODULO_PRIME + valB % MODULO_PRIME) % MODULO_PRIME;

    // Helper function for integer division by two (floor).
    const integerHalf = (argX) => Math.floor(argX / 2);

    // Helper function for general integer division (floor).
    const floorDivision = (dividend, divisor) => Math.floor(dividend / divisor);


    // Sort the input elements in ascending order.
    dataElements.sort((itemA, itemB) => itemA - itemB);

    // Prepend a zero to the data elements array for easier prefix sum calculation.
    dataElements.unshift(0);

    // Calculate prefix sums for the data elements.
    for ( let outerIdx = 1; outerIdx <= elementCount; outerIdx++ ) {
        cumulativeSums[outerIdx] = cumulativeSums[outerIdx - 1] + dataElements[outerIdx];
    }

    // Initialize base cases for the DP tables.
    memoTable1[0] = Math.pow(2, elementCount);
    memoTable2[0] = 1;

    // This constant is the modular inverse of 2 modulo MODULO_PRIME (i.e., (MODULO_PRIME + 1) / 2).
    const INV_TWO_MOD = 499122177;

    // Populate DP tables using nested loops.
    for ( let outerIdx = 1; outerIdx <= elementCount; outerIdx++ ) {
        for ( let currentSumIdx = cumulativeSums[outerIdx]; currentSumIdx >= dataElements[outerIdx]; currentSumIdx-- ) {
            memoTable1[currentSumIdx] = modAdd(memoTable1[currentSumIdx], INV_TWO_MOD * memoTable1[currentSumIdx - dataElements[outerIdx]]);
            memoTable2[currentSumIdx] = modAdd(memoTable2[currentSumIdx], memoTable2[currentSumIdx - dataElements[outerIdx]]);
        }
    }

    let finalSolution = 0; // Variable to store the computed final answer.

    // Check if the total sum of elements is even.
    if (!(cumulativeSums[elementCount] % 2)) {
        // If even, adjust finalSolution based on DP tables at half the total sum.
        finalSolution += memoTable1[integerHalf(cumulativeSums[elementCount])] - memoTable2[integerHalf(cumulativeSums[elementCount])];
    }

    // Sum up values from memoTable1 for sums greater than half the total sum.
    for (let iterationIdx = integerHalf(cumulativeSums[elementCount]) + 1; iterationIdx <= cumulativeSums[elementCount]; iterationIdx++) {
        finalSolution = modAdd(finalSolution, memoTable1[iterationIdx]);
    }

    // Apply a scaling factor.
    finalSolution *= 3;

    // Final calculation with modular arithmetic.
    finalSolution = ((Math.pow(3, elementCount) - finalSolution) % MODULO_PRIME + MODULO_PRIME) % MODULO_PRIME;

    // Display the computed result.
    console.log(finalSolution);
}

// Custom class for parsing input strings.
class TextParser {
    constructor(rawContent) {
        this.readPointer = 0; // Current position in the token list.
        this.tokenList = rawContent.split(/\n|\s/); // Split input by newlines or spaces.
    }

    // Extracts and returns the next numeric value from the input.
    extractNumericValue() {
        return this.tokenList[this.readPointer++] - 0; // Convert to number using unary minus.
    }

    // Extracts an array of numeric values of a specified size.
    extractNumericArray(arraySize) {
        let numericSequence = new Array(arraySize);
        for (let loopIndex = 0; loopIndex < arraySize; loopIndex++) {
            numericSequence[loopIndex] = this.extractNumericValue();
        }
        return numericSequence;
    }

    // Extracts and returns the next string value.
    extractStringValue() {
        return this.tokenList[this.readPointer++];
    }

    // Extracts an array of string values of a specified size.
    extractStringArray(arraySize) {
        let stringSequence = new Array(arraySize);
        for (let loopIndex = 0; loopIndex < arraySize; loopIndex++) {
            stringSequence[loopIndex] = this.extractStringValue();
        }
        return stringSequence;
    }
}

// Entry point for execution, typically for Node.js environment.
if ( typeof window === "undefined" ) {
    // Read input from standard input if running in Node.js.
    EntryProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
}