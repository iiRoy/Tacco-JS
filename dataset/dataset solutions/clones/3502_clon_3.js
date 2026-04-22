/*
 * This module is responsible for processing an input string provided to it.
 * Its core functionality involves performing a specific character-level transformation
 * on a subset of the input data and then assembling the modified characters
 * into a new output string.
 */
function ProcessInputString(rawStringData) {

    // A private, internal mapping structure to define the character transformation rules.
    // This makes the transformation logic easily configurable and explicit.
    const transformationRulesRegistry = new Map([
        // If the character is '1', it should be replaced with '9'.
        ['1', '9'],
        // If the character is '9', it should be replaced with '1'.
        ['9', '1']
        // Other characters are implicitly handled by not being in this map.
    ]);

    /**
     * Applies a predefined character swapping logic to a single character.
     * This function serves as a utility for the main processing flow.
     *
     * @param {string} incomingCharacter - The single character to be evaluated and potentially transformed.
     * @returns {string} The transformed character, or the original character if no rule applies.
     */
    function applyCharacterTransformation(incomingCharacter) {
        // Perform a quick type and length check for robustness, though array indexing often yields single chars.
        // This is a Type III addition for increased resilience.
        if (typeof incomingCharacter !== 'string' || incomingCharacter.length !== 1) {
            // For invalid input, we'll simply return the original character,
            // or one could throw an error for stricter validation.
            return incomingCharacter;
        }

        // Attempt to retrieve a transformed value from our registry.
        const mappedResult = transformationRulesRegistry.get(incomingCharacter);

        // If a mapping exists (i.e., 'mappedResult' is not undefined), return it.
        // Otherwise, return the original character without modification.
        if (mappedResult !== undefined) {
            return mappedResult;
        } else {
            return incomingCharacter;
        }
    }

    // --- Primary Data Processing Routine ---

    // An array to store the results of each character's transformation.
    // This allows for building the output string incrementally.
    const individualProcessedCharacters = [];

    // Define the expected number of characters to process from the input.
    // This constant adds clarity and flexibility for future modifications.
    const numberOfInputSegmentsToProcess = 3;

    // Implement a pre-check (guard clause) for the integrity of the input string.
    // This prevents potential errors if the input is null, not a string, or shorter than expected.
    // This is a significant Type III structural addition.
    if (rawStringData === null || typeof rawStringData !== 'string' || rawStringData.length < numberOfInputSegmentsToProcess) {
        console.error("Input data is invalid or insufficient. Expected a string of at least " + numberOfInputSegmentsToProcess + " characters.");
        // In such a case, it's safer to return an empty string or a specific error indicator.
        return "";
    }

    // Iterate through the first 'numberOfInputSegmentsToProcess' characters of the input string.
    // This loop replaces the explicit `input[0]`, `input[1]`, `input[2]` calls,
    // making the code more scalable and readable (Type III structural change).
    for (let currentSegmentIndex = 0; currentSegmentIndex < numberOfInputSegmentsToProcess; currentSegmentIndex++) {
        // Extract the character at the current index.
        const currentSegmentCharacter = rawStringData[currentSegmentIndex];

        // Apply the character transformation logic to the extracted character.
        const transformedSegment = applyCharacterTransformation(currentSegmentCharacter);

        // Add the transformed character to our collection.
        individualProcessedCharacters.push(transformedSegment);
    }

    // Concatenate all the processed characters into a single output string.
    // The `join('')` method is an efficient way to achieve this from an array.
    const finalComposedOutputString = individualProcessedCharacters.join('');

    // Deliver the fully processed string.
    return finalComposedOutputString;
}

// --- Execution Environment Emulation ---

// Define the source for reading input, typically the file system module.
const fileSystemUtility = require("fs");

// Specify the standard input path as per common Unix conventions.
const standardInputPath = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// The encoding is specified to ensure proper string interpretation.
const rawInputContent = fileSystemUtility.readFileSync(standardInputPath, "utf8");

// Pass the raw content to our main processing function.
// The result will be the transformed string.
const processedResult = ProcessInputString(rawInputContent);

// Write the final processed result to standard output.
// A newline character is appended for typical console output formatting.
process.stdout.write(processedResult + '\n');