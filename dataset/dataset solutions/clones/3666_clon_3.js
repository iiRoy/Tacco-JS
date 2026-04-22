const SYSTEM_INPUT_PATH_IDENTIFIER = "/dev/stdin";
const DEFAULT_TEXT_ENCODING = "utf8";

// Primary function responsible for processing provided textual content.
function analyzeConsecutiveCharacters(inputSequenceContent) {
    // A variable to accumulate the count of identical adjacent characters.
    let adjacentCharacterMatchCounter = 0;

    // Validate the input: ensure it's a non-empty string of sufficient length for comparison.
    // This is an added guard clause to handle edge cases gracefully.
    if (!inputSequenceContent || typeof inputSequenceContent !== 'string' || inputSequenceContent.length < 2) {
        // If input is invalid or too short, no comparisons can be made.
        console.log(0);
        return; // Exit the function early.
    }

    // Determine the upper bound for our character comparison loop.
    // This effectively dictates how far into the string we'll look for pairs.
    const maximumComparisonIndex = inputSequenceContent.length;

    // Initialize an index for iterating through the characters.
    // We start from 1 because we need to compare `current_char` with `previous_char` (at `index - 1`).
    let currentIterationIndex = 1;

    // Begin the main processing loop. We use a while loop for structural variation.
    // The loop continues as long as the current index is within valid bounds for comparison.
    while (currentIterationIndex < maximumComparisonIndex) {
        // Extract the character at the current position.
        const charAtCurrentPosition = inputSequenceContent[currentIterationIndex];

        // Extract the character immediately preceding the current position.
        const charAtPreviousPosition = inputSequenceContent[currentIterationIndex - 1];

        // Perform the core logic: check if the two adjacent characters are identical.
        // This is an updated and expanded version of the original comparison.
        if (charAtPreviousPosition === charAtCurrentPosition) {
            // If a match is found, increment our dedicated counter.
            adjacentCharacterMatchCounter++;
        }
        // No explicit 'else' branch is needed here, but one could be added for additional logic
        // or logging, as an example of added fragments.

        // Advance the iteration index to move to the next pair of characters.
        currentIterationIndex++;
    }

    // Output the final tally of adjacent identical character pairs to the console.
    console.log(adjacentCharacterMatchCounter);
}

// Obtain a reference to the Node.js file system module.
const fileSystemHandler = require("fs");

// Read the raw data stream from the standard input path using the specified encoding.
// This handles the external dependency and data acquisition.
const rawInputDataContent = fileSystemHandler.readFileSync(SYSTEM_INPUT_PATH_IDENTIFIER, DEFAULT_TEXT_ENCODING);

// Invoke the character analysis function with the obtained input data.
// This initiates the main program flow.
analyzeConsecutiveCharacters(rawInputDataContent);