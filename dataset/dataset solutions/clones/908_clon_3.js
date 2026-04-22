let totalStringCount;
let inputStringCollection = [];
let processedBalancePairs = []; // Stores [unmatched_closing, unmatched_opening] for each string

/**
 * Analyzes a string to determine the count of unmatched opening and closing brackets.
 *
 * @param {string} expressionText The input string containing parentheses.
 * @returns {number[]} An array where the first element is the count of unmatched closing brackets
 *                     that must be provided *before* this string, and the second element is the
 *                     count of unmatched opening brackets that this string provides.
 */
function analyzeBracketBalance(expressionText) {
    // Initial balance state: [required_closing_brackets, provided_opening_brackets]
    let balanceState = [0, 0]; // [countOfNeededOpeners, countOfExcessOpeners]

    // Iterate through each character of the expression
    for (let charIndex = 0; charIndex < expressionText.length; ++charIndex) {
        const currentChar = expressionText.charAt(charIndex);

        if (currentChar === '(') {
            // Found an opening bracket, increment the count of excess openers
            balanceState[1]++;
        } else if (currentChar === ')') {
            // Found a closing bracket
            if (balanceState[1] > 0) {
                // If there are excess openers, this closing bracket matches one
                balanceState[1]--;
            } else {
                // No excess openers to match, so this closing bracket is unmatched
                // and requires an opening bracket to be provided *before* this string.
                balanceState[0]++;
            }
        }
    }
    return balanceState;
}

/**
 * Custom comparison function for sorting bracket balance pairs.
 * It prioritizes strings that require fewer initial opening brackets (or provide more).
 * If both require closing brackets (net negative balance), it sorts by the number of
 * required closing brackets in descending order. Otherwise, it sorts by net balance
 * (provided_opening - required_closing) in descending order.
 *
 * @param {number[]} pairA The first balance pair [required_closing, provided_opening].
 * @param {number[]} pairB The second balance pair [required_closing, provided_opening].
 * @returns {number} A negative, zero, or positive value indicating sort order.
 */
const compareBalancePairs = (pairA, pairB) => {
    // Calculate net balance for each pair: (provided_opening - required_closing)
    const netBalanceA = pairA[1] - pairA[0];
    const netBalanceB = pairB[1] - pairB[0];

    // If both pairs have a negative net balance (i.e., they both require more closing brackets than opening)
    if (netBalanceA < 0 && netBalanceB < 0) {
        // Sort in descending order of required closing brackets (pair[0])
        // This means pairs requiring MORE initial closing brackets come first.
        return pairB[0] - pairA[0];
    }
    // Otherwise, sort in descending order of net balance.
    // This means pairs providing MORE net opening brackets (or requiring fewer closing) come first.
    return netBalanceB - netBalanceA;
};

/**
 * Main execution function to process bracket sequences and determine if they can be balanced.
 */
