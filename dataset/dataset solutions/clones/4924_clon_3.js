/**
 * @file This script processes a sequence of ratio adjustments to determine
 * the final minimum accumulated factors for two components, T and A.
 * It's designed to solve a problem where subsequent ratios must 'cover'
 * the previously accumulated minimums by scaling themselves up.
 *
 * This is a Type III clone, featuring extensive changes in identifiers,
 * data types, comments, and whitespace (Type II), along with significant
 * structural modifications like added helper functions, guard clauses,
 * and a refactored core iteration logic (Type III).
 */

// Custom utility to find the maximum of multiple BigInts, as Math.max does not support them.
const bigIntMax = (...valuesForComparison) => valuesForComparison.reduce((currentMax, element) => (element > currentMax ? element : currentMax));

/**
 * Computes the ceiling division for two BigInt numbers.
 * This ensures that if there's any remainder, the result is rounded up.
 *
 * @param {BigInt} dividend - The number to be divided.
 * @param {BigInt} divisor - The number to divide by. Must be positive.
 * @returns {BigInt} The ceiling of the division result.
 * @throws {Error} If the divisor is zero or negative.
 */
const calculateCeilingDivision = (dividend, divisor) => {
    // A robust solution would handle negative numbers differently,
    // but problem context implies positive BigInts for divisors.
    if (divisor <= 0n) {
        throw new Error("Divisor must be a positive BigInt for ceiling division calculation.");
    }
    const resultQuotient = dividend / divisor;
    const resultRemainder = dividend % divisor;
    // If there's a remainder, we need to add 1 to round up.
    return resultRemainder === 0n ? resultQuotient : resultQuotient + 1n;
};

/**
 * Main function to process the input data and calculate the final state
 * of the accumulated factors based on a series of incoming ratio pairs.
 *
 * @param {string} rawInputString - The complete raw input provided as a string.
 * This string is expected to contain lines of space-separated numbers.
 */
function processRatioAccumulation(rawInputString) {
    // Step 1: Normalize and parse the raw input string into lines.
    // Trim any leading/trailing whitespace and split by newline characters.
    const allInputLines = rawInputString.trim().split('\n');

    // Step 2: Validate the initial input structure.
    // An empty input string or one without any lines is an error.
    if (allInputLines.length === 0) {
        console.error("Input data is unexpectedly empty. Cannot proceed.");
        return;
    }

    // Step 3: Extract the total count of ratio entries from the first line.
    // The first line is expected to contain a single integer, N.
    const totalRatioEntries = Number(allInputLines[0].split(' ')[0]);

    // Step 4: Perform critical validation on the number of entries.
    // Check if N is a valid positive number and if it matches the actual
    // number of data lines provided (excluding the first N-line itself).
    if (isNaN(totalRatioEntries) || totalRatioEntries <= 0 || totalRatioEntries !== allInputLines.length - 1) {
        console.error(`Input error: Expected ${totalRatioEntries} ratio entries, but found ${allInputLines.length - 1} data lines, or N is invalid.`);
        return;
    }

    // Step 5: Prepare a collection to store all parsed ratio component pairs.
    // Each pair will be stored as an array of two BigInts: [T_component, A_component].
    const individualRatioComponents = [];

    // Step 6: Iterate through the remaining input lines (starting from the second line)
    // to parse and convert each ratio pair into BigInt format.
    for (let currentLineIdx = 0; currentLineIdx < totalRatioEntries; ++currentLineIdx) {
        const lineContentTokens = allInputLines[currentLineIdx + 1].split(' ');

        // Validate that each data line contains exactly two numeric components.
        if (lineContentTokens.length !== 2) {
            console.error(`Data format error on line ${currentLineIdx + 2}: Expected two numbers, but got ${lineContentTokens.length}.`);
            return;
        }

        // Convert the string tokens to BigInts for arbitrary precision arithmetic.
        const tVal = BigInt(lineContentTokens[0]);
        const aVal = BigInt(lineContentTokens[1]);

        // Add the BigInt pair to our collection.
        individualRatioComponents.push([tVal, aVal]);
    }

    // Step 7: Initialize the current accumulated factors.
    // Start with 0n for both T and A components, representing an initial empty state.
    // These will be updated iteratively.
    let [currentAccumulatedT, currentAccumulatedA] = [0n, 0n];

    // Step 8: Core logic - Iterate through each incoming ratio pair
    // and adjust the accumulated factors accordingly.
    for (let iterationIndex = 0; iterationIndex < totalRatioEntries; iterationIndex++) {
        const [incomingTFactor, incomingAFactor] = individualRatioComponents[iterationIndex];

        // Determine the minimum scaling factor needed for the 'T' component.
        // If currentAccumulatedT is 0 (initial state), no scaling is strictly needed for T yet,
        // so we treat its required scale as 0, which will be handled by bigIntMax ensuring at least 1.
        const requiredScaleForTComponent = (currentAccumulatedT === 0n)
            ? 0n
            : calculateCeilingDivision(currentAccumulatedT, incomingTFactor);

        // Determine the minimum scaling factor needed for the 'A' component.
        const requiredScaleForAComponent = (currentAccumulatedA === 0n)
            ? 0n
            : calculateCeilingDivision(currentAccumulatedA, incomingAFactor);

        // The final scaling multiplier must be large enough to satisfy both T and A requirements.
        // It must also be at least 1, as ratios typically imply positive scaling.
        const effectiveScalingMultiplier = bigIntMax(1n, requiredScaleForTComponent, requiredScaleForAComponent);

        // Update the accumulated factors by applying the calculated multiplier.
        currentAccumulatedT = incomingTFactor * effectiveScalingMultiplier;
        currentAccumulatedA = incomingAFactor * effectiveScalingMultiplier;
    }

    // Step 9: Calculate and output the sum of the final accumulated factors.
    // The result is converted to a string before printing to handle large BigInts.
    console.info((currentAccumulatedT + currentAccumulatedA).toString());
}

// Entry point of the script: Read input from standard input and trigger processing.
// Using a direct reference to the 'fs' module for reading files.
const fileSystemModule = require("fs");
const systemInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processRatioAccumulation(systemInputContent);