/*
 * This file contains a refactored and transformed version of an original JavaScript program.
 * It aims to demonstrate a Type III code clone, incorporating significant structural and
 * stylistic changes while preserving the core functionality.
 *
 * Key transformations include:
 * - Renaming all identifiers for variables, functions, and parameters.
 * - Restructuring input handling into a dedicated processing unit.
 * - Decomposing a monolithic conversion utility into multiple specialized functions.
 * - Adding new helper variables and intermediate steps for clarity.
 * - Implementing guard clauses and basic input validations.
 * - Modernizing JavaScript syntax (e.g., const/let, arrow functions).
 * - Rewriting comments to reflect the new structure and intent.
 * - Removing non-essential or commented-out code fragments.
 * - Reformatting whitespace and indentation.
 */

// Global instance for managing input stream.
const inputProcessor = initializeInputHandler();

// Entry point for the main program logic.
executeSolution();

/**
 * Reads the next line from the input stream and attempts to parse it as an integer.
 * @returns {number} The parsed integer.
 * @throws {Error} If no more input lines are available or parsing fails.
 */
function fetchNextInteger() {
    const rawLine = retrieveNextInputLine();
    const parsedValue = parseInt(rawLine, 10);
    if (isNaN(parsedValue)) {
        throw new Error(`Input Error: Expected an integer, received '${rawLine}'`);
    }
    return parsedValue;
}

/**
 * Reads the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
function fetchStringTokens() {
    return retrieveNextInputLine().split(" ");
}

/**
 * Reads the next line, splits it by space, and converts each token to an integer.
 * @returns {number[]} An array of integers.
 */
function fetchNumericTokens() {
    return retrieveNextInputLine().split(" ").map(val => parseInt(val, 10));
}

/**
 * Reads the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function fetchCharacterArray() {
    return retrieveNextInputLine().split("");
}

/**
 * Retrieves the next available line from the input processor.
 * @returns {string} The next line of input.
 * @throws {Error} If no more lines are available.
 */
function retrieveNextInputLine() {
    return inputProcessor.getNextLineContent();
}

/**
 * Checks if there are more lines remaining in the input stream.
 * @returns {boolean} True if more lines can be read, false otherwise.
 */
function checkMoreLinesExist() {
    return inputProcessor.hasMoreData();
}

/**
 * Reads all content from the standard input (`/dev/stdin`) and prepares it for line-by-line access.
 * @returns {string[]} An array where each element is a line from the input.
 */
function readAllStandardInput() {
    try {
        const fileSystem = require("fs");
        return fileSystem.readFileSync("/dev/stdin", "utf8").trim().split("\n");
    } catch (e) {
        reportIssue(`Failed to read standard input: ${e.message}`);
        // In a real scenario, might exit or provide default input
        return [];
    }
}

/**
 * Sets up and returns an object responsible for managing input lines.
 * This object acts as a stream reader for pre-loaded input.
 * @returns {object} An object with methods for accessing input lines.
 */
function initializeInputHandler() {
    const rawInputContent = readAllStandardInput();
    let currentLinePointer = 0;
    const totalInputLines = rawInputContent.length;

    if (totalInputLines === 0 || (totalInputLines === 1 && rawInputContent[0] === '')) {
        // Handle potentially empty input gracefully.
        reportIssue("Warning: Input stream appears to be empty.");
    }

    return {
        /**
         * Checks if there are more lines available to be read.
         * @returns {boolean} True if there are unread lines, false otherwise.
         */
        hasMoreData: function() {
            return currentLinePointer < totalInputLines;
        },
        /**
         * Retrieves the next line from the input buffer.
         * @returns {string} The content of the next line.
         * @throws {Error} If an attempt is made to read beyond the last line.
         */
        getNextLineContent: function() {
            if (!this.hasMoreData()) {
                throw new Error("EndOfInputException: No more lines available in the input stream.");
            }
            const lineData = rawInputContent[currentLinePointer];
            currentLinePointer++;
            return lineData;
        }
    };
}

/**
 * Prints a message to the standard output.
 * @param {any} content The content to be displayed.
 */
function displayOutput(content) {
    console.log(content);
}

/**
 * Prints an error message to the standard error stream.
 * @param {any} message The error message or object to log.
 */
function reportIssue(message) {
    console.error(`ERROR: ${message}`);
}

/**
 * The main computational logic of the program.
 * It reads a number `P`, then computes the count of divisors for `P - 1`,
 * and finally outputs `(count of divisors) + 1`.
 */
function executeSolution() {
    // Read the primary numeric input value.
    const primaryNumericValue = fetchNextInteger();

    // Basic validation for the input number.
    if (isNaN(primaryNumericValue) || primaryNumericValue < 1) {
        reportIssue(`Invalid input for primary value: ${primaryNumericValue}. Expected a positive integer.`);
        return; // Exit if input is invalid.
    }

    // Calculate the target number for factorization.
    // This is an intermediate step introduced for clarity.
    const numberForFactorization = primaryNumericValue - 1;

    // Guard clause for the number to be factored.
    if (numberForFactorization < 0) {
        // If primaryNumericValue is 0, numberForFactorization would be -1.
        // Divisor computation is typically for positive integers.
        reportIssue(`Cannot compute divisors for a negative number: ${numberForFactorization}.`);
        displayOutput(1); // Or handle as per problem spec, here returning 1 for N=0 or N=1 which gives 0 or -1 target.
        return;
    } else if (numberForFactorization === 0) {
        // The number of divisors for 0 is undefined or treated specially.
        // Based on the original problem, N=1 implies N-1=0, leading to 1.
        displayOutput(1);
        return;
    }

    // Compute all positive integer divisors for the target number.
    const identifiedDivisors = computeIntegerDivisors(numberForFactorization);

    // The final result is the count of unique divisors plus one.
    const finalResultCount = identifiedDivisors.length + 1;

    // Display the computed result.
    displayOutput(finalResultCount);
}

/**
 * Computes all positive integer divisors (factors) for a given number.
 * The divisors are returned in a sorted array.
 * @param {number} numberToExamine The positive integer for which to find divisors.
 * @returns {number[]} An array of sorted positive integer divisors.
 * @throws {Error} If the input is not a positive integer.
 */
function computeIntegerDivisors(numberToExamine) {
    // Input validation: ensure the number is a positive integer.
    if (!Number.isInteger(numberToExamine) || numberToExamine <= 0) {
        throw new Error(`Invalid argument: 'numberToExamine' must be a positive integer. Received: ${numberToExamine}`);
    }

    const foundDivisors = [];
    // Iterate up to the square root of the number to find pairs of divisors efficiently.
    for (let candidate = 1; candidate * candidate <= numberToExamine; candidate++) {
        // Check if 'candidate' is a divisor.
        if (numberToExamine % candidate === 0) {
            foundDivisors.push(candidate); // Add the first divisor of the pair.

            // If the candidate is not the square root, then there's a distinct second divisor.
            if (candidate * candidate !== numberToExamine) {
                foundDivisors.push(numberToExamine / candidate); // Add the second divisor of the pair.
            }
        }
    }

    // Sort the collected divisors in ascending order.
    foundDivisors.sort((a, b) => a - b);

    return foundDivisors;
}