const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Helper function to determine the count of prefix subarrays
// (starting from a given position) where sum equals XOR sum.
const findMatchingPrefixCount = (sourceArr, startPos, totalArrayLength) => {
    let currentSumAccumulator = sourceArr[startPos];
    let currentXorAccumulator = sourceArr[startPos];
    let matchingSubarrayCount = 1; // The single element subarray always matches

    // Iterate to extend the subarray, starting from the second element
    // 'offset' represents the index relative to 'startPos'
    for (let offset = 1; offset < totalArrayLength; offset++) {
        const absoluteIndexForNextElement = startPos + offset;

        // Retrieve the next element. If absoluteIndexForNextElement is out of bounds,
        // nextElementValue will be 'undefined'. This behavior is critical to preserve.
        const nextElementValue = sourceArr[absoluteIndexForNextElement];

        // Calculate potential new sum and XOR sum
        const candidateSum = currentSumAccumulator + nextElementValue;
        const candidateXor = currentXorAccumulator ^ nextElementValue;

        // Check if the sum and XOR sum are equal.
        // If nextElementValue was undefined, candidateSum and candidateXor will be NaN.
        // NaN === NaN evaluates to false, correctly breaking the loop.
        if (candidateSum === candidateXor) {
            currentSumAccumulator = candidateSum;
            currentXorAccumulator = candidateXor;
            matchingSubarrayCount++;
        } else {
            // If they don't match, or if NaN was produced, stop extending this subarray.
            break;
        }
    }
    return matchingSubarrayCount;
};

((inputString) => {
    const dataLines = inputString.split('\n');

    // Parse the number of elements (N)
    const numElements = parseInt(dataLines[0], 10);

    // Parse the array of numbers (A)
    const valArray = dataLines[1].split(' ').map(val => parseInt(val, 10));

    let overallMatchTotal = 0;

    // Iterate through all possible starting positions for subarrays
    // (equivalent to the original 'sp' loop)
    for (let currentStartIdx = 0; currentStartIdx < numElements; currentStartIdx++) {
        // For each starting position, calculate how many consecutive elements
        // form a sum-equals-xor-sum prefix.
        const matchesFromCurrentStart = findMatchingPrefixCount(valArray, currentStartIdx, numElements);
        overallMatchTotal += matchesFromCurrentStart;
    }

    console.log(overallMatchTotal);

})(rawData);
