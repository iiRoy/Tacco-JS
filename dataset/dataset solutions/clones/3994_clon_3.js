"use strict";

/**
 * Utility function to safely parse and validate the numerical parameters from a single input line.
 * @param {string} inputLine - The string containing space-separated numbers (e.g., "10 2").
 * @returns {{firstVal: number, secondVal: number}} An object containing the parsed numbers.
 * @throws {Error} If the input is invalid or parsing fails.
 */
const extractNumericalParameters = (inputLine) => {
    // Pre-validation: ensure input is a non-empty string.
    if (typeof inputLine !== 'string' || inputLine.length === 0) {
        throw new Error("Input data line must be a non-empty string for parsing.");
    }

    // Split the line by one or more whitespace characters for robustness.
    const numericParts = inputLine.trim().split(/\s+/);

    // Validate that we have at least two parts.
    if (numericParts.length < 2) {
        throw new Error("Input line must contain at least two space-separated numerical values.");
    }

    // Parse the first two parts into integers using radix 10.
    const primaryValue = parseInt(numericParts[0], 10);
    const secondaryValue = parseInt(numericParts[1], 10);

    // Validate that parsing was successful and values are non-negative.
    if (isNaN(primaryValue) || isNaN(secondaryValue)) {
        throw new Error("Failed to convert input parts into valid integers.");
    }
    if (primaryValue < 0 || secondaryValue < 0) {
        throw new Error("Input values (N and K) must be non-negative integers.");
    }

    return { firstVal: primaryValue, secondVal: secondaryValue };
};

/**
 * Core function to compute the desired count based on the given upper bound and minimum remainder.
 * This calculates the sum of pairs (a, b) such that 1 <= a, b <= upperBoundVal and a % b >= minRemainder.
 * @param {string} rawInputContent - The entire input string, typically from stdin.
 * @returns {number} The calculated total count, or -1 if an error occurred (which is also logged).
 */
const calculateResultingCount = (rawInputContent) => {
    // Validate the overall input content type.
    if (typeof rawInputContent !== 'string') {
        console.error("Processing Error: Provided input content is not a string type.");
        return -1;
    }

    // Split the input into lines and filter out empty lines.
    const cleanedInputLines = rawInputContent.trim().split('\n').filter(line => line.length > 0);

    if (cleanedInputLines.length === 0) {
        console.error("Processing Error: No valid lines found in the input content.");
        return -1;
    }

    // Extract N and K from the first line using our helper.
    let upperBoundVal, minRemainder;
    try {
        const params = extractNumericalParameters(cleanedInputLines[0]);
        upperBoundVal = params.firstVal;
        minRemainder = params.secondVal;
    } catch (parseError) {
        console.error("Input Parsing Error:", parseError.message);
        return -1;
    }

    let finalAccumulatedSum = 0; // The variable to store our running total.

    // Special handling for the case where minRemainder is 0.
    // If K=0, then a % b >= 0 is always true.
    // For each 'b' from 1 to N, there are 'N' possible 'a' values (1 to N).
    // Thus, the total count is N * N. This is a significant optimization.
    if (minRemainder === 0) {
        finalAccumulatedSum = upperBoundVal * upperBoundVal;
        return finalAccumulatedSum;
    }

    // Main loop: Iterate through each possible divisor 'b' from 1 to N.
    for (let currentDivisor = 1; currentDivisor <= upperBoundVal; ++currentDivisor) {
        // Determine how many full 'blocks' of 'currentDivisor' fit into 'upperBoundVal'.
        // Example: if N=10, b=3, fullBlockQuantity = floor(10/3) = 3.
        const fullBlockQuantity = Math.floor(upperBoundVal / currentDivisor);

        // Calculate the number of 'a' values within a *single full block*
        // where a % currentDivisor >= minRemainder.
        // The remainders in a full block are 0, 1, ..., currentDivisor - 1.
        // We need remainders from minRemainder up to currentDivisor - 1.
        // The count is (currentDivisor - 1) - minRemainder + 1 = currentDivisor - minRemainder.
        // We use Math.max to ensure the count is non-negative, as minRemainder could be >= currentDivisor.
        const eligibleInFullBlock = Math.max(0, currentDivisor - minRemainder);

        // Add the contribution from all these full blocks to the total sum.
        finalAccumulatedSum += fullBlockQuantity * eligibleInFullBlock;

        // Calculate the remainder (the size of the incomplete block at the end).
        // Example: if N=10, b=3, remainingElementsCount = 10 % 3 = 1.
        const remainingElementsCount = upperBoundVal % currentDivisor;

        // If there's an incomplete block (i.e., N is not a perfect multiple of currentDivisor).
        if (remainingElementsCount > 0) {
            // For this partial block, the possible remainders are 0, 1, ..., remainingElementsCount - 1.
            // We need to count 'a' values such that a % currentDivisor >= minRemainder.
            // This means remainders from minRemainder up to remainingElementsCount - 1.
            // The count is (remainingElementsCount - 1) - minRemainder + 1 = remainingElementsCount - minRemainder.
            // Again, Math.max ensures a non-negative count.
            const eligibleInPartialBlock = Math.max(0, remainingElementsCount - minRemainder + 1);
            finalAccumulatedSum += eligibleInPartialBlock;
        }
    }

    return finalAccumulatedSum;
};

/**
 * Entry point function for the entire application.
 * It orchestrates input reading, processing, and output display.
 * @param {function(): string} inputDataRetriever - A function that returns the raw input string.
 */
const initializeAndExecuteProgram = (inputDataRetriever) => {
    try {
        // Retrieve the raw input data using the provided function.
        const rawTextData = inputDataRetriever();

        // Perform the main calculation.
        const computedResult = calculateResultingCount(rawTextData);

        // Display the result only if no errors were encountered during calculation.
        if (computedResult !== -1) {
            console.log(computedResult);
        }
    } catch (executionIssue) {
        // Catch any unexpected errors that might occur during the overall execution flow.
        console.error("Fatal Application Error:", executionIssue.message);
        // In a production environment, you might want to exit with a non-zero status code here.
        // process.exit(1);
    }
};

/**
 * Defines the standard input source for Node.js environments.
 * This reads the entire content of stdin as a UTF-8 string.
 * @returns {string} The content read from standard input.
 */
const getStandardInputDataSource = () => {
    // 'fs' module is typically used for file system operations in Node.js.
    // readFileSync reads the entire file synchronously.
    // '/dev/stdin' is a common Unix-like path for standard input.
    // 'utf8' specifies the character encoding.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

// Initiate the program execution by passing the standard input data source.
initializeAndExecuteProgram(getStandardInputDataSource);