// This module processes a series of numerical inputs from standard input.
// For each input value, it generates a specific numerical sequence
// and then computes and displays the sum of that sequence.

// Define constants for configuration and clarity.
const SYSTEM_INPUT_DEVICE_PATH = '/dev/stdin'; // Path to read input data from.
const SEQUENCE_UPPER_BOUND_INDEX = 10; // The maximum index for sequence generation.
const OUTPUT_DECIMAL_PRECISION = 8; // Number of decimal places for the final sum.

/**
 * Safely retrieves raw textual data from a specified file path.
 * Includes basic error handling for file operations.
 * @param {string} sourceFileLocation - The path to the input file.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
function obtainFileContent(sourceFileLocation) {
    // Dynamically import the 'fs' module.
    const fileSystemModule = require('fs');
    try {
        // Read the entire file synchronously using UTF-8 encoding.
        return fileSystemModule.readFileSync(sourceFileLocation, 'utf8');
    } catch (readError) {
        // Log any errors encountered during file reading.
        console.error("Error encountered while attempting to read input data:", readError.message);
        return ""; // Return an empty string to indicate failure or no content.
    }
}

// --- Main Program Execution Flow ---

// Step 1: Acquire the raw text data from the standard input path.
let rawStreamData = obtainFileContent(SYSTEM_INPUT_DEVICE_PATH);

// Step 2: Parse the raw text into an array of numbers.
// This involves cleaning whitespace, splitting by lines, and converting to numeric types.
let numericalDataEntries = [];

// Implement a guard clause to prevent processing empty or whitespace-only input.
if (rawStreamData && rawStreamData.trim().length > 0) {
    numericalDataEntries = rawStreamData
                            .trim() // Remove leading/trailing whitespace from the entire input.
                            .split('\n') // Break the string into an array of lines.
                            // Filter out any lines that are empty after splitting.
                            .filter(singleLine => singleLine.length > 0)
                            // Convert each valid line string into a floating-point number.
                            .map(singleLine => parseFloat(singleLine));
} else {
    // If no valid input is detected, issue a warning and skip further processing.
    console.warn("Input stream appears to be empty or contains only whitespace. No calculations will be performed.");
    // An empty numericalDataEntries array will naturally lead to no loop iterations below.
}

// Step 3: Process each individual numeric entry.
// A traditional for loop provides explicit control over iteration.
for (let currentEntryIndex = 0; currentEntryIndex < numericalDataEntries.length; currentEntryIndex++) {
    const primaryInputTerm = numericalDataEntries[currentEntryIndex];

    // Initialize an array to store the generated sequence terms.
    // Pre-allocate and fill with zeros for predictable behavior and type consistency (floats).
    let dynamicSequence = new Array(SEQUENCE_UPPER_BOUND_INDEX + 1).fill(0.0);
    // Assign the primary input term to the second position (index 1) of the sequence.
    dynamicSequence[1] = primaryInputTerm;

    // Step 3.1: Generate the subsequent terms of the sequence.
    // The sequence generation loop starts from the third term (index 2).
    for (let termPosition = 2; termPosition <= SEQUENCE_UPPER_BOUND_INDEX; termPosition++) {
        const precedingTermValue = dynamicSequence[termPosition - 1]; // Store the previous term in a temporary variable.
        const isCurrentPositionEven = (termPosition % 2 === 0); // Determine if the current index is even.

        if (isCurrentPositionEven) {
            // For even indices, multiply the previous term by two.
            dynamicSequence[termPosition] = precedingTermValue * 2.0; // Explicit float multiplication.
        } else {
            // For odd indices, divide the previous term by three.
            dynamicSequence[termPosition] = precedingTermValue / 3.0; // Explicit float division.
        }
    }

    // Step 3.2: Calculate the total sum of all elements within the generated sequence.
    let cumulativeSequenceTotal = 0.0; // Initialize sum as a float.
    // Utilize a 'for...of' loop for clear iteration over array elements.
    for (const sequenceElement of dynamicSequence) {
        cumulativeSequenceTotal += sequenceElement;
    }

    // Step 3.3: Output the calculated sum, formatted to the specified decimal precision.
    // Include a validation check to ensure the sum is a valid number before formatting.
    if (typeof cumulativeSequenceTotal === 'number' && !isNaN(cumulativeSequenceTotal)) {
        console.log(cumulativeSequenceTotal.toFixed(OUTPUT_DECIMAL_PRECISION));
    } else {
        // Log an error if the sum is not a valid number, indicating a potential issue.
        console.error("Error: The computed sum is not a valid number for initial term:", primaryInputTerm);
    }
}