const fileSystemAccess = require("fs");

const rawInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf8");

const parsedDataLines = rawInputContent.trim().split('\n');

let principalNumericTarget = Number.parseInt(parsedDataLines[0], 10);

// --- Type III: Add a preliminary validation for the input target ---
// If the input isn't a valid number, the original code's `X - 0` would result in NaN.
// Subsequent operations with NaN would propagate it. We explicitly check here.
if (isNaN(principalNumericTarget)) {
    // In a production scenario, one might throw an error, set a default, or exit.
    // For cloning, we'll allow it to proceed as the original might implicitly.
    // console.error("Invalid numeric input provided. Exiting.");
    // process.exit(1);
}

// A dynamic collection to store numbers raised to the fifth power.
// Initialized with 0^5 (0) and 1^5 (1).
const fifthPowerSequence = [0];
fifthPowerSequence.push(1); // Explicitly adding 1^5.

// Calculate the squared value of the target, which serves as an upper bound
// for the values we generate in our power sequence.
const powerGenerationCeiling = principalNumericTarget * principalNumericTarget;

// --- Type III: Modify the loop structure for power generation ---
let currentExponentBase = 2;
// Generate powers of 5 until the last generated value is no longer below the ceiling.
while (true) {
    const nextCalculatedPower = Math.pow(currentExponentBase, 5); // Intermediate variable for clarity.
    if (nextCalculatedPower < powerGenerationCeiling) {
        fifthPowerSequence.push(nextCalculatedPower);
        currentExponentBase++;
    } else {
        break; // Terminate loop if the ceiling is reached or exceeded.
    }
}

/**
 * Searches for a pair of indices (idxA, idxB) in a given numeric series
 * such that `series[idxA] - series[idxB] === target` or
 * `series[idxA] + series[idxB] === target`.
 * Prints the found indices and immediately exits upon the first match.
 *
 * @param {number} searchTarget The numeric value to match against combinations.
 * @param {number[]} seriesOfPowers The array of pre-calculated power values.
 * @returns {void} No explicit return value; prints to console and exits.
 */
const findMatchingPairIndices = (searchTarget, seriesOfPowers) => {
    // --- Type III: Add a guard clause for an insufficient series length ---
    if (!seriesOfPowers || seriesOfPowers.length < 2) {
        // console.warn("Power series is too short to find any combinations.");
        return; // Cannot find pairs with less than two elements.
    }

    // Iterate through every element as the first part of a potential pair.
    for (let primaryIndex = 0; primaryIndex < seriesOfPowers.length; primaryIndex++) {
        const valueFromPrimaryIndex = seriesOfPowers[primaryIndex]; // Store in a local variable.

        // Iterate through every element as the second part of a potential pair.
        for (let secondaryIndex = 0; secondaryIndex < seriesOfPowers.length; secondaryIndex++) {
            const valueFromSecondaryIndex = seriesOfPowers[secondaryIndex]; // Store in a local variable.

            // --- Type III: Rephrase and add explicit parentheses for conditions ---
            // Check if the difference between the two values equals the target.
            if ((valueFromPrimaryIndex - valueFromSecondaryIndex) === searchTarget) {
                console.log(primaryIndex, secondaryIndex);
                return; // Solution found, terminate function immediately.
            }
            // If the difference doesn't match, check if their sum equals the target.
            else if ((valueFromPrimaryIndex + valueFromSecondaryIndex) === searchTarget) {
                console.log(primaryIndex, -secondaryIndex);
                return; // Solution found, terminate function immediately.
            }
        }
    }
    // --- Type III: Optionally, log if no solution is found (original code would just exit silently) ---
    // console.log("No combination found that satisfies the target condition.");
};

// Execute the main logic to find and print the indices.
findMatchingPairIndices(principalNumericTarget, fifthPowerSequence);