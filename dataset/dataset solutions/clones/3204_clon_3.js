/**
 * Processes raw input text to determine if a specific numeric pattern is present.
 * This function is designed to identify occurrences of numbers within a predefined range (1 through 4)
 * and then checks if their sorted frequencies match a specific target pattern, which is [1, 1, 2, 2].
 *
 * @param {string} rawTextContent - The input string, expected to contain space or newline separated numbers.
 */
function processInputData(rawTextContent) {
    // Define constants for expected numeric range and the target frequency pattern.
    // Using constants enhances readability and makes the code more maintainable (Type III change).
    const MIN_EXPECTED_VALUE = 1;
    const MAX_EXPECTED_VALUE = 4;
    const NUMBER_OF_COUNTERS = MAX_EXPECTED_VALUE - MIN_EXPECTED_VALUE + 1; // Calculates array size, which should be 4.
    const TARGET_FREQUENCY_PATTERN = Object.freeze([1, 1, 2, 2]); // The immutable pattern to match against (Type III change).

    /**
     * Helper function to validate if the observed frequency configuration matches the target pattern.
     * This abstracts the comparison logic, making the main function cleaner (Type III change).
     * @param {number[]} sortedFrequencies - An array of sorted occurrence counts.
     * @param {number[]} targetPattern - The pattern array to compare against.
     * @returns {boolean} - True if the frequencies match the pattern, false otherwise.
     */
    const determineConfigurationValidity = (sortedFrequencies, targetPattern) => {
        // First, perform a quick check for array length mismatch (Type III guard clause).
        if (sortedFrequencies.length !== targetPattern.length) {
            return false;
        }

        // Iterate through both arrays and compare each element (Type III structural change).
        for (let idx = 0; idx < targetPattern.length; idx++) {
            if (sortedFrequencies[idx] !== targetPattern[idx]) {
                return false; // Mismatch found, so the pattern is not valid.
            }
        }
        return true; // All elements matched, pattern is valid.
    };

    // Step 1: Parse the input string into an array of validated numeric values.
    // This process is broken down into more explicit sub-steps compared to the original one-liner (Type II & III changes).
    const whitespaceDelimiterRegex = /\s+/; // Using a named regex variable for clarity (Type II change).
    const stringTokens = rawTextContent.trim().split(whitespaceDelimiterRegex); // Split by any sequence of whitespace.
    
    // Filter out any empty strings that might result from splitting (e.g., if there are multiple spaces) (Type III change).
    const cleanTokens = stringTokens.filter(token => token.length > 0); 
    
    // Convert string tokens to integers, adding validation and error handling (Type III change).
    const numericValues = cleanTokens.map(token => {
        const parsedNumber = parseInt(token, 10); // Explicitly specify base 10 for parsing (Type II change).
        // Guard clause: Check for non-numeric input or values outside the expected range (Type III change).
        if (isNaN(parsedNumber) || parsedNumber < MIN_EXPECTED_VALUE || parsedNumber > MAX_EXPECTED_VALUE) {
            console.warn(`Encountered an unexpected or invalid input token: '${token}'. This value will be skipped.`);
            return null; // Return null to mark this value for later filtering.
        }
        return parsedNumber;
    }).filter(val => val !== null); // Remove any null values (invalid inputs) from the array (Type III change).

    // Step 2: Initialize an array to store the occurrence counts for each expected value (1-4).
    // The variable `tmp` is renamed to `occurrenceTallies` for better descriptive naming (Type II change).
    // Using `new Array().fill(0)` is more explicit and scalable than a hardcoded array literal (Type III change).
    let occurrenceTallies = new Array(NUMBER_OF_COUNTERS).fill(0); 

    // Iterate through the validated numeric values and increment their corresponding counters.
    // Using a `for...of` loop instead of `forEach` for slightly different iteration style (Type III change).
    for (const currentNumericValue of numericValues) {
        // The index is adjusted to be 0-based: value 1 maps to index 0, value 2 to index 1, etc.
        occurrenceTallies[currentNumericValue - MIN_EXPECTED_VALUE]++; 
    }

    // Step 3: Sort the occurrence counts in ascending order.
    // Providing an explicit comparator function `(a, b) => a - b` ensures correct numeric sorting (Type II change).
    occurrenceTallies.sort((a, b) => a - b); 

    // Step 4: Determine if the sorted counts array matches the predefined target pattern.
    // This step utilizes the `determineConfigurationValidity` helper function (Type III change).
    const isPatternMatched = determineConfigurationValidity(occurrenceTallies, TARGET_FREQUENCY_PATTERN);

    // Step 5: Output the final result to the console.
    // The boolean `res` is renamed to `isPatternMatched` and the output message stored in a variable (Type II change).
    const finalOutputMessage = isPatternMatched ? 'YES' : 'NO'; 
    console.log(finalOutputMessage); 
}

// Entry point for script execution: Read input from standard input and invoke the processing function.
// Using helper variables for file system operations improves readability (Type III change).
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin'; // Variable for the standard input file path (Type II change).

try {
    // Attempt to read the entire content of the standard input file.
    const fileContents = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
    // If successful, pass the file content to the main processing function.
    processInputData(fileContents);
} catch (error) {
    // Implement robust error handling for file reading failures (Type III change).
    console.error(`An error occurred while attempting to read input from ${standardInputFilePath}:`, error.message);
    process.exit(1); // Exit the process with an error code to indicate failure.
}