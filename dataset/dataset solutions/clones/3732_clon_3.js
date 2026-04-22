// A utility function to safely convert a string representation to an integer,
// providing a default value of 0 if parsing fails or the input is invalid.
// This function aims for robustness in handling various string inputs.
const parseNumericValueSafely = (inputString) => {
    // Attempt to convert the string to an integer with base 10.
    const parsedResult = Number.parseInt(inputString, 10);
    // Check if the parsing operation resulted in a valid number.
    // If it's NaN (Not a Number), return 0 as a fallback.
    return Number.isNaN(parsedResult) ? 0 : parsedResult;
};

/**
 * Retrieves the entire content from the standard input stream.
 * This is typically used in environments where input is provided via /dev/stdin.
 * Includes basic error handling for file system operations.
 * @returns {string} The full content read from standard input, or an empty string if an error occurs.
 */
function retrieveStandardInputContent() {
    try {
        // Dynamically require the 'fs' module for file system operations.
        const fileSystem = require("fs");
        // Read the file synchronously from the specified path, decoding as UTF-8.
        return fileSystem.readFileSync("/dev/stdin", "utf8");
    } catch (inputReadError) {
        // Log any errors encountered during the input reading process.
        console.error("Failed to read input from /dev/stdin:", inputReadError.message);
        // In case of an error, return an empty string to prevent further processing with invalid data.
        return "";
    }
}

/**
 * Orchestrates the generation and printing of a specific sequence of numbers.
 * The sequence starts with single digits (1-9), then progresses to numbers with one trailing '9' (19-99),
 * then two trailing '9's (199-999), and so forth.
 *
 * @param {string} rawProgramInput - The complete input received by the program, expected to contain
 *                                   the desired number of sequence items on its first line.
 */
function generateAndDisplayNumberSequence(rawProgramInput) {
    // Preliminary validation: Ensure the input content is not empty or just whitespace.
    if (!rawProgramInput || rawProgramInput.trim().length === 0) {
        console.error("Provided input is empty. Cannot generate sequence.");
        return; // Exit the function if input is invalid.
    }

    // Split the input into individual lines and extract the first line.
    const inputLinesArray = rawProgramInput.split('\n');
    const firstLineInput = inputLinesArray[0];

    // Convert the first line to an integer, which dictates how many numbers to generate.
    // Utilizing the robust `parseNumericValueSafely` utility.
    let totalItemsToGenerate = parseNumericValueSafely(firstLineInput);

    // Further validation: Ensure the parsed number of items is positive.
    if (totalItemsToGenerate <= 0) {
        console.error("The specified count for sequence generation must be a positive integer.");
        return; // Halt execution for invalid generation count.
    }

    // Initialize variables that control the generation logic:
    // `currentLeadingDigit` cycles from 1 to 9.
    let currentLeadingDigit = 1;
    // `currentSuffixNinesCount` tracks how many '9's should follow the leading digit.
    let currentSuffixNinesCount = 0;

    // Loop through the required number of generations.
    // The loop counter `sequenceIndex` goes from 0 up to `totalItemsToGenerate - 1`.
    for (let sequenceIndex = 0; sequenceIndex < totalItemsToGenerate; sequenceIndex++) {
        // Construct the number string for the current iteration.
        // Start by converting the current leading digit to a string.
        let constructedNumberString = String(currentLeadingDigit);

        // If `currentSuffixNinesCount` is greater than zero, append the necessary '9's.
        // This is done efficiently by creating an array of '9's and joining them.
        if (currentSuffixNinesCount > 0) {
            constructedNumberString += Array(currentSuffixNinesCount).fill('9').join('');
        }
        
        // Print the fully constructed number string to the console.
        console.log(constructedNumberString);

        // Logic to update the sequence generation state for the next iteration:
        // Increment the leading digit.
        currentLeadingDigit++;

        // If the leading digit has surpassed 9 (i.e., become 10),
        // reset it to 1 and increment the count of trailing '9's.
        if (currentLeadingDigit > 9) {
            currentLeadingDigit = 1; // Reset to the first digit.
            currentSuffixNinesCount++; // Add another '9' to the suffix.
        }
    }
    // The sequence generation is complete.
}

// The primary execution call:
// First, retrieve all necessary input from the standard input stream.
// Then, pass this raw input data to the main processing function.
generateAndDisplayNumberSequence(retrieveStandardInputContent());