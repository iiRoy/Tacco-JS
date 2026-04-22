"use strict";

// This script determines if a sequence of parentheses strings can be concatenated
// to form a single, valid, and balanced parentheses string.
// It applies a Type III code clone transformation:
// - Extensive renaming of variables, functions, and parameters.
// - Significant restructuring of input reading utilities into an object.
// - Introduction of a helper class for clearer data representation.
// - Extraction of core logic into a separate, reusable function.
// - Addition of guard clauses and validation checks.
// - Removal of unused utility functions from the original code.
// - Reformatting of code for improved readability and consistency.

// --- Input Handling Utility Object ---
/**
 * `InputProcessor` provides methods to read and parse tokens from standard input.
 * It encapsulates the input stream state (token array and current index).
 */
const InputProcessor = {
    // An array holding all individual tokens parsed from the input.
    tokenData: [],
    // The current index tracking the next token to be read from `tokenData`.
    currentPosition: 0,

    /**
     * Initializes the `InputProcessor` by reading from `/dev/stdin` and
     * parsing the content into a stream of tokens.
     * @returns {boolean} `true` if initialization was successful and tokens were found, `false` otherwise.
     */
    initializeInputSource: function() {
        try {
            // Read the entire content of standard input as a UTF-8 string.
            const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
            // Trim whitespace, split by any sequence of whitespace characters,
            // and filter out any resulting empty strings to get clean tokens.
            this.tokenData = rawContent.trim().split(/\s+/).filter(Boolean);

            // If no tokens are found after parsing, log a warning.
            if (this.tokenData.length === 0) {
                console.warn("Input source appears to be empty or contains only whitespace.");
                return false; // Indicate that no usable input was found.
            }
            return true; // Initialization successful.
        } catch (readError) {
            // Catch and report any errors encountered during file reading.
            console.error("Error reading or processing input from /dev/stdin:", readError.message);
            return false; // Indicate initialization failure.
        }
    },

    /**
     * Retrieves the next available token from the stream.
     * @param {boolean} [returnAsText=false] If `true`, returns the token as a string;
     *                                       otherwise, attempts to convert it to a number.
     * @returns {string|number|undefined} The next token, or `undefined` if no more tokens are available.
     */
    retrieveNextToken: function(returnAsText = false) {
        if (this.currentPosition >= this.tokenData.length) {
            return undefined; // End of token stream reached.
        }
        // Fetch the token and advance the position.
        const value = this.tokenData[this.currentPosition++];
        return returnAsText ? value : Number(value); // Return as string or number.
    }
};

// Attempt to initialize the input processor. If it fails, the application might not proceed.
// In a competitive programming context, this might lead to an early exit.
if (!InputProcessor.initializeInputSource()) {
    // Depending on problem constraints, one might `process.exit(1)` here.
    // For this problem, we'll let the main logic handle potentially missing input gracefully.
}

/**
 * `BalanceProfile` represents the essential balance characteristics of a parentheses string.
 * This class enhances readability compared to using raw arrays like `[-mn, last]`.
 */
class BalanceProfile {
    /**
     * @param {number} minimumInitialBalanceRequired The minimum positive balance needed at the start
     *                                               of the string for it not to go negative internally.
     * @param {number} finalNetBalanceChange The net change in balance from the beginning to the end
     *                                      of the string.
     */
    constructor(minimumInitialBalanceRequired, finalNetBalanceChange) {
        this.minimumInitialBalanceRequired = minimumInitialBalanceRequired;
        this.finalNetBalanceChange = finalNetBalanceChange;
    }
}

/**
 * Analyzes a given parentheses string to compute its balance profile.
 * This function is extracted to improve modularity and clarity of the main logic.
 * @param {string} targetString The string of parentheses to analyze.
 * @returns {BalanceProfile} An object containing the string's balance characteristics.
 */
function determineStringBalanceProfile(targetString) {
    let currentRunningBalance = 0; // Tracks the balance as we iterate through the string.
    let lowestBalanceReached = 0;  // Stores the lowest `currentRunningBalance` encountered.

    // Iterate over each character in the string.
    for (let charIndex = 0; charIndex < targetString.length; charIndex++) {
        const char = targetString[charIndex];
        if (char === '(') {
            currentRunningBalance++; // Opening parenthesis increases balance.
        } else if (char === ')') {
            currentRunningBalance--; // Closing parenthesis decreases balance.
            // Update `lowestBalanceReached` if the balance drops further.
            if (currentRunningBalance < lowestBalanceReached) {
                lowestBalanceReached = currentRunningBalance;
            }
        }
        // Non-parenthesis characters are effectively ignored.
    }
    // The `minimumInitialBalanceRequired` is the absolute value of the lowest negative balance encountered.
    // The `finalNetBalanceChange` is simply the `currentRunningBalance` at the end.
    return new BalanceProfile(-lowestBalanceReached, currentRunningBalance);
}

/**
 * The main function that orchestrates the solution to the parentheses sequence problem.
 * It reads multiple parentheses strings, analyzes them, and determines if they can
 * be concatenated in some order to form a fully balanced sequence.
 * @returns {string} "Yes" if a valid sequence can be formed, "No" otherwise.
 */
