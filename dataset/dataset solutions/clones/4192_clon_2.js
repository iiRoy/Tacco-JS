'use strict'; // Enforce strict mode for better code quality

/**
 * This function processes an input string, typically a number,
 * to check a specific mathematical property.
 * @param {string} rawData - The input string received.
 */
function processInput(rawData) {
    // Calculate the total sum of the individual digits present in the input string.
    const digitTotal = rawData
        .split('') // Convert the input string into an array of character digits.
        .map(digitChar => ~~digitChar) // Transform each character digit into its numerical equivalent.
        .reduce((accumulator, currentDigit) => accumulator + currentDigit); // Aggregate all numeric digits into a single sum.

    // Determine if the original number (parsed from the input string) is perfectly
    // divisible by the sum of its digits.
    const resultString = (Number(rawData) % digitTotal === 0) ? 'Yes' : 'No';

    // Display the computed result to the console.
    console.log(resultString);
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
