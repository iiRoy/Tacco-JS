const fileSystemModule = require('fs'); // Import the standard Node.js file system module

/**
 * Helper function to safely convert a string segment into a numeric value.
 * Returns null if the conversion results in NaN.
 * @param {string} inputSegment - The string part to convert.
 * @returns {number|null} The numeric value or null if invalid.
 */
const convertToValidNumber = (inputSegment) => {
    // Attempt to convert the string to a floating-point number
    const numericValue = parseFloat(inputSegment);
    // Check if the conversion was successful (not NaN)
    if (isNaN(numericValue)) {
        // Log a warning for debugging purposes, but continue processing valid numbers
        // console.warn(`Warning: Could not parse '${inputSegment}' as a valid number.`);
        return null; // Indicate an invalid number
    }
    return numericValue; // Return the successfully parsed number
};

let rawInputContents = ''; // Variable to hold the raw content read from the input source

try {
    // Attempt to read the entire content from the standard input stream synchronously.
    // The '/dev/stdin' path is a common convention for standard input on Unix-like systems.
    // 'utf8' specifies the character encoding for the input data.
    rawInputContents = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and exit gracefully or provide a default fallback.
    console.error("Error reading input from /dev/stdin:", readError.message);
    // As a fallback, we might provide some default input or exit.
    // For this problem, let's assume input is always provided or the program should terminate.
    process.exit(1); // Terminate the process with an error code
}

// Ensure the input is a string and trim any leading/trailing whitespace.
// Then, split the string by one or more whitespace characters to get individual segments.
// The filter(Boolean) removes any empty strings that might result from multiple spaces.
const stringSegments = rawInputContents.trim().split(/\s+/).filter(Boolean);

// Map each string segment to a number, filtering out any invalid conversions.
const parsedNumericArray = stringSegments.map(convertToValidNumber).filter(val => val !== null);

// Guard clause: If no valid numbers were parsed, output an empty line or a specific message.
if (parsedNumericArray.length === 0) {
    console.log("No valid numbers found in the input.");
    process.exit(0); // Exit successfully as no numbers to process
}

// Create a new array containing the numeric values, then sort them in ascending order.
// The custom comparison function (a, b) => a - b ensures numerical sorting.
const sortedNumericalElements = [...parsedNumericArray].sort((a, b) => a - b);

let finalDisplayString = ''; // Initialize an empty string to build the output.

// Iterate through the sorted numbers to construct the final output string.
// This approach avoids `reduce` and `slice` for a more explicit loop structure.
for (let i = 0; i < sortedNumericalElements.length; i++) {
    // Append the current number to the string.
    finalDisplayString += sortedNumericalElements[i];
    // If it's not the last element, append a space for separation.
    if (i < sortedNumericalElements.length - 1) {
        finalDisplayString += ' ';
    }
}

// Output the final constructed string to the standard output.
console.log(finalDisplayString);