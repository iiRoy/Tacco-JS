"use strict"; // Enforce strict JavaScript parsing rules

/**
 * Main entry point for processing the input data.
 * This function handles parsing raw string input, extracting parameters,
 * and orchestrating the primary computation.
 * @param {string} rawData The raw input string, typically from stdin.
 * @returns {number} The final computed result.
 */
function processInput(rawData) {
    // Validate input data presence
    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Error: No input data provided or data is empty.");
        return 0; // Return a default/error value
    }

    const inputLines = rawData.split("\n"); // Divide the input into individual lines

    // Ensure there's at least one line to process
    if (inputLines.length === 0) {
        console.error("Error: Input data contains no lines.");
        return 0;
    }

    const firstLineSegments = inputLines[0].split(" "); // Split the first line by spaces

    // Validate number of segments in the first line
    if (firstLineSegments.length < 2) {
        console.error("Error: First line does not contain enough parameters.");
        return 0;
    }

    const depthParameter = Number(firstLineSegments[0]); // Convert the first segment to a number (N)
    const targetPosition = Number(firstLineSegments[1]); // Convert the second segment to a number (X)

    // Validate parsed numbers
    if (isNaN(depthParameter) || isNaN(targetPosition)) {
        console.error("Error: Failed to parse numeric parameters from input.");
        return 0;
    }

    // Call the core recursive function and return its result
    return evaluateBurgerStructure(depthParameter, targetPosition);
}

/**
 * Computes the total number of layers (buns and patties) for a burger of a given depth.
 * This is equivalent to 2^(depth+2) - 3.
 * @param {number} currentDepth The depth level of the burger structure.
 * @returns {number} The total count of all components.
 */
function calculateTotalElements(currentDepth) {
    // Negative depth is not meaningful in this context, return 0.
    if (currentDepth < 0) {
        return 0;
    }
    // Using bit shift for 2^N, which can be faster than Math.pow for integer exponents.
    // (1 << (currentDepth + 2)) is equivalent to Math.pow(2, currentDepth + 2)
    return (1 << (currentDepth + 2)) - 3;
}

/**
 * Determines the total number of 'patty' components within a burger structure of a given depth.
 * This is equivalent to 2^(depth+1) - 1.
 * @param {number} currentDepth The depth level of the burger structure.
 * @returns {number} The total count of 'patty' components.
 */
function calculatePattyCount(currentDepth) {
    // Negative depth implies no patties, so return 0.
    if (currentDepth < 0) {
        return 0;
    }
    // (1 << (currentDepth + 1)) is equivalent to Math.pow(2, currentDepth + 1)
    return (1 << (currentDepth + 1)) - 1;
}

/**
 * Recursively calculates the number of 'patty' components up to a specific target position
 * within a burger structure of a given depth.
 * @param {number} currentDepth The current depth level of the burger structure.
 * @param {number} targetPosition The position to count up to, from the bottom (1-indexed).
 * @returns {number} The count of patties encountered up to the target position.
 */
function evaluateBurgerStructure(currentDepth, targetPosition) {
    // Handle invalid input values
    if (currentDepth < 0 || targetPosition < 0) {
        // Consider this an edge case where no patties can be counted.
        return 0;
    }

    // Base case: A burger of depth 0 consists of a single patty.
    if (currentDepth === 0) {
        return targetPosition >= 1 ? 1 : 0; // If target position is 1 or more, count the patty.
    }

    // If targetPosition is 1 or less, and not depth 0, it means we are before the first patty (bun).
    if (targetPosition <= 1) {
        return 0;
    }

    // Calculate the total size of the sub-burger structure at one level less.
    const lowerLevelSize = calculateTotalElements(currentDepth - 1);
    const middleBunIndex = lowerLevelSize + 1; // Position of the middle bun.

    // If targetPosition falls within the first half of the structure (lower bun, sub-burger, middle bun)
    if (targetPosition <= middleBunIndex) {
        // Recursively evaluate the sub-burger, effectively skipping the bottom bun.
        return evaluateBurgerStructure(currentDepth - 1, targetPosition - 1);
    } else {
        // The targetPosition is in the second half (after the middle bun).
        // This includes the full patty count of the lower-level burger,
        // plus the middle patty itself, and then recursively evaluate the upper sub-burger.

        const lowerLevelPattyCount = calculatePattyCount(currentDepth - 1); // Patties in the lower sub-burger
        const pattiesBeforeUpperHalf = lowerLevelPattyCount + 1; // Lower sub-burger patties + middle patty

        // Adjust target position for the upper sub-burger:
        // targetPosition - middleBunIndex - 1 (for the middle patty)
        const adjustedTargetForUpperHalf = targetPosition - middleBunIndex - 1;

        return pattiesBeforeUpperHalf + evaluateBurgerStructure(currentDepth - 1, adjustedTargetForUpperHalf);
    }
}

// Execute the main processing function with input read from standard input.
// This is a common pattern for competitive programming or utility scripts.
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin'; // Standard path for input in many environments

try {
    const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    const finalResult = processInput(rawInputContent);
    console.log(finalResult); // Output the computed result
} catch (error) {
    console.error("An error occurred during file reading or processing:", error.message);
    // Optionally exit with a non-zero status code to indicate failure
    process.exit(1);
}