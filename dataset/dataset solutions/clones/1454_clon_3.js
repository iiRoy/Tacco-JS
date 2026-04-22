const fileSystemModule = require('fs'); // Import the Node.js file system module

// Define key constants for file paths and delimiters to enhance readability and maintainability.
const standardInputPath = '/dev/stdin'; // Path to the standard input file descriptor
const lineBreakDelimiter = '\n';       // Delimiter for separating lines in the input
const valueSeparationChar = ' ';       // Character used to separate numerical values on a line
const dataLineZeroIndex = 1;           // The zero-based index of the line containing the numerical data

/**
 * Safely reads the entire content from a specified file path.
 * Includes error handling for file system operations.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The content of the file as a UTF-8 string.
 * @throws {Error} If the file cannot be read.
 */
function acquireFileContent(filePath) {
    try {
        // Attempt to synchronously read the file content, specifying UTF-8 encoding.
        return fileSystemModule.readFileSync(filePath, 'utf8');
    } catch (readOperationError) {
        // Log a descriptive error message and terminate the process if file reading fails.
        console.error(`Fatal Error: Could not read input from '${filePath}'. Details: ${readOperationError.message}`);
        process.exit(1); // Exit with a non-zero code to indicate failure
    }
}

/**
 * Parses a string into a number, returning null for non-numeric or empty inputs.
 * @param {string} stringRepresentation - The string to parse.
 * @returns {number|null} The parsed number, or null if parsing fails.
 */
const parseStringToNumber = (stringRepresentation) => {
    // Trim whitespace from the string before attempting to convert.
    const trimmedString = stringRepresentation.trim();
    if (trimmedString === '') {
        return null; // Treat empty strings as invalid for number parsing
    }
    const numericValue = Number(trimmedString); // Use Number constructor for conversion

    // Check if the result is a valid finite number.
    return isNaN(numericValue) ? null : numericValue;
};

// --- Main execution flow starts here ---

// 1. Retrieve raw input from the standard input stream.
const rawInputData = acquireFileContent(standardInputPath);

// 2. Process the raw input: trim any leading/trailing whitespace and split into an array of lines.
const parsedInputLines = rawInputData.trim().split(lineBreakDelimiter);

// 3. Validate the input structure: ensure the target data line exists.
if (parsedInputLines.length <= dataLineZeroIndex) {
    console.error(`Input Format Error: Expected at least ${dataLineZeroIndex + 1} lines of data, but found only ${parsedInputLines.length}.`);
    process.exit(1);
}

// 4. Extract the specific line containing the numerical sequence.
const numericalDataString = parsedInputLines[dataLineZeroIndex];

// 5. Initialize an array to store the successfully parsed numbers.
let collectedNumericValues = [];

// 6. Split the numerical data string by the defined separator and iterate to parse each segment.
const individualValueStrings = numericalDataString.split(valueSeparationChar);
for (const valueSegment of individualValueStrings) {
    const parsedNumber = parseStringToNumber(valueSegment);
    if (parsedNumber !== null) {
        collectedNumericValues.push(parsedNumber);
    }
    // Optionally, could add logging here for values that failed to parse:
    // else if (valueSegment.trim() !== '') {
    //     console.warn(`Warning: Skipped non-numeric or malformed value: '${valueSegment}'`);
    // }
}

// 7. Sort the array of numbers in ascending order.
// The comparison function `(a, b) => a - b` ensures numerical ascending sort.
collectedNumericValues.sort((firstVal, secondVal) => firstVal - secondVal);

// 8. Prepare the final output string by joining the sorted numbers with the specified separator.
const resultOutputString = collectedNumericValues.join(valueSeparationChar);

// 9. Display the sorted sequence to the standard output.
console.log(resultOutputString);