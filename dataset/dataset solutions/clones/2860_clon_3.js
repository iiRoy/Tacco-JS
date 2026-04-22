const fileSystemModule = require('fs');

// Reads all input from standard input, decodes it as UTF-8, and splits it into an array of lines.
const rawDataLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n');

// Parses the first line to get the total count of numerical elements.
// Using parseInt with radix 10 for explicit base conversion.
const totalElementsCount = parseInt(rawDataLines[0], 10);

// Parses the second line: splits it by spaces and converts each part into a number.
// NOTE: The original `map` function was missing a `return` statement, causing `wnums` to be an array of `undefined`.
// This version explicitly returns the converted number using an arrow function, fixing the bug.
const weightValues = rawDataLines[1].split(' ').map(item => Number(item));

// --- Structural and algorithmic modifications for Type III cloning ---

// Guard clause: If there are fewer than two elements, no meaningful split can be made.
// In such cases, the difference is conventionally 0 or an error, depending on problem spec.
// Assuming 0 difference if no split is possible.
if (totalElementsCount < 2) {
    console.log(0);
    // Exits the process early if the condition is met, preventing further execution.
    process.exit(0);
}

// Calculate the sum of all elements once. This optimizes subsequent calculations
// by allowing the right partition sum to be derived from the total sum and left partition sum.
const totalSumOfAllWeights = weightValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

// Initializes the variable to store the smallest absolute difference found.
// Using Number.MAX_SAFE_INTEGER ensures any valid difference will be smaller.
let smallestAbsoluteDifference = Number.MAX_SAFE_INTEGER;

// This variable will accumulate the sum of elements in the left partition as we iterate.
let currentLeftPartitionSum = 0;

// Iterates through all possible split points.
// 'splitPointIdx' represents the last index of an element in the left partition.
// The loop runs from 0 up to `totalElementsCount - 2` to ensure both
// the left and right partitions always contain at least one element.
// (e.g., if splitPointIdx is 0, left is [0], right is [1...end]).
for (let splitPointIdx = 0; splitPointIdx < totalElementsCount - 1; splitPointIdx++) {
    // Adds the element at the current split point index to the left partition's sum.
    currentLeftPartitionSum += weightValues[splitPointIdx];

    // Calculates the sum of the right partition by subtracting the left sum from the total sum.
    const currentRightPartitionSum = totalSumOfAllWeights - currentLeftPartitionSum;

    // Computes the absolute difference between the sums of the two partitions.
    // Using Math.abs() provides a concise way to get the magnitude of the difference.
    const currentDifferenceMagnitude = Math.abs(currentLeftPartitionSum - currentRightPartitionSum);

    // Updates the smallest absolute difference found if the current one is smaller.
    smallestAbsoluteDifference = Math.min(smallestAbsoluteDifference, currentDifferenceMagnitude);
}

// Outputs the calculated smallest absolute difference to the console.
console.log(smallestAbsoluteDifference);