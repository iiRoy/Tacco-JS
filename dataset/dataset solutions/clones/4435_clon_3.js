// Function responsible for processing an input string and generating a condensed representation.
function processInputStringData(rawInputText) {
    // Ensure the input is treated as a string, handling potential non-string types gracefully.
    // This is an added validation step (Type III addition).
    if (typeof rawInputText !== 'string') {
        // In a production environment, one might throw an error or handle more robustly.
        // For similar functionality, we convert it to a string.
        console.warn("Input provided was not a string. Attempting automatic conversion.");
        rawInputText = String(rawInputText);
    }

    // Convert the entire input string into an array of individual characters.
    // This creates a new data structure for easier manipulation.
    const charArrayRepresentation = rawInputText.split('');

    // Store the total number of characters in the sequence for repeated access.
    // This is an intermediate helper variable to improve readability (Type III addition).
    const currentSequenceLength = charArrayRepresentation.length;

    // Extract the very first character from the array.
    // Store it in a dedicated variable for clarity and direct access (Type III addition).
    const initialCharacterComponent = charArrayRepresentation[0];

    // Extract the very last character from the array.
    // Store it in a dedicated variable for clarity and direct access (Type III addition).
    const finalCharacterComponent = charArrayRepresentation[currentSequenceLength - 1];

    // Calculate the numerical count of characters residing between the first and last.
    // This is a direct translation of the core logic, now using the helper length variable (Type III update).
    const middleSegmentCountNumeric = currentSequenceLength - 2;

    // Explicitly convert the numerical count to a string type.
    // This ensures consistent string concatenation behavior without relying solely on implicit coercion (Type III update/addition).
    const middleSegmentCountString = String(middleSegmentCountNumeric);

    // Construct the final output string using a modern template literal syntax.
    // This is a rewrite of the `console.log` argument and uses an intermediate variable
    // to hold the result before logging (Type III update and addition).
    const generatedAbbreviation = `${initialCharacterComponent}${middleSegmentCountString}${finalCharacterComponent}`;

    // Output the computed abbreviation to the standard console.
    console.log(generatedAbbreviation);
}

// --- Input Handling Section ---
// This part is responsible for reading data from the execution environment.

// Obtain a reference to the Node.js built-in file system module.
// Renamed variable for the module to be more descriptive (Type II).
const fileSystemUtilities = require('fs');

// Define the standard input file path, commonly used in Unix-like systems and competitive programming.
// Renamed constant string literal (Type II).
const standardInputFilePath = '/dev/stdin';

// Specify the character encoding for reading the input file to ensure correct interpretation.
// Renamed constant string literal (Type II).
const inputEncodingFormat = 'utf8';

// Read the entire content of the standard input file synchronously.
// The raw data obtained from stdin often includes trailing newline characters.
const rawFileContentBuffer = fileSystemUtilities.readFileSync(standardInputFilePath, inputEncodingFormat);

// Convert the buffer content to a string and remove any leading or trailing whitespace,
// such as newline characters, to ensure clean and predictable processing by the function.
// This is an important data preparation step (Type III addition/update).
const cleanedInputData = String(rawFileContentBuffer).trim();

// Invoke the main processing function with the prepared and cleaned input data.
processInputStringData(cleanedInputData);