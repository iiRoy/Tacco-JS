const fileSystemModule = require('node:fs'); // Import the Node.js file system module for input operations.

// --- Stage 1: Input Acquisition and Preprocessing ---

// Define the standard input path, typically '/dev/stdin' on Unix-like systems.
const standardInputPath = '/dev/stdin';
// Specify the character encoding for reading the input stream.
const inputEncodingOption = { encoding: 'ascii' };

let rawDataFromInput;
try {
    // Synchronously read the entire content of the standard input file.
    rawDataFromInput = fileSystemModule.readFileSync(standardInputPath, inputEncodingOption);
} catch (errorReadingInput) {
    // Handle potential errors during file reading, e.g., file not found or permissions.
    console.error("Error reading standard input:", errorReadingInput.message);
    // Terminate execution gracefully if input cannot be read.
    process.exit(1);
}

// Trim any leading or trailing whitespace from the raw input string.
const cleanedInputString = rawDataFromInput.trim();

// Convert the cleaned input string into an integer.
// Explicitly using radix 10 for decimal conversion.
let upperBoundary = Number.parseInt(cleanedInputString, 10);

// --- Stage 2: Input Validation (Guard Clause) ---

// Validate if the parsed input is a valid positive integer.
// If it's not a number, or is less than 1, or is not an integer, we consider it invalid.
if (isNaN(upperBoundary) || upperBoundary < 1 || !Number.isInteger(upperBoundary)) {
    console.error("Invalid input: Please provide a positive integer value.");
    // Exit the program if the input is not valid.
    process.exit(1);
}

// --- Stage 3: Core Logic - Number Filtering ---

// Initialize an empty array to store numbers that meet the specific criteria.
const qualifyingNumbersCollection = [];

// Helper function to determine if a number is a multiple of three.
const isMultipleOfThree = (numericValue) => {
    // The modulo operator (%) returns the remainder of a division.
    return (numericValue % 3) === 0;
};

// Helper function to check if a number's string representation contains the digit '3'.
const containsSpecificDigit = (numericValue, targetDigit = '3') => {
    // Convert the number to a string to easily check for digit presence.
    const stringRepresentation = numericValue.toString();
    // Use the 'includes' method for a cleaner check than 'indexOf'.
    return stringRepresentation.includes(targetDigit);
};

// Start iterating from the initial value (1) up to and including the upper boundary.
let currentNumber = 1;
while (currentNumber <= upperBoundary) {
    // Calculate the conditions for the current number.
    const isDivisibleByThreeCondition = isMultipleOfThree(currentNumber);
    const hasThreeDigitCondition = containsSpecificDigit(currentNumber, '3');

    // Combine the conditions: a number qualifies if it meets EITHER criterion.
    const isConditionMet = isDivisibleByThreeCondition || hasThreeDigitCondition;

    // If the current number satisfies the combined condition, add it to our collection.
    if (isConditionMet) {
        qualifyingNumbersCollection.push(currentNumber);
    }

    // Increment the counter to move to the next number in the sequence.
    currentNumber++;
}

// --- Stage 4: Output Generation ---

// Join all the numbers in the collection into a single string,
// separated by a single space character.
const formattedResultString = qualifyingNumbersCollection.join(' ');

// Print the final result string to the console (standard output).
console.log(formattedResultString);