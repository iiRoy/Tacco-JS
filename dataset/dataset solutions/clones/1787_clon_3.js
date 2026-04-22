// Function to handle the primary data processing flow.
// This utility extracts the initial characters from a given textual input.
function processInputString(sourceString) {
    // Validate input type to ensure it's a string.
    if (typeof sourceString !== 'string') {
        // Log an error and return an empty string or throw an error for invalid input.
        console.error("Error: Provided input is not a string.");
        return ''; // Return an empty string in case of invalid input type.
    }

    // Convert the input string into an array of individual characters.
    // This allows for easier manipulation and access to specific characters.
    const individualCharacters = sourceString.split('');

    // Define the exact number of characters we intend to extract from the beginning.
    const desiredCharacterCount = 3;

    // Implement a pre-check (guard clause) to ensure the input has enough characters.
    // If the string is shorter than required, we cannot extract the desired segment.
    if (individualCharacters.length < desiredCharacterCount) {
        console.warn(`Warning: Input string is too short (${individualCharacters.length} chars). Expected at least ${desiredCharacterCount}.`);
        // Return a default or truncated string if not enough characters.
        // For this clone, we'll return what's available, joined.
        return individualCharacters.join('');
    }

    // Extract the first 'desiredCharacterCount' characters using array slicing.
    // This creates a new array containing only the relevant characters.
    const initialSegmentArray = individualCharacters.slice(0, desiredCharacterCount);

    // Join the extracted characters back into a single string.
    // This forms the final output segment.
    const finalConstructedSegment = initialSegmentArray.join('');

    // Return the resulting string segment.
    return finalConstructedSegment;
}

// --- Main execution block ---

// Define the path for standard input, typically /dev/stdin on Unix-like systems.
const standardInputPath = "/dev/stdin";

// Acquire the file system module for reading input from files.
const filesystemModule = require("fs");

// Synchronously read the entire content from the standard input file.
// The content is expected to be UTF-8 encoded text, which is a common standard.
const rawInputContent = filesystemModule.readFileSync(standardInputPath, "utf8");

// Process the acquired raw content using our specialized function.
// The result of this processing will be the first few characters of the input string.
const processedOutput = processInputString(rawInputContent);

// Display the final processed output to the console.
// This is the end result of the program's execution, showing the extracted segment.
console.log(processedOutput);