"use strict";

// This class is responsible for parsing raw input strings into various data types.
class InputParser {
    // Initializes the parser with the raw input string.
    // Throws an error if the input string is undefined or null.
    constructor(rawInputString) {
        if (typeof rawInputString === 'undefined' || rawInputString === null) {
            throw new Error('Input source text cannot be empty or omitted!');
        }
        // Tracks the current position in the array of parsed tokens.
        this.currentIndex = 0;
        // Splits the entire input string into individual tokens.
        // It uses one or more newline or space characters as delimiters.
        this.parsedTokens = rawInputString.split(/[\n\s]+/);
    }

    // Reads the next available token and converts it to an integer.
    // An explicit radix of 10 is used for robust parsing.
    // Throws an error if no more tokens are available.
    readInteger() {
        if (this.currentIndex >= this.parsedTokens.length) {
            throw new Error('Attempted to read past the end of available input tokens.');
        }
        return parseInt(this.parsedTokens[this.currentIndex++], 10);
    }

    // Reads a specified 'count' of tokens and returns them as an array of integers.
    // Validates that the requested count is a positive number.
    readIntegerArray(count) {
        if (typeof count === 'undefined' || count <= 0) {
            throw new Error('The number of elements for the array must be a positive integer!');
        }
        let collectedIntegers = new Array(count);
        for (let i = 0; i < count; i++) {
            collectedIntegers[i] = this.readInteger();
        }
        return collectedIntegers;
    }

    // The methods for reading strings (getStr, getStrArray) have been intentionally removed
    // as they are not utilized by the main processing logic. This demonstrates
    // a Type III change involving the deletion of non-essential code fragments.
}

// The primary function that processes the input and solves the problem.
function ProcessInputData(inputContents) {
    // Instantiate the input reader to handle parsing.
    let dataReader = new InputParser(inputContents);

    // Read the total number of elements.
    let elementCount = dataReader.readInteger();

    // Read the array of numbers based on the element count.
    let sourceNumbers = dataReader.readIntegerArray(elementCount);

    // Sort the array in descending order (largest to smallest).
    // The callback function uses renamed parameters for clarity.
    sourceNumbers.sort((valueA, valueB) => valueB - valueA);

    // Append a sentinel value (0) to the end of the array.
    // This ensures that accessing `sourceNumbers[idx + 1]` in the subsequent loop
    // always yields a valid number, even for the last original element,
    // simplifying boundary conditions and preventing undefined access.
    sourceNumbers.push(0);

    // Identify the largest value in the array (after sorting).
    let largestValue = sourceNumbers[0];
    // Calculate half of the largest value, rounding down to the nearest integer.
    // Using bitwise OR 0 is an alternative to Math.floor() for positive numbers.
    let halfLargest = (largestValue / 2) | 0;

    // Initialize variables to store the two candidate numbers closest to `halfLargest`.
    // These will be updated within the loop.
    let currentCandidateOne = 0;
    let currentCandidateTwo = 0;

    // Iterate through the sorted array, starting from the second element (index 1).
    // The goal is to find the *last* pair of `sourceNumbers[idx]` and `sourceNumbers[idx+1]`
    // where `sourceNumbers[idx]` is greater than or equal to `halfLargest`.
    for (let idx = 1; idx < elementCount; idx++) {
        let numberInFocus = sourceNumbers[idx]; // Introduce helper variable for readability.
        if (halfLargest <= numberInFocus) {
            currentCandidateOne = numberInFocus;
            currentCandidateTwo = sourceNumbers[idx + 1];
        } else {
            // This 'else' block doesn't change the original logic's outcome,
            // as the loop continues to find the *last* matching pair.
            // It's added as a structural fragment to make the conditional flow explicit.
            // For optimization, one might 'break' here if only the *first* pair was needed.
        }
    }

    // Calculate the absolute differences between `halfLargest` and each candidate.
    let differenceFromCandidateOne = Math.abs(halfLargest - currentCandidateOne);
    let differenceFromCandidateTwo = Math.abs(halfLargest - currentCandidateTwo);

    // Determine which of the two candidates is closer to `halfLargest`.
    let selectedCloserCandidate;
    if (differenceFromCandidateOne <= differenceFromCandidateTwo) {
        selectedCloserCandidate = currentCandidateOne;
    } else {
        selectedCloserCandidate = currentCandidateTwo;
    }

    // Output the largest value and the chosen candidate.
    // Using string concatenation here as an alternative to template literals.
    console.log(largestValue + " " + selectedCloserCandidate);
}

// This block handles the execution environment (Node.js vs. browser).
// In a Node.js environment, it reads input from standard input.
if (typeof window === "undefined") {
    try {
        const fileSystemModule = require("fs");
        const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        ProcessInputData(standardInputContent);
    } catch (error) {
        // Added basic error handling for file system operations.
        console.error("An error occurred while reading input from stdin:", error.message);
        // In a real application, you might want to exit the process with an error code.
        // process.exit(1);
    }
}