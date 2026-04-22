const fileSystemModule = require('fs');

/**
 * Calculates the sum of integers from 0 up to a given limit (inclusive).
 * This is equivalent to the nth triangular number formula: n * (n + 1) / 2.
 * It's implemented with a loop here to demonstrate a structural rewrite
 * compared to a direct mathematical formula.
 *
 * @param {number} upperLimit - The non-negative integer up to which to sum.
 * @returns {number} The sum of integers from 0 to upperLimit.
 */
const computeSequenceSum = (upperLimit) => {
    // Defensive check for invalid input. Sum for negative limits is zero.
    if (upperLimit < 0) {
        return 0;
    }
    let currentTotal = 0;
    // Iterate from 0 to the upper limit, adding each number.
    // The loop variable is intentionally distinct from other iterators.
    for (let indexValue = 0; indexValue <= upperLimit; indexValue++) {
        currentTotal += indexValue;
    }
    return currentTotal;
};

// Encapsulate the main logic within an Immediately Invoked Function Expression (IIFE)
// to prevent global variable pollution and clearly define execution scope.
(() => {
    // Read the entire content of standard input, interpreting it as UTF-8 text.
    // Any leading or trailing whitespace characters are then meticulously removed.
    let processedInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();

    // Implement a pre-processing step: if the input string begins with a '>' character,
    // it implies an incomplete pattern. To ensure correct subsequent pattern matching,
    // a '<' character is prepended to the string.
    if (processedInputString.charAt(0) === '>') {
        processedInputString = '<' + processedInputString;
    }

    // Initialize the primary accumulator for the final calculated score.
    let cumulativeScore = 0;
    // Establish an index pointer to traverse the characters of the processed string.
    let stringCursor = 0;

    // Begin the main parsing loop, continuing as long as the cursor has not reached
    // the end of the input string.
    while (stringCursor < processedInputString.length) {
        // Temporary counter for consecutive occurrences of the opening symbol '<'.
        let openingSymbolCount = 0;
        // Temporary counter for consecutive occurrences of the closing symbol '>'.
        let closingSymbolCount = 0;

        // First sub-loop: Count all consecutive '<' characters starting from the current cursor position.
        // The cursor is advanced with each counted character.
        while (stringCursor < processedInputString.length && processedInputString.charAt(stringCursor) === '<') {
            openingSymbolCount++;
            stringCursor++;
        }

        // Second sub-loop: Count all consecutive '>' characters immediately following the '<'s.
        // The cursor is similarly advanced.
        while (stringCursor < processedInputString.length && processedInputString.charAt(stringCursor) === '>') {
            closingSymbolCount++;
            stringCursor++;
        }

        // Calculate the score contribution for the current segment of '<' and '>' characters.
        let segmentContribution = 0;

        // The scoring logic depends on the relative counts of opening and closing symbols.
        if (openingSymbolCount > closingSymbolCount) {
            // If more opening symbols, sum up to 'openingSymbolCount' and up to 'closingSymbolCount - 1'.
            segmentContribution += computeSequenceSum(openingSymbolCount);
            segmentContribution += computeSequenceSum(closingSymbolCount - 1);
        } else {
            // If opening symbols are less than or equal to closing symbols, sum up to 'openingSymbolCount - 1'
            // and up to 'closingSymbolCount'.
            segmentContribution += computeSequenceSum(openingSymbolCount - 1);
            segmentContribution += computeSequenceSum(closingSymbolCount);
        }

        // Add the calculated segment's score to the overall cumulative score.
        cumulativeScore += segmentContribution;

        // Note: The counters 'openingSymbolCount' and 'closingSymbolCount' are block-scoped (let),
        // so they are implicitly reset to zero at the beginning of each 'while' loop iteration.
    }

    // Output the final accumulated score to the standard console.
    console.log(cumulativeScore);
})();