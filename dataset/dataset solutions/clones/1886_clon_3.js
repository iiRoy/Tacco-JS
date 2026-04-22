"use strict";

// Access the Node.js file system module for input/output operations.
const fileSystemModule = require("fs");

// Read the entire content of the standard input stream.
// The input is expected to be a string, which we decode as UTF-8.
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens.
// We use a regular expression to split by one or more whitespace characters,
// which makes the parsing more robust than splitting by just space or newline.
const inputTokenArray = rawInputContent.split(/\s+/);

// Maintain an index to keep track of the current position in the token array,
// allowing sequential consumption of input values.
let currentTokenPointer = 0;

/**
 * Retrieves and consumes the next token from the global input array.
 * Includes a basic check to prevent reading beyond the available tokens.
 * @param {boolean} [shouldReturnAsString=false] - If true, the token is returned as a string. Otherwise, it's converted to a number.
 * @returns {string|number} The next token from the input stream.
 * @throws {Error} If an attempt is made to read past the end of the input stream.
 */
function consumeNextToken(shouldReturnAsString = false) {
    if (currentTokenPointer >= inputTokenArray.length) {
        // This indicates an unexpected end of input, which might suggest malformed input.
        throw new Error("Input stream exhausted: No more tokens available to read.");
    }
    const tokenValue = inputTokenArray[currentTokenPointer++];
    return shouldReturnAsString ? tokenValue : Number(tokenValue);
}

// Execute the central algorithm of the program.
// The computed result will be stored in this variable.
const finalProgramResult = evaluateParenthesisStringCollection();

// If the algorithm produces a definite outcome (i.e., not undefined), print it to standard output.
if (finalProgramResult !== undefined) {
    console.log(finalProgramResult);
}

/**
 * Analyzes a single parenthesis string to determine its balance characteristics.
 * It tracks the current balance and the lowest balance point reached within the string.
 * @param {string} parenthesisSequence - The string composed of '(' and ')' characters.
 * @returns {{ lowestPointReached: number, endingBalance: number }} An object containing
 *   the minimum balance achieved during traversal and the final balance of the sequence.
 */
function analyzeSingleSequence(parenthesisSequence) {
    let currentRunningBalance = 0;
    let absoluteMinimumBalance = 0; // Tracks the minimum balance encountered so far.

    // Iterate through each character of the provided sequence.
    for (let charIdx = 0; charIdx < parenthesisSequence.length; charIdx++) {
        const character = parenthesisSequence[charIdx];
        if (character === '(') {
            currentRunningBalance++;
        } else if (character === ')') {
            currentRunningBalance--;
            // Update the absolute minimum balance if the current balance drops lower.
            if (currentRunningBalance < absoluteMinimumBalance) {
                absoluteMinimumBalance = currentRunningBalance;
            }
        }
        // For robustness, one could add an 'else' block here to handle invalid characters.
        // For competitive programming, input format is usually guaranteed.
    }
    return { lowestPointReached: absoluteMinimumBalance, endingBalance: currentRunningBalance };
}

/**
 * The primary function that implements the logic to determine if a collection of parenthesis
 * strings can be arranged and concatenated to form a single, perfectly balanced parenthesis string.
 * @returns {string} "Yes" if such an arrangement is possible, "No" otherwise.
 */
