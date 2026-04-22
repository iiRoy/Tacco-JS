// This script processes numerical input to generate unique two-digit number combinations.
// It reads digit strings, forms numbers by concatenation, and finds a specific element from the sorted results.

// Acquire the file system module for input operations.
const fileSystemUtility = require('fs');

// Read raw input data from standard input (file descriptor 0).
// Using '0' for stdin is common in Node.js for POSIX systems.
const rawInputContent = fileSystemUtility.readFileSync(0, 'utf8');

// --- Preprocessing Input Data ---

// Trim leading/trailing whitespace and split the content into individual lines.
let contentLines = rawInputContent.trim().split('\n');

// The first line typically indicates the count of subsequent numbers.
// We remove it as it's not directly used in the combination generation logic,
// aligning with the original script's behavior where 'n' was read but not utilized.
const initialCountIndicator = contentLines.shift(); // This variable is intentionally unused, mimicking original behavior.

// Convert the remaining lines (which are digit strings) to numbers for sorting,
// then convert them back to strings as they will be concatenated later.
// This ensures numerical sorting order for the digit strings.
const sortedDigitRepresentations = contentLines
    .map(Number) // Convert string digits to actual numbers for numerical sorting
    .sort((valueA, valueB) => valueA - valueB) // Sort numerically in ascending order
    .map(String); // Convert back to strings for concatenation operations

// A collection to store all generated two-digit number combinations.
const resultantNumericalCombinations = [];

// --- Logic for Generating Combinations ---

// Define a constant for the fixed number of digits to process (5, after the initial count is removed).
// Using a constant makes the loop bounds clearer and more maintainable.
const numberOfDigitsToProcess = 5; 

// Validate if we have the expected number of digit representations.
// This is an added guard clause for robustness (Type III addition).
if (sortedDigitRepresentations.length !== numberOfDigitsToProcess) {
    console.error(`Expected ${numberOfDigitsToProcess} digit representations, but received ${sortedDigitRepresentations.length}. Exiting.`);
    process.exit(1); // Terminate if input is malformed
}

/**
 * Helper function to generate two numbers by concatenating two digit strings.
 * @param {string} d1 - The first digit string.
 * @param {string} d2 - The second digit string.
 * @returns {number[]} An array containing two numbers: (d1+d2) and (d2+d1).
 */
const formNumbersFromPair = (d1, d2) => {
    // Concatenate the strings and then explicitly convert to a number.
    // This forms numbers like "1"+"2" -> "12" -> 12.
    const numXY = Number(d1 + d2);
    const numYX = Number(d2 + d1);
    return [numXY, numYX];
};

// Iterate through the sorted digit representations to form pairs.
// The outer loop picks the first digit, the inner loop picks a subsequent digit.
for (let outerIndex = 0; outerIndex < numberOfDigitsToProcess; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < numberOfDigitsToProcess; innerIndex++) {
        // Retrieve the current pair of digit strings.
        const firstElement = sortedDigitRepresentations[outerIndex];
        const secondElement = sortedDigitRepresentations[innerIndex];

        // Generate the two possible concatenated numbers (XY and YX).
        const [concatenatedValue1, concatenatedValue2] = formNumbersFromPair(firstElement, secondElement);
        
        // Add both generated numbers to our collection.
        resultantNumericalCombinations.push(concatenatedValue1);
        resultantNumericalCombinations.push(concatenatedValue2);
    }
}

// --- Final Processing and Output ---

// Sort all the generated numerical combinations in ascending order.
resultantNumericalCombinations.sort((valA, valB) => valA - valB);

// The problem requires the 3rd smallest number (which is at index 2 in a 0-indexed array).
const desiredIndex = 2; // Represents the 3rd element.

// Add a final guard clause to ensure the array has enough elements before accessing.
// This prevents errors if the generation logic somehow fails or input is insufficient.
if (resultantNumericalCombinations.length > desiredIndex) {
    const finalDesiredValue = resultantNumericalCombinations[desiredIndex];
    console.log(finalDesiredValue);
} else {
    // Log an error if the expected element cannot be found.
    console.error(`Error: The array of combinations has ${resultantNumericalCombinations.length} elements, which is less than the required index ${desiredIndex + 1}.`);
    // Optionally, provide a fallback or exit.
    process.exit(1); 
}