function executeBracketProcessor() {
    totalStringCount = readIntegerToken();

    // Guard clause for invalid input count
    if (isNaN(totalStringCount) || totalStringCount < 0) {
        outputResult('No');
        return;
    }
    if (totalStringCount === 0) {
        outputResult('Yes'); // An empty set of strings is balanced
        return;
    }

    // Read all input strings
    for (let i = 0; i < totalStringCount; ++i) {
        inputStringCollection[i] = readStringToken();
    }

    // Analyze each string for its bracket balance
    for (let i = 0; i < totalStringCount; ++i) {
        processedBalancePairs[i] = analyzeBracketBalance(inputStringCollection[i]);
    }

    // Sort the balance pairs according to the custom comparison logic
    processedBalancePairs.sort(compareBalancePairs);

    let currentBalanceTracker = 0; // Represents the current accumulated balance of opening brackets
    let possibleToBalanceAll = true; // Flag to track if all strings can be successfully processed
    let remainingItemsToProcess = totalStringCount; // Counter for items yet to be processed

    // Loop until all items are processed or it's determined impossible to balance
    // The outer loop ensures we make multiple passes over the items if necessary,
    // until no more items can be processed in a full pass.
    while (remainingItemsToProcess > 0 && possibleToBalanceAll) {
        let matchFoundInIteration = false; // Tracks if any item was processed in the current pass

        // Iterate through all balance pairs to find one that can be processed
        for (let pairIndex = 0; pairIndex < totalStringCount; ++pairIndex) {
            const currentPair = processedBalancePairs[pairIndex];

            // Check if this pair hasn't been processed yet and if the current balance
            // is sufficient to cover its required closing brackets.
            if (currentPair !== null && currentBalanceTracker >= currentPair[0]) {
                // Process the pair: update balance and mark as processed
                currentBalanceTracker += (currentPair[1] - currentPair[0]);
                processedBalancePairs[pairIndex] = null; // Mark as null to indicate it's processed
                matchFoundInIteration = true;
                remainingItemsToProcess--;

                // Immediate check for negative balance after processing.
                // If balance drops below zero, it means a closing bracket was encountered
                // without a preceding opening bracket, making it impossible to balance.
                if (currentBalanceTracker < 0) {
                    possibleToBalanceAll = false;
                    break; // Exit inner loop as the sequence is invalid
                }
            }
        }

        // If no item was processed in a full pass, it means no remaining item can be
        // covered by the current balance, so it's impossible to balance all strings.
        if (!matchFoundInIteration) {
            possibleToBalanceAll = false;
        }
    }

    // Final result: All strings must be processable and the final balance must be zero.
    outputResult(possibleToBalanceAll && currentBalanceTracker === 0 ? 'Yes' : 'No');
}

/**
 * A generic looping utility that can break early.
 * This function iterates from a start index up to (but not including) an end index.
 * If the callback function returns `false`, the loop is terminated.
 *
 * @param {number} startIdx The starting index (inclusive).
 * @param {number} endIdx The ending index (exclusive).
 * @param {function(number): boolean} callbackFunc The function to call for each index.
 *                                                If it returns `false`, the loop breaks.
 */
function iterateRangeWithBreak(startIdx, endIdx, callbackFunc) {
    for (let i = startIdx; i < endIdx; ++i) {
        if (callbackFunc(i) === false) {
            break; // Exit loop early
        }
    }
}

// --- Input/Output Handling ---

// Resume standard input stream
process.stdin.resume();
// Set encoding for incoming data
process.stdin.setEncoding('utf8');

let rawInputBuffer = ''; // Buffer to accumulate all incoming standard input
let currentTokenIndex = 0; // Index to keep track of the current token being read from processed input

/**
 * Reads the next token from the processed input buffer and attempts to parse it as an integer.
 *
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
function readIntegerToken() {
    if (currentTokenIndex >= rawInputBuffer.length) {
        // Log an error or return a specific value for out-of-bounds access
        console.warn("Attempted to read integer beyond available tokens.");
        return NaN;
    }
    const token = rawInputBuffer[currentTokenIndex++];
    const parsed = Number(token);
    if (isNaN(parsed)) {
        console.error(`Warning: Expected integer, but received "${token}".`);
    }
    return parsed;
}

/**
 * Reads the next token from the processed input buffer as a string.
 *
 * @returns {string} The next string token.
 */
function readStringToken() {
    if (currentTokenIndex >= rawInputBuffer.length) {
        console.warn("Attempted to read string beyond available tokens.");
        return '';
    }
    return rawInputBuffer[currentTokenIndex++];
}

/**
 * Prints a value to the console, followed by a newline.
 *
 * @param {any} val The value to be printed.
 */
function outputResult(val) {
    console.log(val);
}

// Event listener for incoming data chunks from standard input
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

// Event listener for the end of the standard input stream
process.stdin.on('end', function() {
    // Trim whitespace from the accumulated input and split it into an array of tokens
    // using one or more whitespace characters as delimiters.
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    // Once all input is received and processed, execute the main logic.
    executeBracketProcessor();
});