/**
 * This module provides a refined algorithm for optimizing travel across a linear track.
 * It processes raw input data, simulates a traveler's movement between points,
 * and calculates the cumulative 'cost' based on specific path selection rules.
 * The primary goal is to demonstrate a Type III code clone, introducing
 * structural modifications, enhanced validation, and extensive renaming.
 */

// Define a main processing function with an updated name and clearer purpose.
function processTrackTraversalOptimizer(inputRawString) {
    // --- Input Validation and Initial Data Extraction (Type III additions) ---

    // Ensure the input string is valid and not empty.
    if (typeof inputRawString !== 'string' || inputRawString.trim() === '') {
        console.error("Input error: Provided data is not a valid string or is empty.");
        // Early exit for invalid input.
        return;
    }

    // Split the entire input into an array of lines, removing any leading/trailing whitespace.
    const allInputLines = inputRawString.trim().split('\n');

    // Verify minimum required lines for parameters and at least one item.
    if (allInputLines.length < 2) {
        console.error("Input error: Insufficient number of lines. Expected at least two lines (parameters + items).");
        return;
    }

    // Extract the first line which contains global parameters.
    const parameterLineComponents = allInputLines[0].split(' ');

    // Parse the track's maximum boundary (L) and the count of items (N).
    // Using Number() for explicit conversion and robustness.
    const trackMaximumBoundary = Number(parameterLineComponents[0]);
    const totalItemsExpected = Number(parameterLineComponents[1]);

    // Validate the parsed numerical parameters.
    if (isNaN(trackMaximumBoundary) || trackMaximumBoundary <= 0 ||
        isNaN(totalItemsExpected) || totalItemsExpected < 0) {
        console.error("Input error: Invalid track boundary or total item count specified.");
        return;
    }

    // --- Item Position Preparation (Type II & III changes) ---

    // Create a new array containing only the item position strings, skipping the parameter line.
    // Using slice(1) to avoid mutating the original inputLines array.
    const rawItemPositionStrings = allInputLines.slice(1);

    // Convert string positions to numbers and filter out any invalid entries.
    // This adds an intermediate step and a validation filter.
    let activeItemLocations = rawItemPositionStrings
        .map(positionStr => Number(positionStr.trim())) // Trim whitespace from each position string
        .filter(num => !isNaN(num) && num >= 0 && num <= trackMaximumBoundary); // Ensure positions are valid numbers within track bounds

    // Optional warning if the number of valid items doesn't match the expected count.
    if (activeItemLocations.length !== totalItemsExpected) {
        console.warn(`Data discrepancy: Expected ${totalItemsExpected} items, but found ${activeItemLocations.length} valid item locations.`);
        // The algorithm will proceed with `activeItemLocations.length` items if fewer are valid.
    }

    // --- Simulation State Initialization (Type II changes) ---

    // Initialize the traveler's starting point (usually 0).
    let currentTravelerPosition = 0;
    // Initialize the cumulative cost of traversal.
    let totalPathCostAccumulated = 0;

    // --- Traversal Simulation Loop (Type II & III changes) ---

    // Iterate for the expected number of items.
    for (let iterationCounter = 0; iterationCounter < totalItemsExpected; iterationCounter++) {
        // Guard clause: If no items are left to process, break the loop early.
        if (activeItemLocations.length === 0) {
            // This can happen if `totalItemsExpected` was higher than actual valid items.
            break;
        }

        // Identify the leftmost and rightmost available items from the current set.
        const leftmostAvailableItem = activeItemLocations[0];
        const rightmostAvailableItem = activeItemLocations[activeItemLocations.length - 1];

        // Calculate the cost for two potential movement strategies:

        // Strategy 1: Move directly to the leftmost item (assuming positive movement).
        // This cost is simply the difference from the current position to the target.
        const costToReachLeftmostDirectly = leftmostAvailableItem - currentTravelerPosition;

        // Strategy 2: Move to the rightmost item via track boundaries (0 and L).
        // This cost is calculated as:
        // (distance from current position to 0) + (distance from track boundary L to the rightmost item)
        // This implies a path: currentTravelerPosition -> 0 -> L -> rightmostAvailableItem
        const costToReachRightmostViaBoundary = currentTravelerPosition + (trackMaximumBoundary - rightmostAvailableItem);

        // Decision Logic: Compare the two calculated costs.
        // The original problem's logic was to choose the path with the *greater* cost if it was strictly greater,
        // otherwise choose the other path. We maintain this specific decision rule.
        if (costToReachLeftmostDirectly > costToReachRightmostViaBoundary) {
            // If the direct path to the leftmost item is more "expensive", choose it.
            totalPathCostAccumulated += costToReachLeftmostDirectly;
            currentTravelerPosition = leftmostAvailableItem;
            // Remove the collected item from the beginning of the list.
            activeItemLocations.shift();
        } else {
            // Otherwise (if direct path is less than or equal to boundary path cost), choose the boundary path.
            totalPathCostAccumulated += costToReachRightmostViaBoundary;
            currentTravelerPosition = rightmostAvailableItem;
            // Remove the collected item from the end of the list.
            activeItemLocations.pop();
        }
    }

    // --- Final Output (Type II change) ---

    // Display the final accumulated cost after all items have been processed.
    console.log(totalPathCostAccumulated);
}

// --- Input Acquisition and Execution (Type III addition for robustness) ---

// This block handles reading input from stdin, which is common in competitive programming.
try {
    // Attempt to read the entire file content from standard input.
    // Ensure 'fs' module is available in the execution environment (e.g., Node.js).
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Execute the main processing function with the obtained input.
    processTrackTraversalOptimizer(fileContents);
} catch (error) {
    // Catch and report any errors during file reading or processing.
    console.error("Execution error: Could not process input from /dev/stdin. Details:", error.message);
    // Optionally, for local testing or debugging, one might call the function with a hardcoded string:
    // processTrackTraversalOptimizer("10 3\n1\n5\n8");
}