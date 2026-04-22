const MIN_DIGIT_VALUE = 0;
const MAX_DIGIT_VALUE = 9;
const NUMBER_OF_DIGITS_TO_SUM = 4;

/**
 * Computes the count of distinct combinations of four digits (0-9)
 * that sum precisely to a given target value.
 *
 * This function includes an initial check to quickly return 0 if the target sum
 * is outside the possible range (0 to 36) for four digits, optimizing for invalid inputs.
 *
 * @param {number} desiredSum - The integer target sum to evaluate.
 * @returns {number} The total number of valid four-digit combinations.
 */
function determineCombinationCount(desiredSum) {
    const minPossibleSum = MIN_DIGIT_VALUE * NUMBER_OF_DIGITS_TO_SUM;
    const maxPossibleSum = MAX_DIGIT_VALUE * NUMBER_OF_DIGITS_TO_SUM;

    // Early exit for sums that are impossible to achieve with four digits (0-9).
    if (desiredSum < minPossibleSum || desiredSum > maxPossibleSum) {
        return 0;
    }

    let combinationTally = 0; // Accumulator for valid combinations

    // Iterate through all possibilities for the first digit
    for (let d1_val = MIN_DIGIT_VALUE; d1_val <= MAX_DIGIT_VALUE; d1_val++) {
        // Iterate through all possibilities for the second digit
        for (let d2_val = MIN_DIGIT_VALUE; d2_val <= MAX_DIGIT_VALUE; d2_val++) {
            // Iterate through all possibilities for the third digit
            for (let d3_val = MIN_DIGIT_VALUE; d3_val <= MAX_DIGIT_VALUE; d3_val++) {
                // Iterate through all possibilities for the fourth digit
                for (let d4_val = MIN_DIGIT_VALUE; d4_val <= MAX_DIGIT_VALUE; d4_val++) {
                    const currentFourDigitSum = d1_val + d2_val + d3_val + d4_val;

                    // Check if the sum of the current four digits matches the target
                    if (currentFourDigitSum === desiredSum) {
                        combinationTally++; // Increment if a match is found
                    }
                }
            }
        }
    }
    return combinationTally; // Return the final count
}

// Configure the standard input stream to interpret data as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks from standard input.
process.stdin.on("data", (inputDataChunk) => {
    // Convert the raw data chunk to a string and remove any leading/trailing whitespace.
    const trimmedInputString = String(inputDataChunk).trim();

    // Guard clause: If the input chunk is empty after trimming, there's nothing to process.
    if (!trimmedInputString) {
        return;
    }

    // Split the trimmed string into individual lines, then process each line.
    // Each line is attempted to be parsed into a number. Invalid numbers or empty lines
    // are filtered out.
    const validNumericalTargets = trimmedInputString
        .split("\n")
        .map(lineContent => {
            const lineTrimmed = lineContent.trim();
            // Explicitly handle empty lines resulting from split
            if (lineTrimmed === '') {
                return null;
            }
            const parsedNumericValue = Number(lineTrimmed); // Use Number() for robust parsing
            // Return null for any non-numeric or invalid lines
            return isNaN(parsedNumericValue) ? null : parsedNumericValue;
        })
        .filter(item => item !== null); // Remove all null entries (invalid inputs)

    // If no valid numbers were extracted from the current data chunk, exit.
    if (validNumericalTargets.length === 0) {
        return;
    }

    // Process each valid numerical target one by one.
    for (const currentTargetValue of validNumericalTargets) {
        // Calculate the combinations for the current target sum.
        const calculatedResult = determineCombinationCount(currentTargetValue);
        // Output the result to standard output, followed by a newline.
        console.log(calculatedResult);
    }
});

// Attach an event listener for when the standard input stream ends.
process.stdin.on('end', () => {
    // This handler can be used for finalization logic or resource cleanup.
    // For this specific problem, it's not strictly required but demonstrates good practice.
    // console.log("Standard input stream has concluded.");
});

// Explicitly resume the standard input stream to ensure it starts emitting 'data' events.
// This is typically called after all necessary event listeners have been set up.
process.stdin.resume();