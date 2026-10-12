const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input
const dataRows = rawData.split('\n'); // Split the input string into an array of lines

// Parse the first line as the maximum value for sequence generation
const maxVal = dataRows[0] - 0;

// Parse the second line as a list of numbers
const valueList = dataRows[1].split(' ').map(Number);

/**
 * Generates sequences of numbers with a specified length and upper bound.
 * This function implements a backtracking-like algorithm to produce combinations.
 *
 * @param {number} targetLength - The desired length of each sequence.
 * @param {number} upperBound - The maximum value (exclusive) for numbers in the sequence.
 * @returns {Array<Array<number>>} An array containing all generated sequences.
 */
const generateCombinations = (targetLength, upperBound) => {
    const allCombinations = []; // Stores all complete sequences
    const currentCombination = []; // Stores the sequence being built
    let currentValue = 0; // The current number to consider adding

    // Loop until the backtracking process indicates no more values can be explored
    while (currentValue !== undefined) {
        // If the current sequence has reached the target length, save it and backtrack
        if (currentCombination.length === targetLength) {
            allCombinations.push([...currentCombination]); // Add a copy of the sequence
            currentValue = currentCombination.pop(); // Backtrack: remove last element and get its value
        }
        // If the current value exceeds the upper bound, backtrack
        else if (currentValue >= upperBound) {
            currentValue = currentCombination.pop(); // Backtrack: remove last element and get its value
        }
        // Otherwise, increment the current value and add it to the sequence
        else {
            currentValue++; // Move to the next potential number
            currentCombination.push(currentValue); // Add the number to the current sequence
        }
    }
    return allCombinations; // Return all collected sequences
};

// Generate combinations of length 3 using numbers up to maxVal
const triangleCombinations = generateCombinations(3, maxVal);

let validTriangleCount = 0; // Initialize a counter for valid triangles

// Iterate through each generated combination
for (let idx = 0; idx < triangleCombinations.length; idx++) {
    // Retrieve the side lengths from the valueList using the indices from the current combination
    const currentTriangleSides = [
        valueList[triangleCombinations[idx][0] - 1],
        valueList[triangleCombinations[idx][1] - 1],
        valueList[triangleCombinations[idx][2] - 1]
    ];

    // Check for distinct side lengths (a, b, c must be distinct for a non-degenerate triangle in this context)
    if (currentTriangleSides[0] === currentTriangleSides[1] ||
        currentTriangleSides[0] === currentTriangleSides[2] ||
        currentTriangleSides[1] === currentTriangleSides[2]) {
        continue; // Skip if any two sides are equal
    }

    // Find the longest side among the three
    const longestSide = Math.max(...currentTriangleSides);

    // Calculate the sum of the other two sides
    const otherSidesSum = currentTriangleSides.reduce((accumulator, currentElement) => accumulator + currentElement) - longestSide;

    // Apply the triangle inequality theorem: the sum of any two sides must be greater than the third side.
    // Since 'longestSide' is the largest, we only need to check if 'otherSidesSum' > 'longestSide'.
    if (longestSide < otherSidesSum) {
        validTriangleCount++; // Increment the counter if it forms a valid triangle
    }
}

// Output the total count of valid triangles
console.log(validTriangleCount);
