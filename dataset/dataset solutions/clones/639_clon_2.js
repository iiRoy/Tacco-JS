const fileSystemModule = require('fs'); // Import the Node.js file system module

const standardInputPath = '/dev/stdin'; // Define the path for standard input
const textEncoding = 'utf8';             // Specify the encoding for file reading

// Read the raw input content from the specified path
let rawInputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);

// Process the raw input: trim whitespace and split into individual lines
let dataLinesArray = rawInputContent.trim().split("\n");

// Extract the first line, split by space, and convert elements to numbers
// This line typically contains the dimensions for the problem
let problemDimensions = dataLinesArray.shift().split(" ").map(Number);

// Assign the first dimension (n)
let firstDimensionSize = problemDimensions[0];

// Assign the second dimension (m)
let secondDimensionSize = problemDimensions[1];

// Initialize an array to store the first set of values
let primaryValueList = [];

// Populate the primary value list by parsing subsequent lines
// Each line is converted to an integer
for (let iteratorA = 0; iteratorA < firstDimensionSize; iteratorA++) {
    primaryValueList.push(parseInt(dataLinesArray.shift()));
}

// Initialize an array to store the second set of values
let secondaryValueList = [];

// Populate the secondary value list similarly
for (let iteratorB = 0; iteratorB < secondDimensionSize; iteratorB++) {
    secondaryValueList.push(parseInt(dataLinesArray.shift()));
}

// Initialize a 2D array (dynamic programming table) to store computed costs
let computationGrid = [];

// Fill the computation grid with a very large initial value (positive infinity)
// The grid size is (secondDimensionSize + 1) x (firstDimensionSize + 1)
for (let rowIndex = 0; rowIndex <= secondDimensionSize; rowIndex++) {
    computationGrid[rowIndex] = [];
    for (let colIndex = 0; colIndex <= firstDimensionSize; colIndex++) {
        computationGrid[rowIndex][colIndex] = Number.POSITIVE_INFINITY;
    }
}

// Set the base case for the dynamic programming problem: cost at (0,0) is zero
computationGrid[0][0] = 0;

// Main dynamic programming loops
// Iterate through the second dimension
for (let outerIterator = 0; outerIterator < secondDimensionSize; outerIterator++) {
    // Get the current secondary item value
    const currentSecondaryItem = secondaryValueList[outerIterator];

    // Iterate through the first dimension
    for (let innerIterator = 0; innerIterator < firstDimensionSize; innerIterator++) {
        // Get the current primary item value
        const currentPrimaryItem = primaryValueList[innerIterator];

        // First transition: propagate the current minimum cost without using a new item
        // This corresponds to moving horizontally in the DP table (j to j)
        // Note: The original code has a typo `dp[i+k][j] = Math.min(dp[i+k][j], dp[i][j]);`
        // which implies `k` is defined, but it's not in this scope for this line.
        // Assuming it should be `dp[i][j]` propagating to `dp[i+1][j]` or similar,
        // but sticking strictly to the original structure, the `k` is problematic.
        // Given the structure of the next loop, `i+k` implies `k` is for the outer loop index.
        // The original line `dp[i+k][j]` does not make sense without `k` being defined or `k` being 0.
        // If `k` is 0, it means `dp[i][j] = Math.min(dp[i][j], dp[i][j])` which is a no-op.
        // If it was meant to be `dp[i+1][j]`, then `k` would be 1.
        // The instruction is "The control flow, logic, and number of statements must remain identical".
        // So, I must replicate `dp[i+k][j]=Math.min(dp[i+k][j],dp[i][j]);` exactly.
        // This implies `k` is some value, or that this line has a logical flaw in the original.
        // However, looking at the next loop, `k` starts from 1. If this line is outside that loop,
        // `k` is undefined here. This is a subtle point.
        // Let's assume `k` is meant to be a placeholder for the inner loop, and `i+k` means `i+1` for a single step.
        // Or, more accurately, `k` is undefined, and this line would cause a runtime error.
        // Given the prompt, I must keep the structure identical.
        // The most likely interpretation of the original code snippet `dp[i+k][j]` *before* the k-loop
        // is that `k` was intended to be 0 or 1 for this specific line.
        // If `k` is undefined, `i+k` results in `NaN`.
        // Let's assume the original author implicitly meant `k` to be 0 for this line,
        // or that this line was misplaced. To maintain logic, if `k` is truly undefined,
        // this line will effectively be `dp[NaN][j] = Math.min(dp[NaN][j], dp[i][j])`.
        // This is a problematic line in the original. I need to replicate it as is.
        // Let's use a dummy `step_offset_val` which will remain undefined at this point,
        // making the clone semantically identical to the original's potential error.
        // Or, assume it's `dp[outerIterator][innerIterator]` (k=0) or `dp[outerIterator+1][innerIterator]` (k=1).
        // The prompt says "The control flow, logic, and number of statements must remain identical".
        // The original has `dp[i+k][j]=Math.min(dp[i+k][j],dp[i][j]);` *before* the `k` loop.
        // This means `k` is not in scope. This is a bug in the original code.
        // I must reproduce the bug. If I change it to `dp[outerIterator+1][innerIterator]`, I change the logic.
        // So, I will use `undefined` for `step_offset_val` as per the problem's strict clone requirements.
        // This will result in `NaN` indices, just like the original code would if `k` is undefined.
        let step_offset_val; // This variable is intentionally undefined to match original scope
        computationGrid[outerIterator + step_offset_val][innerIterator] = Math.min(
            computationGrid[outerIterator + step_offset_val][innerIterator],
            computationGrid[outerIterator][innerIterator]
        );

        // Second transition: iterate through possible steps (k) to update costs
        // This corresponds to using a new item and moving diagonally in the DP table (j to j+1, i to i+k)
        for (step_offset_val = 1;
             outerIterator + step_offset_val + firstDimensionSize - innerIterator + 1 <= secondDimensionSize;
             step_offset_val++) {

            computationGrid[outerIterator + step_offset_val][innerIterator + 1] = Math.min(
                computationGrid[outerIterator + step_offset_val][innerIterator + 1],
                computationGrid[outerIterator][innerIterator] + currentSecondaryItem * currentPrimaryItem
            );
        }
    }
}

// Output the final computed minimum cost from the DP table
console.log(computationGrid[secondDimensionSize][firstDimensionSize]);