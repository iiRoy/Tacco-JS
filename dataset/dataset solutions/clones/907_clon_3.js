// Global constants and variables for input processing and main logic.
let totalBracketSequencesCount = 0; // Stores the total number of bracket sequences to process.
const rawInputSequences = []; // Accumulates raw input bracket sequences as strings.
let analyzedBalanceMetrics = []; // Holds parsed metrics for each sequence: [requiredOpenAtStart, availableCloseAtEnd].

// A special marker value to denote that a sequence has already been successfully processed.
const SEQUENCE_PROCESSED_MARKER = [-999, -999];

/**
 * Computes the balance properties of a given bracket sequence.
 * It determines how many opening parentheses are needed at the beginning to balance
 * any premature closing parentheses, and how many closing parentheses are available
 * at the end after matching all possible internal pairs.
 *
 * @param {string} currentBracketString The bracket sequence string to be evaluated.
 * @returns {number[]} A pair `[neededOpens, availableCloses]`
 *                     - `neededOpens`: The count of '(' that would need to precede the string for full balance.
 *                     - `availableCloses`: The count of ')' that remain unmatched from the start of the string.
 */
function calculateBracketBalance(currentBracketString) {
    // Input validation: ensure the string is valid.
    if (typeof currentBracketString !== 'string' || currentBracketString.length === 0) {
        // For robustness, handle edge cases. An empty string has neutral balance.
        return [0, 0];
    }

    let requiredOpeningBrackets = 0; // Counts unmatched ')' that appear too early.
    let unmatchedClosingCapacity = 0; // Counts unmatched '(' that are still open.

    // Iterate through each character of the input string.
    for (let charIdx = 0; charIdx < currentBracketString.length; charIdx++) {
        const character = currentBracketString[charIdx];

        if (character === '(') {
            // An opening bracket increases the capacity for subsequent closing brackets.
            unmatchedClosingCapacity++;
        } else if (character === ')') {
            // A closing bracket.
            if (unmatchedClosingCapacity > 0) {
                // If there's an available open bracket, this one matches it.
                unmatchedClosingCapacity--;
            } else {
                // If no open bracket is available, this ')' is unmatched.
                // It signifies a need for an opening bracket before this point in the sequence.
                requiredOpeningBrackets++;
            }
        }
        // Any other characters are ignored, maintaining the original logic.
    }

    // Return the two balance components.
    return [requiredOpeningBrackets, unmatchedClosingCapacity];
}

/**
 * Orchestrates the main process: reading input, analyzing sequences, sorting them,
 * and then iteratively combining them to check if a fully balanced sequence can be formed.
 */
