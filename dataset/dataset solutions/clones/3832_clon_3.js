const inputBuffer = []; // Stores all lines read from standard input.
const inputReaderModule = require('readline'); // Import the standard readline module.

// Configure the interface for reading lines.
const lineProcessor = inputReaderModule.createInterface({
    input: process.stdin,  // Standard input stream.
    output: process.stdout // Standard output stream (though not used for direct output here).
});

/**
 * Event handler for each line received from standard input.
 * Appends the current line content to our buffer.
 * @param {string} currentLineContent - The text of the line just read.
 */
lineProcessor.on('line', (currentLineContent) => {
    inputBuffer.push(currentLineContent);
});

/**
 * Helper function to output the final result to console.
 * Can be extended for more complex logging or output formatting.
 * @param {string | undefined} finalResult - The string to be printed.
 */
const emitFinalResult = (finalResult) => {
    if (finalResult !== undefined) {
        console.log(finalResult);
    } else {
        console.error("Error: Could not determine the K-th unique substring.");
    }
};

/**
 * Event handler for when the input stream is closed.
 * This is where the core logic of the program executes.
 */
lineProcessor.on('close', () => {
    // Ensure we have at least two lines of input.
    if (inputBuffer.length < 2) {
        emitFinalResult("Input error: Not enough lines provided.");
        return;
    }

    // Extract the primary string from the first input line.
    const mainInputString = inputBuffer[0];
    // Parse the target index from the second input line.
    // Subtract 1 to convert from 1-indexed (problem statement) to 0-indexed (array access).
    const desiredIndex = parseInt(inputBuffer[1], 10);

    // Validate the parsed index.
    if (isNaN(desiredIndex) || desiredIndex < 1) {
        emitFinalResult("Input error: Invalid or non-positive target index.");
        return;
    }

    // Collection to store all generated substrings (initially with duplicates).
    const allGeneratedSubstrings = [];

    // --- Substring Generation Logic ---
    // Iterate through all possible starting positions for a substring.
    for (let currentStart = 0; currentStart < mainInputString.length; ++currentStart) {
        // For each starting position, iterate through all possible ending positions.
        // The end position is inclusive for substring extraction.
        for (let currentEnd = currentStart; currentEnd < mainInputString.length; ++currentEnd) {
            // Extract the substring using standard string slicing.
            const extractedFragment = mainInputString.substring(currentStart, currentEnd + 1);
            allGeneratedSubstrings.push(extractedFragment);
        }
    }

    // --- Uniqueness and Sorting ---
    // Use a Set to efficiently remove duplicate substrings.
    const uniqueSubstringsSet = new Set(allGeneratedSubstrings);
    // Convert the Set back to an Array.
    let sortedUniqueSubstrings = Array.from(uniqueSubstringsSet);

    // Sort the unique substrings lexicographically (alphabetically).
    sortedUniqueSubstrings.sort();

    // --- Final Result Determination ---
    // Check if the desired index is within the bounds of the sorted unique substrings.
    const actualIndexToRetrieve = desiredIndex - 1; // Convert 1-based K to 0-based array index.
    if (actualIndexToRetrieve >= 0 && actualIndexToRetrieve < sortedUniqueSubstrings.length) {
        // Retrieve and output the K-th (desiredIndex) unique substring.
        emitFinalResult(sortedUniqueSubstrings[actualIndexToRetrieve]);
    } else {
        // Handle cases where K is out of bounds.
        emitFinalResult("Error: Target index is out of range for the generated substrings.");
    }
});