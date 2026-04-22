"use strict";

// Define symbolic constants for segment types to improve code readability and maintainability.
const HORIZONTAL_SEGMENT_TYPE = 0;
const VERTICAL_SEGMENT_TYPE = 1;

// --- Input Processing Section ---

// Acquire raw input data from standard input, interpreting it as UTF-8 text.
const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

// Tokenize the input string by splitting it based on any sequence of whitespace characters.
// The filter(Boolean) method removes any empty strings that might result from multiple delimiters.
const tokenStream = dataSource.split(/\s+/).filter(Boolean);
let tokenIndex = 0; // Initialize an index to keep track of the current token being read.

/**
 * Retrieves the next token from the input stream and converts it into an integer.
 * This function handles sequential access to the input data.
 * @returns {number} The integer value of the next available token.
 */
function getNextIntegerToken() {
    // The unary plus operator (`+`) is a concise way to convert a string to a number.
    return +tokenStream[tokenIndex++];
}

// --- Main Program Execution ---

// Invoke the primary problem-solving function and capture its return value.
const computedResult = calculateOptimalPathCost();

// Output the computed result to standard output, ensuring it's always treated as a string.
// A check is included to prevent logging undefined or null if the function might return such.
if (computedResult !== null && computedResult !== undefined) {
    console.log(String(computedResult));
}

// --- Core Problem-Solving Logic ---

/**
 * Determines the minimum total cost required to cut a rectangular grid into unit squares.
 * The cost of each cut (horizontal or vertical) is provided, and the total cost depends
 * on the order of cuts and the number of existing pieces being cut across.
 *
 * This function implements a greedy strategy:
 * 1. Read all horizontal and vertical cut costs.
 * 2. Combine and sort all cut costs in ascending order.
 * 3. Iterate through the sorted cuts, applying the cheapest available cut first.
 *    The cost of each cut is multiplied by the number of pieces it will divide.
 *
 * @returns {BigInt} The calculated minimum total cost. Returns 0n if input dimensions are invalid.
 */
function calculateOptimalPathCost() {
    // Read the dimensions of the grid from the input stream.
    const gridWidth = getNextIntegerToken();  // Represents the number of horizontal cuts to make.
    const gridHeight = getNextIntegerToken(); // Represents the number of vertical cuts to make.

    // --- Type III Addition: Basic Input Validation ---
    // Ensure that grid dimensions are positive, as non-positive dimensions are usually invalid for this problem.
    if (gridWidth <= 0 || gridHeight <= 0) {
        console.error("Error: Grid dimensions must be positive integers. Received W:", gridWidth, "H:", gridHeight);
        return 0n; // Return a default BigInt zero for invalid scenarios.
    }

    // Initialize an array to store all individual segment costs along with their type.
    // Each element will be a tuple: [costValue, segmentType].
    let allSegments = [];

    // Populate the `allSegments` array with horizontal cut costs.
    // Each horizontal cut is assigned the HORIZONTAL_SEGMENT_TYPE.
    for (let currentWidthSegmentIndex = 0; currentWidthSegmentIndex < gridWidth; currentWidthSegmentIndex++) {
        const segmentCostValue = getNextIntegerToken();
        allSegments.push([segmentCostValue, HORIZONTAL_SEGMENT_TYPE]);
    }

    // Populate the `allSegments` array with vertical cut costs.
    // Each vertical cut is assigned the VERTICAL_SEGMENT_TYPE.
    for (let currentHeightSegmentIndex = 0; currentHeightSegmentIndex < gridHeight; currentHeightSegmentIndex++) {
        const segmentCostValue = getNextIntegerToken();
        allSegments.push([segmentCostValue, VERTICAL_SEGMENT_TYPE]);
    }

    // Sort all collected segments based on their cost in ascending order.
    // This greedy approach is key to finding the minimum total cost.
    // --- Type III Update: Using a named comparator function for clarity ---
    const compareSegmentCosts = (segmentA, segmentB) => segmentA[0] - segmentB[0];
    allSegments.sort(compareSegmentCosts);

    // Initialize variables for tracking total cost and counts of cuts made.
    let totalMinimumCost = 0n; // Use BigInt to handle potentially very large sums.
    let processedHorizontalCuts = 0; // Counts horizontal cuts already applied.
    let processedVerticalCuts = 0;   // Counts vertical cuts already applied.

    // Iterate through the sorted segments, applying each cut and accumulating cost.
    // The loop runs for the total number of segments (gridWidth + gridHeight).
    // --- Type III Update: Loop condition uses array length for robustness ---
    for (let segmentIterator = 0; segmentIterator < allSegments.length; segmentIterator++) {
        const currentSegment = allSegments[segmentIterator];
        const currentSegmentCost = BigInt(currentSegment[0]); // Convert cost to BigInt for calculations.
        const currentSegmentKind = currentSegment[1];

        // --- Type III Update: Using a switch statement for cleaner type handling ---
        switch (currentSegmentKind) {
            case HORIZONTAL_SEGMENT_TYPE:
                // When making a horizontal cut, its cost is multiplied by the number of existing vertical pieces.
                // The factor (gridHeight - processedVerticalCuts + 1) represents the number of vertical pieces
                // that this horizontal cut will traverse.
                const numberOfVerticalPieces = BigInt(gridHeight - processedVerticalCuts + 1);
                const costForThisHorizontalCut = currentSegmentCost * numberOfVerticalPieces;
                totalMinimumCost += costForThisHorizontalCut;
                processedHorizontalCuts++; // Increment count of processed horizontal cuts.
                break;

            case VERTICAL_SEGMENT_TYPE:
                // When making a vertical cut, its cost is multiplied by the number of existing horizontal pieces.
                // The factor (gridWidth - processedHorizontalCuts + 1) represents the number of horizontal pieces
                // that this vertical cut will traverse.
                const numberOfHorizontalPieces = BigInt(gridWidth - processedHorizontalCuts + 1);
                const costForThisVerticalCut = currentSegmentCost * numberOfHorizontalPieces;
                totalMinimumCost += costForThisVerticalCut;
                processedVerticalCuts++; // Increment count of processed vertical cuts.
                break;

            default:
                // --- Type III Addition: Error handling for unexpected segment types ---
                console.error(`Warning: Encountered an unrecognized segment type: ${currentSegmentKind}. This segment will be skipped.`);
                break;
        }
    }
    return totalMinimumCost; // Return the final calculated minimum cost.
}