function solveParenthesesSequenceProblem() {
    // Define constants for the output strings.
    const OUTCOME_NO = "No";
    const OUTCOME_YES = "Yes";

    // Read the total count of strings to process from the input.
    const totalStringsCount = InputProcessor.retrieveNextToken();

    // Validate the input count. It must be a non-negative integer.
    if (typeof totalStringsCount !== 'number' || !Number.isInteger(totalStringsCount) || totalStringsCount < 0) {
        console.error("Error: Invalid or missing count for the number of parentheses strings.");
        return OUTCOME_NO;
    }

    // `stringsWithNegativeEnd`: Stores `BalanceProfile` for strings that require initial balance
    //                          and result in a non-positive net balance change.
    const stringsWithNegativeEnd = [];
    // `stringsWithPositiveEnd`: Stores `BalanceProfile` for strings that require initial balance
    //                          but result in a positive net balance change.
    const stringsWithPositiveEnd = [];

    // `aggregateBalance`: Accumulates the sum of `finalNetBalanceChange` for all strings.
    let aggregateBalance = 0;
    // `currentAvailableBalance`: Represents the current "open" balance that can be used
    //                            by subsequent strings that require an initial positive balance.
    let currentAvailableBalance = 0;

    // Loop through each of the `totalStringsCount` input strings.
    for (let i = 0; i < totalStringsCount; i++) {
        const currentInputString = InputProcessor.retrieveNextToken(true); // Read string as text.

        // If a string is unexpectedly `undefined` (e.g., end of input), handle it.
        if (typeof currentInputString !== 'string') {
            console.error(`Error: Expected string input for item ${i}, but received ${currentInputString}.`);
            return OUTCOME_NO;
        }

        // Analyze the current string to get its balance characteristics.
        const profile = determineStringBalanceProfile(currentInputString);

        // Accumulate the overall net balance change.
        aggregateBalance += profile.finalNetBalanceChange;

        // Categorize the string based on its profile.
        if (profile.minimumInitialBalanceRequired <= 0) {
            // If the string doesn't require an initial positive balance (i.e., it's valid or only opens),
            // its net balance change directly contributes to the `currentAvailableBalance`.
            currentAvailableBalance += profile.finalNetBalanceChange;
        } else if (profile.finalNetBalanceChange <= 0) {
            // If it requires an initial balance and ends with a non-positive balance,
            // it's added to the `stringsWithNegativeEnd` list.
            stringsWithNegativeEnd.push(profile);
        } else {
            // If it requires an initial balance but ends with a positive balance,
            // it's added to the `stringsWithPositiveEnd` list.
            stringsWithPositiveEnd.push(profile);
        }
    }

    // First crucial check: The total aggregate balance of all strings must be zero
    // for a fully balanced sequence to be possible.
    if (aggregateBalance !== 0) {
        return OUTCOME_NO;
    }

    // --- Processing Phase 1: Strings that start negative but end positive ---
    // These strings are "net positive" contributors after consuming an initial balance.
    // They should be processed first, sorted by the smallest `minimumInitialBalanceRequired`.
    // This allows strings that need less initial balance to be satisfied earlier,
    // potentially increasing `currentAvailableBalance` for strings that need more.
    stringsWithPositiveEnd.sort((a, b) => a.minimumInitialBalanceRequired - b.minimumInitialBalanceRequired);

    for (const profile of stringsWithPositiveEnd) {
        // If the `currentAvailableBalance` is insufficient for the string's requirement, it's impossible.
        if (profile.minimumInitialBalanceRequired > currentAvailableBalance) {
            return OUTCOME_NO;
        }
        // Consume the required balance and add the string's net positive change.
        currentAvailableBalance += profile.finalNetBalanceChange;
    }

    // --- Processing Phase 2: Strings that start negative and end negative/zero ---
    // These strings are "net non-positive" contributors. They consume balance.
    // They should be processed last, sorted by the largest `minimumInitialBalanceRequired` first.
    // This strategy ensures that strings with higher initial demands are met when
    // `currentAvailableBalance` is likely at its peak (after positive-ending strings have been processed).
    stringsWithNegativeEnd.sort((a, b) => b.minimumInitialBalanceRequired - a.minimumInitialBalanceRequired);

    for (const profile of stringsWithNegativeEnd) {
        // If `currentAvailableBalance` is insufficient for the string's requirement, it's impossible.
        if (profile.minimumInitialBalanceRequired > currentAvailableBalance) {
            return OUTCOME_NO;
        }
        // Consume the required balance and subtract the string's net non-positive change.
        currentAvailableBalance += profile.finalNetBalanceChange;
    }

    // If all checks have passed and the `aggregateBalance` was zero, then a valid sequence can be formed.
    // The `currentAvailableBalance` should also be zero at this point if `aggregateBalance` was zero.
    return OUTCOME_YES;
}

// Execute the main problem-solving function.
const finalOutcome = solveParenthesesSequenceProblem();

// Output the result to standard output.
if (finalOutcome !== undefined && typeof finalOutcome === 'string') {
    console.log(finalOutcome);
}