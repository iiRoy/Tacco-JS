"use strict"; // Enforce strict mode for cleaner code execution

/**
 * Executes the primary data processing logic.
 * This function calculates the sum of products of digit pair occurrences.
 * @param {string} rawInputText - The raw string input, typically from stdin.
 */
const processInputData = (rawInputText) => {
    // --- Pre-processing the input string ---
    // Remove leading/trailing whitespace and split into lines.
    const inputLines = rawInputText.trim().split("\n");

    // Parse the first line to get the upper bound for number generation.
    const upperBound = parseInt(inputLines[0], 10); // Using radix 10 for safety.

    // --- Initialize a 2D array (matrix) to store digit pair frequencies ---
    // This matrix will track how many times a number starts with 'i' and ends with 'j'.
    const firstLastDigitCounts = [];

    // Populate the matrix with initial zero values.
    // The matrix dimensions are 10x10, representing digits 0-9.
    for (let rowIterator = 0; rowIterator < 10; ++rowIterator) {
        firstLastDigitCounts.push(new Array(10).fill(0));
    }

    // --- Populate the frequency matrix based on numbers from 1 to upperBound ---
    // Iterate through each integer from 1 up to the specified limit.
    for (let currentInteger = 1; currentInteger <= upperBound; currentInteger++) {
        // Convert the current integer to its string representation to easily access digits.
        const integerString = String(currentInteger);

        // Extract the first digit (head) of the number.
        const initialDigit = parseInt(integerString[0], 10);

        // Extract the last digit (tail) of the number.
        const finalDigit = parseInt(integerString[integerString.length - 1], 10);

        // Increment the count for this specific (initialDigit, finalDigit) pair in the matrix.
        firstLastDigitCounts[initialDigit][finalDigit]++;
    }

    // A debugging line, now commented out and altered.
    // console.debug(`Frequency matrix:\n${firstLastDigitCounts.map(r => r.join(' ')).join('\n')}`);

    // --- Calculate the final result by summing products of symmetric digit pair counts ---
    let totalPairedOccurrences = 0; // Initialize a variable to accumulate the result.

    // Iterate through all possible first digits (0-9).
    for (let firstDigitIndex = 0; firstDigitIndex < 10; firstDigitIndex++) {
        // Iterate through all possible second digits (0-9).
        for (let secondDigitIndex = 0; secondDigitIndex < 10; secondDigitIndex++) {
            // Retrieve the count for (firstDigit, secondDigit) pair.
            const countOne = firstLastDigitCounts[firstDigitIndex][secondDigitIndex];
            // Retrieve the count for the reverse (secondDigit, firstDigit) pair.
            const countTwo = firstLastDigitCounts[secondDigitIndex][firstDigitIndex];

            // Add the product of these two counts to the running total.
            totalPairedOccurrences += countOne * countTwo;
        }
    }

    // --- Output the final computed result ---
    console.log(totalPairedOccurrences);
};

// --- Execution entry point ---
// Read content from standard input synchronously using Node.js 'fs' module.
// Then, pass the read content to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));