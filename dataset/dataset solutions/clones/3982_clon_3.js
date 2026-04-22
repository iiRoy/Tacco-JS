function ProcessStreamData(sourceContent) {
    // Validate the incoming stream data to ensure it's a non-empty string.
    if (!sourceContent || typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
        console.error("Input data stream is invalid or empty. Cannot proceed with processing.");
        return; // Exit early if input is not suitable.
    }

    // Divide the entire content into individual line segments.
    // Using 'const' as this array won't be reassigned.
    const separatedLineStrings = sourceContent.split('\n');

    // Define the minimum number of lines expected for successful extraction.
    const minimumExpectedLines = 3;

    // Implement a guard clause to check if enough lines are present.
    if (separatedLineStrings.length < minimumExpectedLines) {
        console.error(`Insufficient input lines. Expected at least ${minimumExpectedLines}, but received ${separatedLineStrings.length}.`);
        return; // Terminate if the line count is inadequate.
    }

    // Extract the first three lines using array destructuring for clarity.
    // The 'restOfLines' variable captures any additional lines beyond the third, which are not used here.
    const [
        initialLineData,    // Corresponds to input[0]
        secondaryLineData,  // Corresponds to input[1]
        tertiaryLineData,   // Corresponds to input[2]
        ...excessLines      // Any lines beyond the first three are ignored
    ] = separatedLineStrings;

    // Convert each relevant line string into an array of its constituent characters.
    // Using Array.from() provides an alternative to String.prototype.split('') for character arrays.
    const charArrayForFirstLine = Array.from(initialLineData);
    const charArrayForSecondLine = Array.from(secondaryLineData);
    const charArrayForThirdLine = Array.from(tertiaryLineData);

    // Perform validation for character availability in each required line.
    // Ensure that the specific indices we plan to access actually exist.
    if (charArrayForFirstLine.length < 1 || charArrayForSecondLine.length < 2 || charArrayForThirdLine.length < 3) {
        console.error("One or more input lines lack the necessary characters for extraction at specified positions.");
        // Optionally, provide more specific error details:
        // console.error(`Line 1 has ${charArrayForFirstLine.length} chars (needs 1). Line 2 has ${charArrayForSecondLine.length} chars (needs 2). Line 3 has ${charArrayForThirdLine.length} chars (needs 3).`);
        return; // Exit if character requirements are not met.
    }

    // Extract the specific characters required from their respective arrays.
    // These are intermediate variables for improved readability.
    const firstExtractedChar = charArrayForFirstLine[0];   // The first character from the first line.
    const secondExtractedChar = charArrayForSecondLine[1]; // The second character from the second line.
    const thirdExtractedChar = charArrayForThirdLine[2];   // The third character from the third line.

    // Concatenate the extracted characters into a single result string.
    // Using template literals offers a clean way to build the final string.
    const finalComposedString = `${firstExtractedChar}${secondExtractedChar}${thirdExtractedChar}`;

    // Output the composed string to the console.
    console.log(finalComposedString);
}

// Define the standard input file path.
const standardInputSource = '/dev/stdin';

// Implement robust file reading with error handling using a try-catch block.
// This adds a layer of resilience to the external input mechanism.
try {
    // Synchronously read the entire content of the standard input file as UTF-8 text.
    const incomingFileContent = require('fs').readFileSync(standardInputSource, 'utf8');

    // Invoke the main processing function with the obtained file content.
    ProcessStreamData(incomingFileContent);
} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log a descriptive error message.
    console.error(`An error occurred while attempting to read from ${standardInputSource}: ${fileReadError.message}`);
}