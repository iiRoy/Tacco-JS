var memoTable = [];

// Initialize the 2D array 'memoTable' with zeros.
// The outer loop goes from 0 to 10 (inclusive), representing 'count'.
for (var idx = 0; idx <= 10; idx++) {
    memoTable[idx] = []; // Create an inner array for each 'count'
    // The inner loop goes from 0 to 330 (inclusive), representing 'sum'.
    for (var val = 0; val <= 330; val++) {
        memoTable[idx][val] = 0; // Set initial value to zero
    }
}

// 'digitTracker' keeps track of which digits (0-9) have been used in the current combination.
var digitTracker = [];
// Initialize all entries in 'digitTracker' to 'false', meaning no digits are used initially.
for (var idx = 0; idx <= 9; idx++) {
    digitTracker[idx] = false;
}

/**
 * This recursive function calculates and stores the number of ways to achieve a specific
 * weighted sum using unique digits.
 *
 * @param {number} currentSum   - The accumulated weighted sum for the current combination.
 * @param {number} currentCount - The current number of digits processed (acts as a weight multiplier).
 */
function calculateCombinations(currentSum, currentCount) {
    // Increment the counter in 'memoTable' for the current (currentCount, currentSum) pair.
    memoTable[currentCount][currentSum]++;

    // Base case: If 11 digits have been processed, stop the recursion.
    // This implies combinations of length 11 (from count 0 to 10).
    if (currentCount === 11) {
        return;
    }

    // Iterate through all possible digits from 0 to 9.
    for (var idx = 0; idx <= 9; idx++) {
        // If the current digit 'idx' has already been used in this combination, skip it.
        if (digitTracker[idx]) {
            continue;
        }

        // Mark the current digit 'idx' as used.
        digitTracker[idx] = true;
        // Recursively call the function with an updated sum and incremented count.
        // The digit 'idx' is multiplied by 'currentCount' to get its weighted value.
        calculateCombinations(currentSum + idx * currentCount, currentCount + 1);
        // Backtrack: Unmark the current digit 'idx' as used, allowing it to be used in other branches.
        digitTracker[idx] = false;
    }
}

// Initiate the recursive calculation process starting with a sum of 0 and a count of 0.
calculateCombinations(0, 0);

// Read the entire content from standard input as a UTF-8 string.
var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Trim any leading/trailing whitespace from the content and split it into an array of lines.
var lineArray = fileContent.trim().split("\n");

// Process each line from the input array.
lineArray.forEach(function(lineStr) {
    // Split the current line by space and convert each part to a number.
    var numStrings = lineStr.split(" ").map(Number);
    // The first number is 'n' (representing count in the problem context).
    var countParam = numStrings[0];
    // The second number is 's' (representing sum in the problem context).
    var sumParam = numStrings[1];

    // Output the pre-calculated value from 'memoTable'.
    // Note: The problem uses 'n+1' as the index for the count dimension.
    console.log(memoTable[countParam + 1][sumParam]);
});
