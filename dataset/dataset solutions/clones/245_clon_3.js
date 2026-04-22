const fileSystemModule = require('fs'); // Import the Node.js file system module for I/O operations.

// Define a constant for the base of the decimal system, used for parsing and modulo operations.
const DECIMAL_RADIX_BASE = 10;

/**
 * Parses raw input text into an array of number sequences.
 * Each line of input is treated as a sequence of digits.
 * @param {string} rawTextContent - The raw string content read from the input source.
 * @returns {Array<Array<number>>} An array where each element is an array of numbers representing a digit sequence.
 */
function parseInputSequences(rawTextContent) {
    // Remove any leading/trailing whitespace from the entire input block.
    const cleanedContent = rawTextContent.trim();

    // If after trimming, the content is empty, return an empty array to prevent errors.
    if (cleanedContent.length === 0) {
        // Comment: Guard clause for empty input.
        console.warn("Warning: Input content is empty after trimming.");
        return [];
    }

    // Split the cleaned content into individual lines.
    const lineData = cleanedContent.split('\n');

    // Process each line to convert it into a sequence of numbers.
    const digitSequences = lineData.map(line => {
        // For each line, split it into individual characters (digits).
        const characters = line.split('');

        // Convert each character to a number using parseInt with a specified radix.
        const sequence = characters.map(char => {
            const digit = parseInt(char, DECIMAL_RADIX_BASE);
            // Basic validation: ensure the parsed value is a valid number.
            if (isNaN(digit)) {
                console.error(`Error: Non-numeric character found '${char}' in line '${line}'. Defaulting to 0.`);
                return 0; // Or throw an error, depending on desired behavior.
            }
            return digit;
        });
        return sequence;
    });

    return digitSequences;
}

/**
 * Calculates the next reduction step for a sequence of numbers by summing adjacent pairs
 * and taking the last digit of each sum.
 * This function performs one iteration of the "adjacent sum and modulo 10" process.
 * @param {Array<number>} currentNumbers - The array of numbers for the current step.
 * @returns {Array<number>} A new array containing the reduced numbers.
 */
function calculateNextReductionStep(currentNumbers) {
    // Comment: Initialize an empty array to store the results of this reduction step.
    const resultantPairs = [];

    // Iterate through the input sequence, considering pairs of adjacent elements.
    // The loop runs up to the second-to-last element to ensure there's always an 'i+1' element.
    for (let currentIndex = 0; currentIndex < currentNumbers.length - 1; currentIndex++) {
        // Calculate the sum of the current element and its immediate successor.
        const sumOfAdjacent = currentNumbers[currentIndex] + currentNumbers[currentIndex + 1];

        // Add the last digit of the sum to the resultant array.
        // This is a Type III change: the modulo operation is applied immediately
        // after summing, rather than in a separate .map() call later.
        resultantPairs.push(sumOfAdjacent % DECIMAL_RADIX_BASE);
    }

    return resultantPairs;
}

/**
 * Recursively reduces a sequence of numbers to a single digit.
 * The reduction process involves repeatedly summing adjacent digits and taking the last digit,
 * until only one digit remains.
 * @param {Array<number>} sequenceToCollapse - The array of numbers to be reduced.
 * @returns {number} The single digit resulting from the recursive reduction.
 */
function recursivelyReduceToSingleDigit(sequenceToCollapse) {
    // Comment: Base case for the recursion: if the sequence contains only one element,
    // that element is the final reduced digit.
    if (sequenceToCollapse.length === 1) {
        return sequenceToCollapse[0];
    }

    // Comment: Recursive step: if there's more than one element,
    // calculate the next reduction step and then call the function again
    // with the newly generated (shorter) sequence.
    const intermediateReducedSequence = calculateNextReductionStep(sequenceToCollapse);

    // Optional: Add a check for an empty intermediate sequence, though standard input should prevent this.
    if (intermediateReducedSequence.length === 0 && sequenceToCollapse.length > 1) {
        console.error("Error: Reduction step resulted in an empty sequence unexpectedly.");
        // Fallback or error handling
        return -1; // Indicate an error or specific fallback value.
    }

    return recursivelyReduceToSingleDigit(intermediateReducedSequence);
}

// Main execution block:
// Encapsulate the primary logic within an Immediately Invoked Function Expression (IIFE)
// to manage scope and execution flow.
(function processInputAndComputeResults() {
    // Comment: Attempt to read the entire content from the standard input device.
    // Using 'utf-8' encoding ensures proper character interpretation.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');

    // Comment: Parse the raw input content into structured digit sequences.
    const parsedDigitSequences = parseInputSequences(standardInputContent);

    // Comment: If no valid sequences were parsed, exit early.
    if (parsedDigitSequences.length === 0) {
        console.log("No digit sequences found to process.");
        return;
    }

    // Comment: Apply the recursive reduction function to each individual digit sequence.
    // This transforms an array of number arrays into an array of single numbers.
    const finalProcessedOutcomes = parsedDigitSequences.map(individualDigitSequence => {
        // Add a simple guard to handle empty individual sequences gracefully.
        if (individualDigitSequence.length === 0) {
            console.warn("Warning: Encountered an empty digit sequence. Skipping or returning default.");
            return null; // Or some other placeholder for empty sequences.
        }
        return recursivelyReduceToSingleDigit(individualDigitSequence);
    });

    // Comment: Output the array of computed single digits to the console.
    // Filtering out any nulls introduced by the guard clause.
    console.log(finalProcessedOutcomes.filter(result => result !== null));
})();