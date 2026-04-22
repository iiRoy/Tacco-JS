// A skilled developer's note: This script processes numerical data from standard input
// to identify valid triangle formations among selected elements.

// --- Input Processing Section ---
// Acquire raw data from the standard input stream.
const rawInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Split the content into individual lines for further parsing.
const contentLines = rawInputContent.trim().split('\n');

// Validate minimum number of lines for processing.
if (contentLines.length < 2) {
    // A simple validation for critical input structure.
    console.error("Error: Insufficient input lines. Expected at least 2.");
    process.exit(1); // Exit with an error code.
}

// Parse the first line to determine the upper bound for index selection.
// Explicitly convert to integer to prevent potential type coercion issues.
const maxIndexValue = parseInt(contentLines[0], 10);

// Parse the second line, splitting by space and converting each segment to a number.
// This array represents the available side lengths.
const availableSideLengths = contentLines[1].split(' ').map(val => parseInt(val, 10));

// --- Combination Generation Utility ---
/**
 * Recursively generates all unique combinations of numbers from 1 up to 'upperLimit',
 * where each combination has 'size' elements and elements within a combination are in ascending order.
 * This is a backtracking algorithm.
 * @param {number} size - The desired number of elements in each combination.
 * @param {number} upperLimit - The maximum value an element in a combination can take.
 * @returns {Array<Array<number>>} An array of arrays, where each inner array is a combination.
 */
const generateIndexCombinations = (size, upperLimit) => {
    const allFoundCombinations = []; // Stores all complete combinations
    const currentWorkingCombination = []; // Stores the combination being built

    /**
     * Internal recursive helper for backtracking.
     * @param {number} startFrom - The starting number for the current level of recursion.
     */
    const backtrackAndBuild = (startFrom) => {
        // Base case: If the current combination has reached the target size,
        // add a copy to the results and return.
        if (currentWorkingCombination.length === size) {
            allFoundCombinations.push([...currentWorkingCombination]);
            return;
        }

        // Recursive step: Iterate from 'startFrom' up to 'upperLimit'.
        for (let numCandidate = startFrom; numCandidate <= upperLimit; numCandidate++) {
            // Pruning optimization: If there aren't enough remaining numbers
            // (including the current candidate) to form a combination of 'size',
            // then further iterations in this loop won't yield valid results.
            // (upperLimit - numCandidate) is numbers remaining from numCandidate to upperLimit
            // (size - currentWorkingCombination.length - 1) is numbers we still need besides numCandidate
            if ((upperLimit - numCandidate) < (size - currentWorkingCombination.length - 1)) {
                break;
            }

            // Include the current candidate number in the combination.
            currentWorkingCombination.push(numCandidate);

            // Recurse with the next number, ensuring elements are unique and increasing.
            backtrackAndBuild(numCandidate + 1);

            // Backtrack: Remove the last added number to explore other possibilities.
            currentWorkingCombination.pop();
        }
    };

    // Initiate the backtracking process starting from 1.
    backtrackAndBuild(1);
    return allFoundCombinations;
};

// --- Triangle Validation Helper ---
/**
 * Determines if three given side lengths can form a valid non-degenerate triangle.
 * Also checks if all sides are distinct.
 * @param {number} s1 - Length of the first side.
 * @param {number} s2 - Length of the second side.
 * @param {number} s3 - Length of the third side.
 * @returns {boolean} True if a valid triangle can be formed with distinct sides, false otherwise.
 */
const checkTriangleValidity = (s1, s2, s3) => {
    // Early exit for non-positive side lengths (implicitly handled by problem context, but good practice)
    if (s1 <= 0 || s2 <= 0 || s3 <= 0) {
        return false;
    }

    // Check for distinctness of side lengths.
    // If any two sides are equal, it's not considered for counting as per problem logic.
    if (s1 === s2 || s1 === s3 || s2 === s3) {
        return false;
    }

    // Apply the triangle inequality theorem:
    // The sum of the lengths of any two sides of a triangle must be greater than the length of the third side.
    // To optimize, sort the sides and only check the longest side against the sum of the others.
    const sortedSides = [s1, s2, s3].sort((a, b) => a - b);
    return sortedSides[0] + sortedSides[1] > sortedSides[2];
};


// --- Main Execution Logic ---
// Generate all possible triplets of indices (1-based) from 1 to maxIndexValue.
// Each triplet will have 3 distinct, ascending numbers.
const potentialIndexTriplets = generateIndexCombinations(3, maxIndexValue);

let totalValidTriangleCount = 0; // Initialize counter for valid triangles.

// Iterate through each generated index triplet.
for (let tripletIdx = 0; tripletIdx < potentialIndexTriplets.length; tripletIdx++) {
    const currentTriplet = potentialIndexTriplets[tripletIdx];

    // Retrieve the actual side lengths from the 'availableSideLengths' array
    // using the 0-indexed values derived from the 1-indexed triplet elements.
    const sideA = availableSideLengths[currentTriplet[0] - 1];
    const sideB = availableSideLengths[currentTriplet[1] - 1];
    const sideC = availableSideLengths[currentTriplet[2] - 1];

    // Validate if the selected side lengths form a valid triangle with distinct side values.
    if (checkTriangleValidity(sideA, sideB, sideC)) {
        totalValidTriangleCount++; // Increment the counter if valid.
    }
}

// Output the final count of valid triangles.
console.log(totalValidTriangleCount);