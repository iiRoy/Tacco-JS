'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Calculates the maximum possible rectangular area from a given set of stick lengths.
 * This function processes raw input data, identifies stick combinations,
 * and determines the largest area that can be formed.
 *
 * The strategy is as follows:
 * 1. Prioritize finding four identical sticks to form a perfect square, as this
 *    maximizes area for a given stick length.
 * 2. If no four identical sticks are found, search for two distinct pairs of
 *    identical sticks to form a rectangle.
 *
 * @param {string} rawInputData - The complete raw input string, typically from stdin.
 */
function CalculateRectangleArea(rawInputData) {
    // Split the input string into an array of lines.
    const dataLines = rawInputData.split('\n');

    // --- Input Validation ---
    // A robust system should check if the input provides sufficient data.
    // We expect at least two lines: one for count (ignored) and one for stick lengths.
    if (dataLines.length < 2 || !dataLines[1] || dataLines[1].trim() === '') {
        console.error("Error: Insufficient or malformed input data for stick lengths. Expected at least two lines.");
        console.log(0); // Output 0 if valid stick data is missing.
        return;
    }

    // Extract the string containing stick lengths from the second line.
    const stickLengthsString = dataLines[1];

    // Process the stick lengths:
    // 1. Split the string by spaces.
    // 2. Filter out any empty strings that might result from multiple spaces.
    // 3. Convert all valid length strings to numerical values.
    // 4. Sort the numerical lengths in descending order to simplify finding pairs/quads.
    const sortedStickLengths = stickLengthsString
        .split(' ')
        .filter(segment => segment !== '') // Remove empty strings from potential extra spaces
        .map(Number) // Convert all string lengths to numbers
        .sort((a, b) => b - a); // Sort from largest to smallest

    // Initialize variables for the area calculation.
    let maxSurfaceArea = 0; // Stores the final calculated maximum area.
    const collectedDimensions = []; // Will store the lengths of the two sides of the rectangle.

    // Iterate through the sorted stick lengths.
    // The loop condition ensures we don't go out of bounds when looking ahead for comparisons.
    // We need at least one stick ahead for a pair, and three for a quad.
    for (let currentPosition = 0; currentPosition < sortedStickLengths.length; ++currentPosition) {
        // Retrieve the stick lengths at the current and subsequent positions.
        // Undefined values will result if indices are out of bounds, which is handled by comparison operators.
        const currentStick = sortedStickLengths[currentPosition];
        const nextStick = sortedStickLengths[currentPosition + 1];
        const thirdStick = sortedStickLengths[currentPosition + 2];
        const fourthStick = sortedStickLengths[currentPosition + 3];

        // --- Primary Strategy: Find Four Identical Sticks (Optimal for Squares) ---
        // If four consecutive sticks have the same length, we've found a perfect square.
        // Since the array is sorted descending, this will be the largest possible square.
        if (currentStick === nextStick && currentStick === thirdStick && currentStick === fourthStick) {
            maxSurfaceArea = currentStick * currentStick; // Calculate area.
            break; // Found the best possible solution, so exit the loop.
        }

        // --- Secondary Strategy: Find Two Pairs of Identical Sticks (for Rectangles) ---
        // If the current stick forms a pair with the next stick.
        // Because the array is sorted, the first two pairs found will yield the largest rectangle.
        if (currentStick === nextStick) {
            // Add the length of this pair to our collected dimensions.
            collectedDimensions.push(currentStick);
            // Crucially, increment the loop counter here to skip the second stick of the pair,
            // as it has already been 'used'. This ensures we find distinct pairs.
            currentPosition++;
        }

        // If we have successfully collected two dimensions (i.e., two distinct pairs).
        if (collectedDimensions.length === 2) {
            // Calculate the area using the lengths of the two pairs.
            maxSurfaceArea = collectedDimensions[0] * collectedDimensions[1];
            break; // We have found our two largest pairs, so exit the loop.
        }

        // Optional micro-optimization/guard: If remaining sticks are insufficient for another pair,
        // and we haven't found two pairs yet, we can break early.
        // This implicitly happens with the loop condition as well but adds clarity.
        if (sortedStickLengths.length - (currentPosition + 1) < 1 && collectedDimensions.length < 2) {
            // No more pairs can be formed from the remaining sticks.
            break;
        }
    }

    // Output the final calculated maximum surface area.
    console.log(maxSurfaceArea);
}

// Entry point: Read input from standard input and invoke the main processing function.
const stdInputData = require("fs").readFileSync("/dev/stdin", "utf8");
CalculateRectangleArea(stdInputData);