function initiateSequenceCombination() {
    // Read the total number of sequences from the pre-processed input.
    totalBracketSequencesCount = extractNextNumericValue();

    // Early exit for trivial or invalid cases.
    if (totalBracketSequencesCount <= 0) {
        outputFinalResult('No'); // Cannot form a balanced sequence from zero or negative inputs.
        return;
    }

    // Populate the array with all input bracket strings.
    for (let k = 0; k < totalBracketSequencesCount; k++) {
        rawInputSequences.push(extractNextStringValue());
    }

    // Analyze each raw sequence to derive its balance metrics.
    for (let k = 0; k < totalBracketSequencesCount; k++) {
        analyzedBalanceMetrics.push(calculateBracketBalance(rawInputSequences[k]));
    }

    // Sort the sequences based on a custom comparison logic.
    // The primary sorting key is (availableCloses - requiredOpens) in descending order,
    // prioritizing sequences that contribute more net closing brackets.
    // The secondary key is requiredOpens in descending order, for tie-breaking.
    analyzedBalanceMetrics.sort((metricItemA, metricItemB) => {
        const netBalanceA = metricItemA[1] - metricItemA[0]; // e.g., (close - open) for item A
        const netBalanceB = metricItemB[1] - metricItemB[0]; // e.g., (close - open) for item B

        // If net balances differ, sort by net balance in descending order.
        if (netBalanceA !== netBalanceB) {
            return netBalanceB - netBalanceA;
        }
        // If net balances are identical, sort by required opens in descending order.
        // This implicitly favors sequences that are "more open" at the start when net balance is equal.
        return metricItemB[0] - metricItemA[0];
    });

    let currentRunningBalance = 0; // Tracks the current count of open, unmatched brackets.
    let isOverallCombinationFeasible = true; // Flag to track if all sequences could be processed.

    // Attempt to process each sequence in the sorted order.
    // This outer loop ensures we make `totalBracketSequencesCount` attempts to incorporate a sequence.
    for (let attempt = 0; attempt < totalBracketSequencesCount; attempt++) {
        let wasAnySequenceAddedInThisAttempt = false; // Flag for current processing pass.

        // Inner loop: scan through available sequences to find one that can be added.
        for (let metricIndex = 0; metricIndex < totalBracketSequencesCount; metricIndex++) {
            const currentMetricPair = analyzedBalanceMetrics[metricIndex];

            // Only consider sequences that haven't been marked as processed.
            // A sequence can be added if the current running balance is sufficient to cover its required opening brackets.
            if (currentMetricPair !== SEQUENCE_PROCESSED_MARKER && currentRunningBalance >= currentMetricPair[0]) {
                // Incorporate the sequence: update the running balance.
                // The balance changes by (availableCloses - requiredOpens).
                currentRunningBalance += (currentMetricPair[1] - currentMetricPair[0]);

                // Mark this sequence as processed to prevent re-selection.
                analyzedBalanceMetrics[metricIndex] = SEQUENCE_PROCESSED_MARKER;

                wasAnySequenceAddedInThisAttempt = true;
                // Successfully processed one sequence; break the inner loop to re-evaluate
                // the remaining sequences with the new `currentRunningBalance`.
                break;
            }
        }

        // If no sequence could be processed in this pass, it means a valid combination is impossible.
        if (!wasAnySequenceAddedInThisAttempt) {
            isOverallCombinationFeasible = false;
            break; // Exit the outer loop prematurely.
        }
    }

    // The final result is 'Yes' only if all sequences were combined successfully
    // AND the final running balance is exactly zero (all brackets matched).
    const finalOutcomeMessage = (isOverallCombinationFeasible && currentRunningBalance === 0) ? 'Yes' : 'No';
    outputFinalResult(finalOutcomeMessage);
}

// --- Standard Input/Output Management ---

// Configure stdin to resume listening for input and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInputBuffer = ''; // Buffer to collect all incoming data chunks.
let currentReadPosition = 0; // Pointer to the current position in the split input array.

/**
 * Extracts and returns the next numeric value from the buffered input.
 * Includes basic error handling for non-numeric input.
 * @returns {number} The parsed numeric value.
 */
function extractNextNumericValue() {
    // Defensive check: ensure we don't read past the end of available input.
    if (currentReadPosition >= accumulatedInputBuffer.length) {
        console.error("Error: Attempted to read numeric value beyond available input. Returning 0.");
        return 0;
    }
    const parsedValue = Number(accumulatedInputBuffer[currentReadPosition++]);
    if (isNaN(parsedValue)) {
        console.error("Warning: Encountered non-numeric input where a number was expected. Returning 0.");
        return 0; // Fallback for invalid numeric input.
    }
    return parsedValue;
}

/**
 * Extracts and returns the next string value from the buffered input.
 * @returns {string} The next string value.
 */
function extractNextStringValue() {
    // Defensive check: ensure we don't read past the end of available input.
    if (currentReadPosition >= accumulatedInputBuffer.length) {
        console.error("Error: Attempted to read string value beyond available input. Returning empty string.");
        return ""; // Return an empty string or throw an error for invalid access.
    }
    return accumulatedInputBuffer[currentReadPosition++];
}

/**
 * Prints the provided message to the console, effectively displaying the program's result.
 * @param {string} messageToDisplay The string message to be logged.
 */
function outputFinalResult(messageToDisplay) {
    console.log(messageToDisplay);
}

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', (inputChunk) => {
    accumulatedInputBuffer += inputChunk;
});

// Event listener for the 'end' of the stdin stream.
process.stdin.on('end', () => {
    // Once all input is received, process it: trim whitespace and split into an array by whitespace.
    accumulatedInputBuffer = accumulatedInputBuffer.trim().split(/\s+/);
    // Then, kick off the main processing logic.
    initiateSequenceCombination();
});