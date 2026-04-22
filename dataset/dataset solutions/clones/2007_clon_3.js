const fileSystemOperations = require("fs");

// This function is responsible for obtaining the raw content from a specified file path.
// It uses synchronous file reading and specifies UTF-8 encoding for text data.
const rawInputContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");

// A utility function to convert an array of string representations of numbers
// into an array of actual numeric values. It also handles potential non-numeric inputs.
const transformStringsToNumbers = (stringArray) => {
    // The map method applies the Number conversion to each element.
    // The filter method ensures that only valid numbers (not NaN) are retained.
    return stringArray.map(item => Number(item)).filter(value => !isNaN(value));
};

// --- Input Validation and Processing ---

// Check if the input content is empty or malformed at the very beginning.
// If the raw content is empty, or if splitting it doesn't yield any lines,
// or if the first line itself is empty after trimming whitespace, it's considered an error.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("Execution Aborted: No valid input data provided or stream is empty.");
    // In a production environment, this might involve more sophisticated error handling or logging.
    process.exit(1); // Terminate the process with an error code.
}

// Divide the entire input content into an array of separate lines.
// Each element in this array corresponds to a line from the input file.
const contentLines = rawInputContent.split('\n');

// Extract the first line of data, which is expected to contain our primary numeric parameters.
const primaryDataLine = contentLines[0];

// Split the first line by spaces to get individual string components.
// These components are expected to be the string representations of our numbers N and K.
const stringSegments = primaryDataLine.split(' ');

// Convert these string segments into actual numbers using our helper function.
const parsedNumericValues = transformStringsToNumbers(stringSegments);

// Validate that we successfully extracted at least two numeric values from the first line.
// If not, it indicates an issue with the input format.
if (parsedNumericValues.length < 2) {
    console.error("Execution Aborted: Insufficient numeric parameters found on the first line.");
    process.exit(1);
}

// Assign the parsed numbers to clearly named variables for better readability.
// 'valueN' represents the first number from the input.
const valueN = parsedNumericValues[0];
// 'valueK' represents the second number from the input, which acts as a divisor.
const valueK = parsedNumericValues[1];

// --- Core Logic: Calculating the Minimum Absolute Difference ---

// Original code had a console.log(N, K) here. This has been intentionally removed
// as a Type III modification (deletion of non-essential debugging output).

// Implement a critical guard against division by zero, which would cause a runtime error.
if (valueK === 0) {
    console.error("Execution Aborted: The divisor (K) cannot be zero. Division by zero is undefined.");
    process.exit(1);
}

// Calculate the standard non-negative remainder of valueN divided by valueK.
// This remainder 'r' is always in the range [0, valueK - 1] for positive valueK.
const calculatedRemainder = valueN % valueK;

// This represents the direct distance from valueN to the nearest multiple of valueK that is less than or equal to valueN.
// For example, if N=10, K=3, remainder is 1. Distance to 3*3=9 is 1.
const distanceToLowerMultiple = calculatedRemainder;

// This represents the distance from valueN to the nearest multiple of valueK that is greater than valueN.
// For example, if N=10, K=3, remainder is 1. The next multiple is 3*4=12. Distance to 12 is 12-10=2.
// This can be derived as K - (N % K).
const distanceToUpperMultiple = valueK - calculatedRemainder;

// The final objective is to find the minimum of these two distances.
// This gives the smallest absolute difference between valueN and *any* multiple of valueK.
const finalOptimalDifference = Math.min(distanceToLowerMultiple, distanceToUpperMultiple);

// --- Output the Result ---

// Display the calculated minimum absolute difference to the standard output.
console.log(finalOptimalDifference);