"use strict"; // Retaining strict mode for consistent behavior

/**
 * This module processes a line of numerical input to perform a specific calculation.
 * It identifies numbers within a given range whose sum of digits falls within
 * specified bounds, and then computes the total sum of these qualifying numbers.
 *
 * @param {string} rawInputString - A string containing space-separated numerical parameters.
 */
function processNumericalSeries(rawInputString) {
    // Step 1: Parse and validate the initial input parameters.
    // The input string is first cleaned (trimmed) and then split into individual tokens.
    const parameterTokens = rawInputString.trim().split(' ');

    // Implement a basic guard clause to ensure the expected number of parameters.
    if (parameterTokens.length < 3) {
        console.error("Error: Insufficient input parameters. Three numbers (N, A, B) are required.");
        // In a production environment, one might throw an error or exit the process.
        return;
    }

    // Attempt to convert string tokens into numerical values.
    // Using `Number()` constructor for parsing, which can be a subtle change from `parseInt`.
    const N_parameter = Number(parameterTokens[0]);
    const A_parameter = Number(parameterTokens[1]);
    const B_parameter = Number(parameterTokens[2]);

    // Rename for enhanced readability and to satisfy Type II requirements.
    const seriesMaximum = N_parameter;
    const digitSumMinimum = A_parameter;
    const digitSumMaximum = B_parameter;

    // Further validation of parsed numerical inputs.
    if (isNaN(seriesMaximum) || isNaN(digitSumMinimum) || isNaN(digitSumMaximum)) {
        console.error("Error: One or more input parameters could not be converted to valid numbers.");
        return;
    }
    if (seriesMaximum < 1) { // Numbers typically start from 1 in these problems.
        console.error("Error: The series maximum (N) must be a positive integer.");
        return;
    }
    if (digitSumMinimum > digitSumMaximum) {
        console.error("Error: The minimum digit sum (A) cannot exceed the maximum digit sum (B).");
        return;
    }

    // Step 2: Generate an array containing all integers from 1 up to `seriesMaximum`.
    // Replacing `Array.from` with a traditional `for` loop for structural variation.
    const fullNumberSequence = [];
    for (let currentNumberValue = 1; currentNumberValue <= seriesMaximum; currentNumberValue++) {
        fullNumberSequence.push(currentNumberValue);
    }

    // Step 3: Filter the generated sequence based on the sum of digits criteria.
    // This involves replacing the `Array.prototype.filter` method with an explicit loop.
    const qualifiedNumbers = [];

    // Define a helper function (or inline logic) for digit sum calculation.
    // Rewriting the `toString().split('').reduce()` logic to an iterative `while` loop.
    const calculateSumOfDigits = (num) => {
        let runningDigitTotal = 0;
        let workingNumber = Math.abs(num); // Ensure positive for digit extraction

        if (workingNumber === 0) { // Handle 0 explicitly, though not expected in this problem (1 to N)
            return 0;
        }

        while (workingNumber > 0) {
            runningDigitTotal += workingNumber % 10; // Extract the last digit
            workingNumber = Math.floor(workingNumber / 10); // Remove the last digit
        }
        return runningDigitTotal;
    };

    for (const candidateEntry of fullNumberSequence) {
        const currentEntryDigitSum = calculateSumOfDigits(candidateEntry);

        // Apply the conditions for qualification, making conditions explicit.
        const meetsLowerThreshold = currentEntryDigitSum >= digitSumMinimum;
        const meetsUpperThreshold = currentEntryDigitSum <= digitSumMaximum;

        if (meetsLowerThreshold && meetsUpperThreshold) {
            qualifiedNumbers.push(candidateEntry);
        }
    }

    // Step 4: Calculate the total sum of all numbers that met the qualification criteria.
    // Replacing `Array.prototype.reduce` with a manual `for...of` loop.
    let cumulativeFinalSum = 0; // Initialize the accumulator for the final sum.

    // A small guard clause, though looping over an empty array is safe.
    if (qualifiedNumbers.length === 0) {
        // No numbers qualified, sum remains 0.
        // console.warn("No numbers matched the criteria. The final sum will be zero.");
    } else {
        for (const numToSum of qualifiedNumbers) {
            cumulativeFinalSum += numToSum;
        }
    }

    // Step 5: Output the final computed sum to standard output.
    console.log(cumulativeFinalSum);
}

// Entry point for script execution: Read input from standard I/O.
// Introduce new variable names for the standard library module and path.
const fileSystemInterface = require('fs');
const standardInputFile = '/dev/stdin';

try {
    const inputContent = fileSystemInterface.readFileSync(standardInputFile, 'utf8');
    processNumericalSeries(inputContent);
} catch (fileReadError) {
    console.error(`An error occurred while reading from ${standardInputFile}:`, fileReadError.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
}