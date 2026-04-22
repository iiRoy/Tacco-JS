"use strict";

// Acquire input data from standard input using the file system module.
var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the entire input content into individual tokens, using spaces or newlines as delimiters.
var inputTokens = dataSource.split(/ |\n/);
var tokenIndex = 0; // Current position in the token array.

// Function to retrieve the next token and convert it to a number.
function getNextNumber() {
    return +inputTokens[tokenIndex++];
}

// Function to retrieve the next token as a string.
function getNextString() {
    return inputTokens[tokenIndex++];
}

// Function to retrieve the next token and convert it to a BigInt.
function getNextBigInt() {
    return BigInt(inputTokens[tokenIndex++]);
}

// Function to retrieve an array of 'count' tokens, optionally as strings or numbers.
function getNumbersArray(count, asStrings) {
    if (asStrings) {
        return inputTokens.slice(tokenIndex, tokenIndex += count);
    } else {
        return inputTokens.slice(tokenIndex, tokenIndex += count).map(item => +item);
    }
}

// Function to retrieve an array of 'cnt' tokens, convert to numbers, and sort them.
function getSortedNumbersArray(cnt, desc) {
    if (desc) {
        return inputTokens.slice(tokenIndex, tokenIndex += cnt).map(elem => +elem).sort((val1, val2) => val2 - val1);
    } else {
        return inputTokens.slice(tokenIndex, tokenIndex += cnt).map(elem => +elem).sort((val1, val2) => val1 - val2);
    }
}

// Function to retrieve a 2D matrix of 'rows' height and 'cols' width.
function getMatrix(rows, cols, raw) {
    var resultMatrix = [];
    var rowIndex = 0;
    if (raw) {
        for (; rowIndex < rows; rowIndex++) {
            resultMatrix.push(inputTokens.slice(tokenIndex, tokenIndex += cols));
        }
    } else {
        for (; rowIndex < rows; rowIndex++) {
            resultMatrix.push(inputTokens.slice(tokenIndex, tokenIndex += cols).map(elem => +elem));
        }
    }
    return resultMatrix;
}

// Function to create a multi-dimensional array dynamically.
function createMultiDimArray(initialVal) {
    var dimensions = arguments;
    var len = dimensions.length;
    var arrayDef = "Array(dimensions[" + --len + "]).fill().map(_=>{return " + initialVal + ";})";
    while (--len) {
        arrayDef = "Array(dimensions[" + len + "]).fill().map(_=>" + arrayDef + ")";
    }
    return eval(arrayDef); // Using eval for dynamic array creation.
}

// An array to buffer custom output messages.
var outputBuffer = [];
function appendToOutput(content) {
    outputBuffer.push(content);
}

// Execute the primary logic of the program.
var finalResult = processorRoutine();

// If the main routine returns a value, print it to the console.
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

// If there are buffered output messages, print them to the console, each on a new line.
if (outputBuffer.length) {
    console.log(outputBuffer.join("\n"));
}

/**
 * Main problem-solving routine.
 * This function calculates a specific minimum value based on the input number.
 */
function processorRoutine() {
    const HUGE_NUM = 9_999_999_999_999_999; // A very large constant for default/error returns.

    let inputVal = getNextNumber();
    if (inputVal === 1) return 1; // Base case for input 1.

    let currentFactor = inputVal;
    let powerOfTwo = 2;

    // Decompose inputVal: remove all factors of 2 from currentFactor and accumulate them in powerOfTwo.
    while (currentFactor % 2 === 0) {
        currentFactor /= 2;
        powerOfTwo *= 2;
    }

    let doubleInput = inputVal * 2;
    let minResult = doubleInput - 1; // Initialize minResult with an upper bound.

    // Iterate through odd divisors of 'currentFactor' up to its square root.
    for (let divisor = 1; divisor * divisor <= currentFactor; divisor += 2) {
        if (currentFactor % divisor) {
            continue; // If 'divisor' is not a factor, skip to the next iteration.
        }

        let otherFactor = currentFactor / divisor; // The complementary factor.

        // Calculate two possibilities using the extended Euclidean helper function.
        let valA = calculateGCDRelatedValue(otherFactor, divisor * powerOfTwo);
        let valB = calculateGCDRelatedValue(otherFactor * powerOfTwo, divisor);

        // Update the minimum result found so far.
        minResult = Math.min(minResult, valA, valB);
    }
    return minResult; // Return the overall minimum result.
}

/**
 * Helper function that uses the extended Euclidean algorithm results.
 * It determines a specific value based on the coefficients and GCD.
 * @param {number} paramU - First parameter.
 * @param {number} paramV - Second parameter.
 * @returns {number} A calculated value or a large number if conditions are not met.
 */
function calculateGCDRelatedValue(paramU, paramV) {
    const HUGE_NUM = 9_999_999_999_999_999; // Using the same large constant.

    // Destructure the results from the extended Euclidean algorithm.
    var [coeffA, coeffB, commonDivisor] = extendedEuclidean(paramU, paramV);

    if (commonDivisor > 1) return HUGE_NUM; // If GCD is greater than 1, return a large number.
    if (coeffA < 0) return -coeffA * paramU; // If coeffA is negative, return -coeffA * paramU.
    if (coeffB < 0) return -coeffB * paramV; // If coeffB is negative, return -coeffB * paramV.

    return HUGE_NUM; // Default return if none of the above conditions are met.
}

/**
 * Implements the Extended Euclidean Algorithm to find coefficients (x, y)
 * such that ax + by = gcd(a, b).
 * @param {number} valX - The first number.
 * @param {number} valY - The second number.
 * @returns {[number, number, BigInt]} An array containing [x, y, gcd(a, b)].
 */
function extendedEuclidean(valX, valY) {
    // Initialize coefficients for Bezout's identity for current and previous steps.
    var prevCoeffA = 1n, currCoeffA = 0n, prevCoeffB = 0n, currCoeffB = 1n;

    // Convert input numbers to BigInt to handle potentially large values precisely.
    valX = BigInt(valX);
    valY = BigInt(valY);

    // Loop continues until valY (remainder) becomes zero.
    while (valY) {
        var quotient = valX / valY; // Calculate the quotient.
        var remainder = valX % valY; // Calculate the remainder.

        // Update the Bezout coefficients for the next step.
        var nextCoeffA = prevCoeffA - quotient * currCoeffA;
        var nextCoeffB = prevCoeffB - quotient * currCoeffB;

        // Shift values for the next iteration of the algorithm.
        valX = valY;
        valY = remainder;
        prevCoeffA = currCoeffA;
        currCoeffA = nextCoeffA;
        prevCoeffB = currCoeffB;
        currCoeffB = nextCoeffB;
    }
    // Return the final coefficients (converted to Number) and the GCD (as BigInt).
    return [Number(prevCoeffA), Number(prevCoeffB), valX];
}