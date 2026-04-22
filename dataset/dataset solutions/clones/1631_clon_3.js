// This module defines a character sequence sorting utility.
// Its primary function is to rearrange a sequence of 'R' (Red) and 'W' (White)
// characters such that all 'R's precede all 'W's, by performing minimal swaps.

/**
 * Initiates the character sorting process by reading input from stdin,
 * executing the sorting algorithm, and printing the final swap count to stdout.
 * Includes basic error handling for robust execution.
 */
function executeSortingProcess() {
    try {
        // Read the entire standard input, decode as UTF-8, and trim whitespace.
        const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

        // Process the input and obtain the total number of necessary character exchanges.
        const totalExchangeCount = performCharacterSorting(rawInputData);

        // Output the final count to the console.
        console.log(totalExchangeCount);
    } catch (operationError) {
        // Catch and log any errors that occur during file reading or processing.
        console.error("An operational error was encountered:", operationError.message);
        // Terminate the process with an error code to signal failure.
        process.exit(1);
    }
}

/**
 * Core function to sort a sequence of 'R' and 'W' characters.
 * It takes a raw input string, parses it, and then iteratively
 * swaps the leftmost 'W' with the rightmost 'R' until the sequence is sorted.
 *
 * @param {string} rawInputString - The input string containing sequence length and the character sequence.
 * @returns {number} The total count of swap operations performed to sort the sequence.
 */
function performCharacterSorting(rawInputString) {
    // Split the input string into individual lines.
    const inputSegments = rawInputString.split('\n');

    // The first line typically contains the expected length of the character sequence.
    // We parse it, but the actual length of the sequence itself is often more reliable.
    const declaredSequenceLength = parseInt(inputSegments[0], 10);

    // Initialize the primary mutable array for character manipulation.
    let currentCharacterArrangement = inputSegments[1].split('');

    // A counter to keep track of how many swaps are performed.
    let characterSwapTally = 0;

    // Optional validation: Check if the declared length matches the actual length.
    if (isNaN(declaredSequenceLength) || declaredSequenceLength <= 0) {
        console.warn("Input Warning: Declared sequence length is invalid or missing. Proceeding with actual detected length.");
    } else if (declaredSequenceLength !== currentCharacterArrangement.length) {
        console.warn(`Input Warning: Declared sequence length (${declaredSequenceLength}) does not match actual sequence length (${currentCharacterArrangement.length}). Using actual length for processing.`);
    }

    // The main sorting loop: continues as long as there are 'W's followed by 'R's.
    // This condition signifies that the sequence is not yet sorted.
    while (true) {
        // Identify all positions where a 'W' is immediately followed by an 'R'.
        // These are the "disordered" segments that need correction.
        const problematicIndices = locateAdjacentDisorder(currentCharacterArrangement);

        // If no such 'WR' pairs are found, the sequence is perfectly sorted.
        if (problematicIndices.length === 0) {
            break; // Exit the sorting loop.
        }

        // Find the index of the first 'W' from the beginning of the array.
        const leftmostWhitePosition = findCharacterOccurrence(currentCharacterArrangement, 'W', true);
        // Find the index of the last 'R' from the end of the array.
        const rightmostRedPosition = findCharacterOccurrence(currentCharacterArrangement, 'R', false);

        // A sanity check: if disorder is detected, but we can't find a 'W' or 'R' to swap,
        // it indicates a logical flaw or an unexpected state.
        if (leftmostWhitePosition === -1 || rightmostRedPosition === -1) {
            console.error("Algorithm Error: Disorder detected, but no 'W' or 'R' available for swap. Terminating.");
            break;
        }

        // Perform the swap operation:
        // Move the character at the leftmost 'W' position to a temporary holder.
        const temporaryCharacterHolder = currentCharacterArrangement[leftmostWhitePosition];
        // Place the character from the rightmost 'R' position into the leftmost 'W' slot.
        currentCharacterArrangement[leftmostWhitePosition] = currentCharacterArrangement[rightmostRedPosition];
        // Place the character from the temporary holder (the original 'W') into the rightmost 'R' slot.
        currentCharacterArrangement[rightmostRedPosition] = temporaryCharacterHolder;

        // Increment the counter for successful swap operations.
        characterSwapTally++;
    }

    // Return the total number of swaps performed.
    return characterSwapTally;
}

/**
 * Scans a character sequence to identify all indices where a 'W' character
 * is immediately followed by an 'R' character. These are indicators of an unsorted state.
 *
 * @param {Array<string>} charSequence - The array of characters to scan.
 * @returns {Array<number>} An array of indices where 'W' is followed by 'R'.
 */
function locateAdjacentDisorder(charSequence) {
    const detectedMismatchLocations = [];
    // Iterate through the sequence, checking pairs of adjacent characters.
    // The loop goes up to `length - 1` to ensure `currentPosition + 1` is always valid.
    for (let currentPosition = 0; currentPosition < charSequence.length - 1; currentPosition++) {
        // If a 'W' is found directly before an 'R', record its starting index.
        if (charSequence[currentPosition] === 'W' && charSequence[currentPosition + 1] === 'R') {
            detectedMismatchLocations.push(currentPosition);
        }
    }
    return detectedMismatchLocations;
}

/**
 * Searches for the first or last occurrence of a specified character within a sequence.
 *
 * @param {Array<string>} charSequence - The array of characters to search within.
 * @param {string} searchTarget - The character to find ('R' or 'W').
 * @param {boolean} findFirst - If true, finds the first occurrence; if false, finds the last.
 * @returns {number} The index of the found character, or -1 if the character is not present.
 */
function findCharacterOccurrence(charSequence, searchTarget, findFirst) {
    if (findFirst) {
        // Search from the beginning of the array.
        for (let elementIndex = 0; elementIndex < charSequence.length; elementIndex++) {
            if (charSequence[elementIndex] === searchTarget) {
                return elementIndex;
            }
        }
    } else {
        // Search from the end of the array (backwards).
        for (let elementIndex = charSequence.length - 1; elementIndex >= 0; elementIndex--) {
            if (charSequence[elementIndex] === searchTarget) {
                return elementIndex;
            }
        }
    }
    return -1; // Return -1 if the target character is not found.
}

// Execute the main sorting process when this script is run.
executeSortingProcess();