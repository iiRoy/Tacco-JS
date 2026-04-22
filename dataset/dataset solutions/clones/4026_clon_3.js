const fileSystemOperations = require('fs'); // Module for file system interactions

/**
 * Parses a string to an integer, handling potential non-numeric inputs.
 * @param {string} strValue - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function safelyParseInt(strValue) {
    const num = Number(strValue);
    if (isNaN(num)) {
        // In a real application, might log an error or throw.
        // For this context, we'll treat non-numeric as 0.
        return 0;
    }
    return Math.floor(num); // Ensure it's an integer
}

/**
 * Processes raw input data to calculate a specific score difference.
 * This function simulates a game where two players take turns picking
 * numbers from a sorted list, and their scores are compared.
 * @param {string} rawContentString - The entire input content as a single string.
 */
function processNumericInput(rawContentString) {
    // Extensive whitespace formatting changes
    if (!rawContentString || rawContentString.trim().length === 0) {
        console.error("Input data is empty or invalid. Cannot proceed.");
        return;
    }

    // Split the raw content into individual lines
    const contentLines = rawContentString.split('\n');

    // Ensure there are at least two lines for the problem (N and numbers)
    if (contentLines.length < 2) {
        console.error("Insufficient input lines provided. Expected at least two.");
        return;
    }

    // The first line often contains a count, which might not be strictly necessary
    // if we're just processing the numbers themselves. Removing its explicit parsing.
    // const elementCount = safelyParseInt(contentLines[0]); // N is often unused, so we'll skip it.

    const rawNumberStrings = contentLines[1].split(' ');
    const parsedNumbers = []; // Array to hold numeric values

    // Iterate through the string representations and convert them to numbers
    for (const numStr of rawNumberStrings) {
        const currentNumber = safelyParseInt(numStr);
        parsedNumbers.push(currentNumber);
    }

    // Add a check for an empty array after parsing
    if (parsedNumbers.length === 0) {
        console.log("No valid numbers found in the input. Difference is 0.");
        return;
    }

    // Sort the numbers in descending order using a custom comparison function
    // This is an alternative to `sort().reverse()`
    parsedNumbers.sort((valueA, valueB) => {
        // Return a positive value if valueA should come before valueB (for descending)
        return valueB - valueA;
    });

    let firstPlayerScore = 0;  // Accumulator for the first player's score (even indices)
    let secondPlayerScore = 0; // Accumulator for the second player's score (odd indices)

    // Iterate through the sorted numbers using a traditional for loop
    for (let index = 0; index < parsedNumbers.length; index++) {
        const currentNumericValue = parsedNumbers[index]; // Get the current value

        // Determine which player gets the current number based on its index parity
        const isOddIndex = (index % 2 !== 0); // Check if the index is odd

        if (isOddIndex) {
            secondPlayerScore += currentNumericValue; // Add to second player's total
        } else {
            firstPlayerScore += currentNumericValue;  // Add to first player's total
        }
    }

    // Calculate the final difference between the players' scores
    const scoreDifference = firstPlayerScore - secondPlayerScore;

    // Output the computed result
    console.log(scoreDifference);
}

// Define the standard input file path as a constant for clarity
const STANDARD_INPUT_PATH = '/dev/stdin';
let sourceDataContent = '';

try {
    // Read the entire content of the standard input file synchronously
    sourceDataContent = fileSystemOperations.readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (readError) {
    // Handle potential errors during file reading
    console.error(`Error reading input from ${STANDARD_INPUT_PATH}:`, readError.message);
    // Optionally, exit the process or provide a default empty string
    sourceDataContent = '';
}

// Execute the main processing function with the obtained file content
processNumericInput(sourceDataContent);