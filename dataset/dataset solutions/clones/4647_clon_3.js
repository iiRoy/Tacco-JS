// Function to display the final processed string to the console.
const displayOutputMessage = (finalString) => {
    console.log(finalString);
};

// Helper function to interleave two strings character by character.
// It takes two string arguments and returns a new string formed by alternating their characters.
// The interleaving stops at the length of the shorter string.
function interleaveStrings(firstSource, secondSource) {
    const collectedCharacters = [];
    const commonLength = Math.min(firstSource.length, secondSource.length); // Ensure we don't go out of bounds for shorter string

    for (let currentPosition = 0; currentPosition < commonLength; currentPosition++) {
        collectedCharacters.push(firstSource.charAt(currentPosition)); // Using charAt for variety
        collectedCharacters.push(secondSource.charAt(currentPosition));
    }

    return collectedCharacters.join('');
}

// Main entry point for processing the external data.
function orchestrateDataProcessing(externalContent) {
    // Validate the incoming content to ensure it's a string and not empty.
    if (typeof externalContent !== 'string' || externalContent.trim() === '') {
        displayOutputMessage("Error: Input content is invalid or empty.");
        return; // Exit early if content is not suitable.
    }

    // Split the raw content into individual lines.
    const contentLines = externalContent.split('\n');

    // Ensure we have at least two lines for interleaving.
    if (contentLines.length < 2) {
        displayOutputMessage("Error: Insufficient lines for interleaving. Expected at least two lines.");
        return; // Exit early if not enough lines.
    }

    const firstLineSegment = contentLines[0];
    const secondLineSegment = contentLines[1];

    // Perform the core interleaving operation using a dedicated helper.
    const resultingInterleavedText = interleaveStrings(firstLineSegment, secondLineSegment);

    // Output the final generated text.
    displayOutputMessage(resultingInterleavedText);
}

// --- Application Execution Start ---
// Standard library for file system operations.
const fileSystemInterface = require("fs");
// Define the path for reading standard input.
const standardInputResource = "/dev/stdin";
// Specify the character encoding for reading the file.
const textEncodingStandard = "utf8";

let rawSystemInput = '';
try {
    // Synchronously read the entire content from the specified input source.
    rawSystemInput = fileSystemInterface.readFileSync(standardInputResource, textEncodingStandard).trim();
} catch (readError) {
    // Handle potential errors during file reading.
    console.error(`Failed to read input from ${standardInputResource}:`, readError.message);
    process.exit(1); // Terminate with an error code.
}

// Initiate the data processing pipeline with the obtained input.
orchestrateDataProcessing(rawSystemInput);