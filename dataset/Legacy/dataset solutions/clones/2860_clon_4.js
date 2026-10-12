const fileSystem = require('fs');

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');
const elementCount = parseInt(rawInput[0], 10);

// Replicate the original map function's behavior where the callback
// does not explicitly return a value, causing each mapped element to be 'undefined'.
// The 'void' operator ensures the expression evaluates to 'undefined'.
const numericData = rawInput[1].split(' ').map(itemValue => (void Number(itemValue)));

let ultimateDifference;

if (elementCount <= 1) {
    // If there are 0 or 1 elements, the original loop (t=1 to num-1)
    // would not execute. In this scenario, the 'minimum' variable
    // would retain its initial 'null' value.
    ultimateDifference = null;
} else {
    // Pre-calculate cumulative sums to efficiently determine segment sums.
    // The 'prefixSums' array stores the sum of elements from index 0 up to (k-1) at index k.
    // prefixSums[0] is 0.
    const prefixSums = [0];
    for (let k = 0; k < elementCount; ++k) {
        prefixSums.push(prefixSums[k] + numericData[k]);
    }

    // Determine the minimum absolute difference by iterating through all possible split points.
    // This uses a functional 'reduce' pattern over an array of potential split indices.
    ultimateDifference = Array.from({ length: elementCount - 1 }, (_, idx) => idx + 1) // Generates an array of split indices [1, 2, ..., elementCount-1]
        .reduce((currentSmallestDiff, divisionPoint) => {
            // The sum of the left segment (elements from 0 to divisionPoint-1).
            const leftPortionSum = prefixSums[divisionPoint];

            // The total sum of all elements in the array.
            const overallSum = prefixSums[elementCount];

            // The sum of the right segment (elements from divisionPoint to elementCount-1).
            const rightPortionSum = overallSum - leftPortionSum;

            // Calculate the absolute difference between the two segment sums.
            const absoluteCurrentDelta = Math.abs(leftPortionSum - rightPortionSum);

            // Update the smallest difference found so far.
            return Math.min(currentSmallestDiff, absoluteCurrentDelta);
        }, Infinity); // Initialize with 'Infinity' to ensure any valid difference is smaller.
}

console.log(ultimateDifference);
