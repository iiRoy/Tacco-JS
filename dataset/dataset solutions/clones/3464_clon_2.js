/*
 * This module provides various utility functions
 * for numerical operations and input processing.
 */

// Function to convert a string to an integer, base 10
const parseInteger = (  valStr  ) => parseInt(valStr , 10) ;

// Function to convert an array of strings to an array of integers
const parseIntegerArray = ( stringArray ) => stringArray.map(  currentStr => parseInteger( currentStr )  ) ;

// Function to calculate the absolute value of a number
const absoluteValue = (inputNumber) => inputNumber > 0 ? inputNumber : -inputNumber;

/**
 * Determines the smallest value among its arguments.
 * @returns {number} The minimum value.
 */
function findMinimum (  ) {
    const variableArgs = arguments;
    let currentResult = variableArgs[0];
    for (let counter = 1; counter < variableArgs.length; counter++) {
        if (variableArgs[counter] < currentResult) {
            currentResult = variableArgs[counter];
        }
    }
    return currentResult;
}

/**
 * Determines the largest value among its arguments.
 * @returns {number} The maximum value.
 */
function findMaximum ( ) {
    const variableArgs = arguments;
    let currentResult = variableArgs[0];
    for (  let counter = 1; counter < variableArgs.length; counter++  ) {
        if (variableArgs[counter] > currentResult) {
            currentResult = variableArgs[counter];
        }
    }
    return currentResult;
}

/**
 * Calculates the greatest common divisor (GCD) of all provided numbers.
 * Uses Euclidean algorithm recursively.
 * @returns {number} The GCD.
 */
function greatestCommonDivisor (  ) {
    const variableArgs = arguments;
    let currentResult = variableArgs[0];

    // Helper function for GCD calculation
    const recursiveGcdHelper = (  numA, numB  ) => numB ? recursiveGcdHelper(numB, numA % numB) : numA;

    for (let counter = 1; counter < variableArgs.length; counter++) {
        currentResult = recursiveGcdHelper(currentResult, variableArgs[counter]);
    }
    return currentResult;
}

// Entry point for the application, reading from standard input
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Main function to process input and compute the final value.
 * @param {string} rawData - The raw input string from stdin.
 * @returns {number} An exit code, typically 0 for success.
 */
function ExecuteProgram ( rawData ) {
    // Split the raw input into individual lines
    const lineData = rawData.split('\n');

    // Parse the first line as the count of items
    const itemCount = parseInteger(lineData[0]);

    // Initialize an array to hold parsed numbers
    const sortedNumbers = [ ];

    // Populate the array with numbers from subsequent lines
    for (let loopIndex = 0; loopIndex < itemCount; loopIndex++) {
        sortedNumbers[loopIndex] = parseInteger(lineData[loopIndex + 1]);
    }

    // Sort the numeric array in ascending order
    sortedNumbers.sort( ( elemA, elemB ) => elemA - elemB );

    let sumOne = 0;
    let sumTwo = 0;

    // Conditional processing based on whether the item count is even or odd
    if ( itemCount % 2 === 0 ) {
        // Case: even number of items
        for (let loopIndex = 0; loopIndex < itemCount; loopIndex++) {
            sumOne += loopIndex >= itemCount / 2 ? 2 * sortedNumbers[loopIndex] : -2 * sortedNumbers[loopIndex];
        }
        sumOne += sortedNumbers[itemCount / 2 - 1] - sortedNumbers[itemCount / 2];
    } else {
        // Case: odd number of items
        for (let loopIndex = 0; loopIndex < itemCount; loopIndex++) {
            sumOne += loopIndex >= (itemCount - 1) / 2 ? 2 * sortedNumbers[loopIndex] : -2 * sortedNumbers[loopIndex];
            sumTwo += loopIndex > (itemCount - 1) / 2 ? 2 * sortedNumbers[loopIndex] : -2 * sortedNumbers[loopIndex];
        }
        sumOne -= sortedNumbers[(itemCount - 1) / 2] + sortedNumbers[(itemCount + 1) / 2];
        sumTwo += sortedNumbers[(itemCount - 1) / 2] + sortedNumbers[(itemCount - 3) / 2];
    }

    // Determine the maximum of the two calculated sums
    const finalResult = findMaximum(sumOne, sumTwo);

    // Output the final computed result to the console
    console.log(finalResult);

    // Indicate successful execution
    return 0;
}