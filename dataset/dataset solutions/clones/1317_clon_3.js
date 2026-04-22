// This module provides file system utilities, essential for reading input data.
const fileSystemModule = require('fs');

// Define the standard input file path, typically used for competitive programming environments.
const standardInputFilePath = '/dev/stdin';

// Specify the character encoding to be used when reading the file content.
const textEncodingStandard = 'utf8';

// --- Data Input and Initial Processing ---

// Read the entire content of the standard input file synchronously.
// The `readFileSync` method returns the file's content as a Buffer.
const rawBufferContent = fileSystemModule.readFileSync(standardInputFilePath, textEncodingStandard);

// Convert the raw buffer content into a string, remove any leading/trailing whitespace,
// and then split the string into an array of lines based on newline characters.
// This yields an array where each element is a distinct line from the input.
const parsedInputLines = rawBufferContent.toString().trim().split('\n');

// --- Input Validation and String Extraction ---

// It's good practice to validate input. For this problem, we expect at least two lines.
// If fewer than two lines are provided, it indicates an invalid input scenario.
if (parsedInputLines.length < 2) {
    // In a production environment, this would involve more robust error handling
    // or providing a default behavior. For competitive programming, invalid inputs
    // are often not explicitly tested or are assumed to not occur.
    console.error("Error: Insufficient input lines. Expected at least two distinct lines.");
    // An alternative could be to exit the process or throw an error.
    // For this exercise, we'll proceed assuming the problem guarantees valid input structure.
    // To prevent potential errors later, we can assign empty strings or default values.
    parsedInputLines.push(''); // Ensure at least two elements to avoid index errors below.
}

// Extract the primary source string from the first line of the processed input.
const mainSourceString = parsedInputLines[0];

// Extract the pattern string (the fragment to search for) from the second line.
const targetPatternFragment = parsedInputLines[1];

// --- Cyclic String Search Logic ---

// Early exit condition (Type III addition):
// If the pattern fragment is longer than the main source string, it cannot possibly
// be a cyclic shift of the main source string, nor can it be a substring of the doubled source.
// This check optimizes performance by avoiding unnecessary string operations.
if (targetPatternFragment.length > mainSourceString.length) {
    console.log('No'); // A longer string cannot be a cyclic shift of a shorter one.
    return; // Terminate execution early as the result is definitive.
}

// To check if `targetPatternFragment` is a cyclic shift of `mainSourceString`,
// we create an extended version of the source string by concatenating it with itself.
// For example, if mainSourceString = "abc", then extendedSource = "abcabc".
// Any cyclic shift of "abc" (like "bca", "cab") will be a substring of "abcabc".
const extendedSourceForCyclicCheck = mainSourceString.repeat(2);

// Utilize the `includes()` string method to efficiently determine if the
// `targetPatternFragment` exists as a substring within the `extendedSourceForCyclicCheck`.
// This method returns a boolean value: `true` if found, `false` otherwise.
const isFragmentPresentAsCyclicShift = extendedSourceForCyclicCheck.includes(targetPatternFragment);

// --- Output Generation ---

// Initialize a variable to hold the final output message.
let outcomeMessage;

// Based on the result of the substring check, assign the appropriate message.
if (isFragmentPresentAsCyclicShift) {
    outcomeMessage = 'Yes';
} else {
    outcomeMessage = 'No';
}

// Print the final outcome message to the console.
console.log(outcomeMessage);