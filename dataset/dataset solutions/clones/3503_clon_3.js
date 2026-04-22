// Import the Node.js File System module for input operations.
const nodeFileSystem = require('fs');

// Define a set of constants to represent the digits involved in the transformation.
// Using named constants enhances readability and maintainability,
// and is an example of adding new code fragments.
const DIGIT_ONE_CHAR = '1';       // The character '1' as a string.
const DIGIT_NINE_CHAR = '9';      // The character '9' as a string.
const SUBSTITUTION_VALUE_FOR_ONE = 9; // The numeric value to replace '1'.
const SUBSTITUTION_VALUE_FOR_NINE = 1; // The numeric value to replace '9'.

/**
 * Retrieves the entire content from the designated standard input file path.
 * This function encapsulates the I/O operation for better modularity.
 * @returns {string} The raw string data read from /dev/stdin.
 */
function retrieveStandardInputData() {
    // Read the file synchronously and specify UTF-8 encoding for text data.
    // Any potential errors during file reading (e.g., file not found) would
    // typically be handled here in a robust application, but for competitive
    // programming, input is usually guaranteed.
    return nodeFileSystem.readFileSync('/dev/stdin', 'utf8');
}

/**
 * Applies a specific transformation rule to a single character digit.
 * If the input character is '1', it yields 9. If it's '9', it yields 1.
 * This function demonstrates an updated and rewritten part of the logic.
 * @param {string} individualDigitChar - A single character string representing a digit.
 * @returns {number} The transformed numeric value.
 */
function performDigitTransformation(individualDigitChar) {
    // Convert the character string to its integer representation for comparison.
    const currentNumericValue = parseInt(individualDigitChar, 10);

    // Implement the conditional logic using an explicit if-else structure.
    // This is an alternative to a ternary operator or a direct map lookup.
    if (currentNumericValue === parseInt(DIGIT_ONE_CHAR, 10)) {
        return SUBSTITUTION_VALUE_FOR_ONE;
    } else if (currentNumericValue === parseInt(DIGIT_NINE_CHAR, 10)) {
        return SUBSTITUTION_VALUE_FOR_NINE;
    } else {
        // This 'guard clause' is an added fragment for robustness,
        // logging an unexpected input scenario, though usually not hit
        // with well-defined competitive programming inputs.
        console.error(`Error: Encountered an unexpected character '${individualDigitChar}'. Expected '${DIGIT_ONE_CHAR}' or '${DIGIT_NINE_CHAR}'.`);
        // For demonstration, we might return the original numeric value or throw an error.
        return currentNumericValue;
    }
}

// --- Primary Program Execution Sequence ---

// 1. Fetch the complete input string.
let sourceInputString = retrieveStandardInputData();

// 2. Break down the entire input string into an array where each element is
//    a distinct character. This is an intermediate step.
let characterSegmentArray = sourceInputString.split('');

// 3. Prepare a new array to accumulate the results of our digit transformations.
//    Using a loop with push() instead of map() is a structural change.
let convertedNumericElements = [];

// 4. Iterate over each character in the segmented array.
for (const charItem of characterSegmentArray) {
    // Apply the transformation logic to the current character and store the result.
    const processedValue = performDigitTransformation(charItem);
    convertedNumericElements.push(processedValue);
}

// 5. Join the array of transformed numeric elements back into a single string.
//    This forms the new number as a string representation.
let resultantJoinedString = convertedNumericElements.join('');

// 6. Convert the final string representation into a true JavaScript number.
//    The unary plus operator is a concise alternative to Number() or parseInt().
let finalNumericOutput = +resultantJoinedString;

// 7. Display the ultimate calculated numeric result to the console.
console.log(finalNumericOutput);