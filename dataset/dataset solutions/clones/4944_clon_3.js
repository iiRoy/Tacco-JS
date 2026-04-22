// This module is designed to process a sequence of characters,
// specifically 'S' and 'T' symbols, applying a reduction logic
// akin to a stack operation where 'T' can cancel out a preceding 'S'.
// The ultimate goal is to determine the total count of symbols that
// remain unmatched after the entire sequence has been analyzed.

/**
 * Enumerates the distinct character tokens recognized by the processing logic.
 * Using an object for tokens provides better readability and maintainability
 * compared to raw string literals throughout the code.
 * @readonly
 * @enum {string}
 */
const SequenceTokens = Object.freeze({
    INITIATOR: 'S', // Represents a 'start' or 'opening' element in the sequence.
    TERMINATOR: 'T'  // Represents an 'end' or 'closing' element, potentially canceling an initiator.
});

/**
 * Executes a symbolic reduction algorithm on an input string.
 * This function processes each character, maintaining an internal collection
 * where 'INITIATOR' tokens are added, and 'TERMINATOR' tokens attempt to
 * remove a matching 'INITIATOR'. If no match is found, 'TERMINATOR' tokens
 * are added to the collection as well.
 *
 * @param {string} sourceString The raw string containing the sequence of symbols to be processed.
 * @returns {number} The final count of symbols remaining in the internal collection
 *                   after all reduction rules have been applied. Returns 0 for invalid
 *                   or empty input.
 */
function performSymbolicReduction(sourceString) {
    // Initial validation: Ensure the input is a string.
    if (typeof sourceString !== 'string') {
        // In a production system, this might throw an error or log a more severe message.
        // For this context, returning 0 is a safe default.
        console.warn("Input provided to performSymbolicReduction was not a string. Received:", typeof sourceString);
        return 0;
    }

    // Early exit for empty or non-existent input strings.
    if (!sourceString || sourceString.length === 0) {
        // console.info("Empty or null string provided for reduction. No processing required.");
        return 0;
    }

    // This array serves as our dynamic stack, accumulating symbols that haven't been canceled.
    let resultantCollection = [];

    // Convert the input string into an array of characters for straightforward iteration.
    const individualSymbols = Array.from(sourceString);

    // Iterate over each character in the prepared array.
    // A standard 'for' loop offers clear indexing if needed for debugging or complex logic.
    for (let currentPosition = 0; currentPosition < individualSymbols.length; currentPosition++) {
        const activeSymbol = individualSymbols[currentPosition]; // Extract the symbol at the current index.

        // Determine the appropriate action based on the active symbol.
        if (activeSymbol === SequenceTokens.INITIATOR) {
            // If the symbol is an 'S', simply add it to our collection.
            resultantCollection.push(SequenceTokens.INITIATOR);
        } else if (activeSymbol === SequenceTokens.TERMINATOR) {
            // If the symbol is a 'T', we check for a potential cancellation.
            const currentCollectionSize = resultantCollection.length;
            // Peek at the last element to see if it's an 'S'.
            const lastElementInCollection = currentCollectionSize > 0
                ? resultantCollection[currentCollectionSize - 1]
                : null;

            if (lastElementInCollection === SequenceTokens.INITIATOR) {
                // If an 'S' was the last element, 'T' cancels it out by removing it.
                resultantCollection.pop();
            } else {
                // If no 'S' to cancel (or collection is empty), 'T' is added to the collection.
                resultantCollection.push(SequenceTokens.TERMINATOR);
            }
        } else {
            // Optional: Handle any characters that are not 'S' or 'T'.
            // For this specific problem, such characters are typically ignored and do not affect the result.
            // console.debug(`Ignoring unrecognized symbol '${activeSymbol}' at index ${currentPosition}.`);
        }
    }

    // The final length of the collection represents the count of unmatched symbols.
    return resultantCollection.length;
}

// --- Execution Entry Point ---
// The original code reads from '/dev/stdin'. This section emulates that behavior
// by reading the content of a file (or stdin in a compatible environment)
// and then passing it to our refactored processing function.

// This line assumes the environment supports Node.js 'fs' module
// and that '/dev/stdin' is a valid path to read input from.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the core processing function with the obtained input.
const finalUnmatchedCount = performSymbolicReduction(rawInputContent);

// Output the calculated count to the console, matching the original program's final action.
console.log(finalUnmatchedCount);