function evaluateParenthesisStringCollection() {
    const STATUS_IMPOSSIBLE = "No";
    const STATUS_POSSIBLE = "Yes";

    // Read the total number of parenthesis segments that need to be processed.
    const totalSegmentsCount = consumeNextToken();

    // Initial validation for the segment count.
    // If the count is invalid (e.g., negative or not a number), return "No".
    // If 0 segments are provided, an empty string is considered balanced, hence "Yes".
    if (isNaN(totalSegmentsCount) || totalSegmentsCount < 0) {
        return STATUS_IMPOSSIBLE;
    }
    if (totalSegmentsCount === 0) {
        return STATUS_POSSIBLE;
    }

    // Data structures to categorize segments based on their balance properties.
    // 'segmentsNeedingInitialCorrection' are those that start with a deficit but end with a surplus, e.g., "))(".
    // Stored as objects: { requiredPrefixToPreventNegative: N, netBalanceChange: M }.
    const segmentsNeedingInitialCorrection = [];
    
    // 'segmentsEndingInNetDeficit' are those that go negative and conclude with a non-positive balance, e.g., "())".
    // Stored as objects: { requiredPrefixToAchieveZeroAtEnd: N, netBalanceChange: M }.
    const segmentsEndingInNetDeficit = [];
    
    // Accumulator for the sum of all final balances across all segments. Must be zero for overall balance.
    let cumulativeFinalBalance = 0;
    
    // Tracks the current balance available from previously processed or "well-behaved" segments.
    let currentlyAvailableBalance = 0;

    // Loop through each of the provided parenthesis segments.
    for (let segmentOrdinal = 0; segmentOrdinal < totalSegmentsCount; segmentOrdinal++) {
        const currentParenthesisString = consumeNextToken(true);
        const { lowestPointReached, endingBalance } = analyzeSingleSequence(currentParenthesisString);

        cumulativeFinalBalance += endingBalance; // Update the total net balance.

        // Categorize the current segment based on its analysis.
        if (lowestPointReached >= 0) {
            // This segment never drops below zero, meaning it's "safe" to append.
            // Its entire ending balance can be immediately added to the available balance.
            currentlyAvailableBalance += endingBalance;
        } else if (endingBalance <= 0) {
            // This segment drops below zero and ends at or below zero.
            // It requires a specific number of leading '(' characters to make its *final* balance zero.
            segmentsEndingInNetDeficit.push({
                requiredPrefixToAchieveZeroAtEnd: -lowestPointReached + endingBalance,
                netBalanceChange: endingBalance
            });
        } else { // lowestPointReached < 0 && endingBalance > 0
            // This segment drops below zero but recovers to end with a positive balance.
            // It requires a prefix of '(-lowestPointReached)' opening parentheses to prevent
            // it from ever going negative during its own traversal.
            segmentsNeedingInitialCorrection.push({
                requiredPrefixToPreventNegative: -lowestPointReached,
                netBalanceChange: endingBalance
            });
        }
    }

    // First crucial check: The sum of all individual segment final balances must be zero.
    // If not, it's impossible to form a perfectly balanced string.
    if (cumulativeFinalBalance !== 0) {
        return STATUS_IMPOSSIBLE;
    }

    // Phase 1: Process segments that need an initial correction but contribute positively.
    // These segments can potentially increase 'currentlyAvailableBalance', so they are processed first.
    // Sort them by the `requiredPrefixToPreventNegative` in ascending order.
    // This strategy ensures we try to satisfy segments with lower prefix requirements first.
    segmentsNeedingInitialCorrection.sort((segmentA, segmentB) => 
        segmentA.requiredPrefixToPreventNegative - segmentB.requiredPrefixToPreventNegative
    );

    for (const segmentDetails of segmentsNeedingInitialCorrection) {
        const prefixNeeded = segmentDetails.requiredPrefixToPreventNegative;
        const netValueContribution = segmentDetails.netBalanceChange;
        
        // If the `currentlyAvailableBalance` is insufficient to cover the `prefixNeeded`,
        // then this particular arrangement fails.
        if (prefixNeeded > currentlyAvailableBalance) {
            return STATUS_IMPOSSIBLE;
        }
        // If successful, add its net contribution to the available balance.
        currentlyAvailableBalance += netValueContribution;
    }

    // Phase 2: Process segments that end in a net deficit (or zero).
    // These segments typically consume from `currentlyAvailableBalance` (since `netBalanceChange` <= 0).
    // Sort them by `requiredPrefixToAchieveZeroAtEnd` in descending order.
    // This prioritizes segments that require a larger initial buffer to make their *final* balance zero,
    // ensuring we use the largest available balance for the most demanding segments.
    segmentsEndingInNetDeficit.sort((segmentA, segmentB) => 
        segmentB.requiredPrefixToAchieveZeroAtEnd - segmentA.requiredPrefixToAchieveZeroAtEnd
    );

    for (const segmentDetails of segmentsEndingInNetDeficit) {
        const prefixRequiredToClear = segmentDetails.requiredPrefixToAchieveZeroAtEnd;
        const netValueLoss = segmentDetails.netBalanceChange; // This value is always <= 0.

        // If the `currentlyAvailableBalance` cannot meet the `prefixRequiredToClear`,
        // then a balanced string cannot be formed.
        if (prefixRequiredToClear > currentlyAvailableBalance) {
            return STATUS_IMPOSSIBLE;
        }
        // Update the available balance. Since `netValueLoss` is non-positive, this will
        // decrease or maintain the balance.
        currentlyAvailableBalance += netValueLoss;
    }

    // If all checks pass and all segments can be successfully integrated,
    // then it is possible to form a perfectly balanced string.
    return STATUS_POSSIBLE;
}