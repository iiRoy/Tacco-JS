// This script evaluates a provided string to calculate a specific numerical outcome.
function processInputData(sourceSequence) {
    // Define constants to enhance readability and maintainability.
    const TARGET_CHARACTER = 'o';             // The character that triggers a point increment.
    const POINTS_INCREMENT = 100;             // The value added for each matching character.
    const BASE_SCORE_OFFSET = 700;            // An initial score component added at the end.
    const PROCESSING_CHAR_COUNT = 3;          // The fixed number of characters to inspect from the start.

    // Initialize a mutable variable to accumulate points based on character matches.
    let accumulatedValue = 0;

    // Perform a preliminary check on the input data's validity and length.
    // This guard clause ensures robust processing and prevents potential errors.
    if (!sourceSequence || typeof sourceSequence !== 'string' || sourceSequence.length < 1) {
        // If the input is invalid or empty, the accumulatedValue will remain 0,
        // and only the BASE_SCORE_OFFSET will be applied.
        // This handles cases where input might be null, undefined, or not a string.
        // For debugging, one might add: console.warn("Input string too short or invalid.");
    }

    // Iterate through a fixed initial segment of the input string.
    // The loop's boundary is determined by PROCESSING_CHAR_COUNT, not the full string length.
    for (let iterationIndex = 0; iterationIndex < PROCESSING_CHAR_COUNT; iterationIndex++) {
        // Safely access characters, ensuring we don't go out of bounds for shorter strings.
        if (iterationIndex < sourceSequence.length) {
            const currentCharacter = sourceSequence[iterationIndex];

            // Check if the current character matches the predefined target character.
            if (currentCharacter === TARGET_CHARACTER) {
                // If a match is found, add the specified increment to the accumulated value.
                accumulatedValue += POINTS_INCREMENT;
            }
        } else {
            // If the string is shorter than the PROCESSING_CHAR_COUNT,
            // there are no more characters to evaluate, so break the loop early.
            break;
        }
    }

    // Compute the final result by adding the base score offset to the accumulated points.
    const finalComputedResult = accumulatedValue + BASE_SCORE_OFFSET;

    // Display the final calculated numerical result to standard output.
    console.log(finalComputedResult);
}

// Do not modify the following lines. This section handles standard input/output
// by reading data from stdin and passing it to the primary processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));