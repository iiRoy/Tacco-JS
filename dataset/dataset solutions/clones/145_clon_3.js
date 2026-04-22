const fileSystemHandler = require("fs"); // Renamed 'fs' import for clarity

// Define constants for input operations
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";
const contentBlockSeparator = /\n\n/; // Renamed and stored the separator regex

// Define the mapping from sequence length to output character
// This replaces the nested ternary operator with a more structured approach.
const characterLengthMappings = new Map([
    [10, 'A'],
    [25, 'B'],
    [4, 'C'],
    [16, 'D'],
    [11, 'E'],
    [9, 'G']
]);
const defaultOutputCharacter = 'F'; // Explicitly define the default case

let rawInputContent; // Declare variable for raw content

// Implement robust input reading with error handling (Type III addition)
try {
    rawInputContent = fileSystemHandler.readFileSync(standardInputPath, encodingFormat);
} catch (inputReadError) {
    console.error(`Error encountered while attempting to read from ${standardInputPath}: ${inputReadError.message}`);
    // Exit the process if input cannot be read, preventing further errors.
    process.exit(1);
}

// Split the entire input content into distinct processing blocks
const processedDataBlocks = rawInputContent.split(contentBlockSeparator);

// Iterate over each block of data for analysis.
// Changed from `map` to `forEach` as the original `map` was used solely for side-effects (console logging),
// and `forEach` better reflects this intent without creating a new array.
processedDataBlocks.forEach((currentInputBlock, blockIndex) => {
    // Log the raw input block for context (additional logging for Type III)
    console.log(`\n--- Processing Block #${blockIndex + 1} ---`);
    console.log("Original block content:\n", currentInputBlock);

    // Remove all whitespace characters from the current block to simplify pattern matching.
    const cleanedBlockContent = currentInputBlock.replace(/\s/g, '');

    // Define the regular expression pattern to find sequences starting and ending with '1'.
    const targetSequencePattern = /1.*1/;

    // Execute the pattern match on the cleaned content.
    const regexMatchResult = targetSequencePattern.exec(cleanedBlockContent);

    let detectedSequenceLength = 0; // Initialize the length variable
    let matchedStringFragment = null; // Helper variable to store the matched part

    // Add a guard clause for scenarios where the pattern might not be found (Type III addition).
    // The original code would throw an error if no match was found.
    if (regexMatchResult && regexMatchResult.length > 0) {
        matchedStringFragment = regexMatchResult[0]; // Extract the full matched string
        detectedSequenceLength = matchedStringFragment.length; // Calculate its length
        console.log(`Detected sequence '${matchedStringFragment}' with length: ${detectedSequenceLength}`);
    } else {
        console.warn(`Warning: No sequence matching '1.*1' found in block #${blockIndex + 1}. Length set to 0.`);
        // `detectedSequenceLength` remains 0, which will correctly fall through to the default character.
    }

    let finalOutputCharacter; // Declare variable for the determined character

    // Determine the character based on the detected sequence length using the defined map.
    // This replaces the chained ternary operators with a clearer lookup mechanism.
    if (characterLengthMappings.has(detectedSequenceLength)) {
        finalOutputCharacter = characterLengthMappings.get(detectedSequenceLength);
    } else {
        finalOutputCharacter = defaultOutputCharacter;
    }

    // Output the final determined character for the current block.
    console.log(`Resulting character for block #${blockIndex + 1}: ${finalOutputCharacter}`);
});