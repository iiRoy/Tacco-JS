const LOWER_BOUND_DIGIT = 0; // Defines the minimum allowed value for each digit in a combination.
const UPPER_BOUND_DIGIT = 9; // Defines the maximum allowed value for each digit in a combination.

// Initialize standard input stream to listen for data.
process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Calculates the number of distinct combinations of four digits (within a specified range)
 * that sum up to a given target value.
 *
 * @param {number} desiredSum The target sum that the four digits must add up to.
 * @param {number} minAllowedDigit The lowest possible value for any single digit.
 * @param {number} maxAllowedDigit The highest possible value for any single digit.
 * @returns {number} The total count of valid four-digit combinations.
 */
function determineDigitSumCombinations(desiredSum, minAllowedDigit, maxAllowedDigit) {
    let validCombinationCounter = 0; // Initialize a counter for successful combinations.

    // Calculate the absolute minimum and maximum possible sums for four digits
    // to provide an early exit for impossible target sums.
    const minimumAchievableSum = minAllowedDigit * 4;
    const maximumAchievableSum = maxAllowedDigit * 4;

    // Guard clause: If the desired sum is outside the possible range, no combinations exist.
    if (desiredSum < minimumAchievableSum || desiredSum > maximumAchievableSum) {
        // console.log(`Debug: Target sum ${desiredSum} is out of bounds [${minimumAchievableSum}, ${maximumAchievableSum}].`);
        return 0;
    }

    // Iterate through all possible values for the first digit.
    for (let digitA = minAllowedDigit; digitA <= maxAllowedDigit; digitA++) {
        // Iterate through all possible values for the second digit.
        for (let digitB = minAllowedDigit; digitB <= maxAllowedDigit; digitB++) {
            // Iterate through all possible values for the third digit.
            for (let digitC = minAllowedDigit; digitC <= maxAllowedDigit; digitC++) {
                // Iterate through all possible values for the fourth digit.
                for (let digitD = minAllowedDigit; digitD <= maxAllowedDigit; digitD++) {
                    // Check if the sum of the four current digits equals the desired target sum.
                    const currentDigitsTotal = digitA + digitB + digitC + digitD;
                    if (currentDigitsTotal === desiredSum) {
                        validCombinationCounter += 1; // Increment the counter if a valid combination is found.
                        // For detailed output during development, one might log the combination:
                        // console.log(`  Match found: [${digitA}, ${digitB}, ${digitC}, ${digitD}] sums to ${currentDigitsTotal}`);
                    }
                }
            }
        }
    }
    return validCombinationCounter; // Return the final count of combinations.
}

// Event listener for incoming data on standard input.
process.stdin.on("data", (inputDataChunk) => {
    // Process the input data:
    // 1. Convert the chunk to a string.
    // 2. Trim whitespace from the entire chunk.
    // 3. Split the string by newline characters to get individual lines.
    // 4. Filter out any lines that are empty or contain only whitespace.
    // 5. Map each remaining line to a number, trimming whitespace from the line itself.
    const numericalTargets = String(inputDataChunk)
        .trim()
        .split('\n')
        .filter(lineContent => lineContent.trim() !== '')
        .map(lineContent => Number(lineContent.trim()));

    // Verify if any valid numerical targets were extracted from the input.
    if (!numericalTargets || numericalTargets.length === 0) {
        console.error("Input processing error: No valid numerical targets could be parsed from the provided data.");
        return; // Exit early if nothing to process.
    }

    // Iterate over each target sum extracted from the input.
    for (let targetIndex = 0; targetIndex < numericalTargets.length; targetIndex++) {
        const currentTargetValue = numericalTargets[targetIndex];

        // Perform a quick validation for the current target value.
        if (isNaN(currentTargetValue) || !Number.isInteger(currentTargetValue)) {
            console.warn(`Skipping invalid or non-integer target value '${numericalTargets[targetIndex]}' at input position ${targetIndex}.`);
            continue; // Move to the next target if the current one is not a valid integer.
        }

        // Call the helper function to compute the combinations for the current target.
        const totalMatchingCombinations = determineDigitSumCombinations(
            currentTargetValue,
            LOWER_BOUND_DIGIT,
            UPPER_BOUND_DIGIT
        );

        // Output the result for the current target sum.
        console.log(`For the target sum of ${currentTargetValue}, we found ${totalMatchingCombinations} distinct 4-digit combinations.`);
    }
});