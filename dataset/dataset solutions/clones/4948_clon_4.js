'use strict';

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const totalCount = +inputLines[0];
const valueStrings = inputLines[1].split(' ');

// Create a map from value (1-indexed) to its original position (0-indexed)
// e.g., valuePositionMap[value - 1] = index
let valuePositionMap = new Array(totalCount);
for (let k = 0; k < totalCount; k++) {
    valuePositionMap[+valueStrings[k] - 1] = k;
}

let totalAccumulator = 0;

// This recursive function calculates the sum of minimums for all subarrays
// within the specified range [currentLeft, currentRight],
// considering values starting from 'minValSearchStart' as potential minimums.
function computeRangeMinimumSum(currentLeft, currentRight, minValSearchStart) {
    // Base case: If the range is invalid or empty, it contributes nothing.
    if (currentLeft > currentRight) {
        return 0;
    }

    // Base case: If the range contains a single element, that element is the minimum
    // for the only subarray it forms, and its value is added directly.
    if (currentLeft === currentRight) {
        return +valueStrings[currentLeft];
    }

    // Find the smallest value (actualMinElement) whose original index
    // (pivotLocation) falls within the current [currentLeft, currentRight] range.
    let actualMinElement = minValSearchStart;
    let pivotLocation = valuePositionMap[actualMinElement - 1];

    // Increment actualMinElement until its corresponding index is within the current bounds.
    while (pivotLocation < currentLeft || pivotLocation > currentRight) {
        actualMinElement++;
        pivotLocation = valuePositionMap[actualMinElement - 1];
    }

    const pivotElementValue = +valueStrings[pivotLocation];

    // Calculate the contribution of this 'pivotElementValue' as the minimum
    // for all subarrays that contain it and are fully within [currentLeft, currentRight].
    // (pivotLocation - currentLeft + 1) is the number of possible start positions for such subarrays.
    // (currentRight - pivotLocation + 1) is the number of possible end positions for such subarrays.
    const currentRangeContribution = pivotElementValue *
                                     (pivotLocation - currentLeft + 1) *
                                     (currentRight - pivotLocation + 1);

    // Recursively calculate contributions from the left and right sub-ranges.
    // For these sub-ranges, the search for the next minimum element should start
    // from 'actualMinElement + 1', as 'actualMinElement' has already been processed.
    const leftSubRangeSum = computeRangeMinimumSum(currentLeft, pivotLocation - 1, actualMinElement + 1);
    const rightSubRangeSum = computeRangeMinimumSum(pivotLocation + 1, currentRight, actualMinElement + 1);

    // The total sum for this range is the current contribution plus the sums from sub-ranges.
    return currentRangeContribution + leftSubRangeSum + rightSubRangeSum;
}

// Initiate the recursive calculation for the entire array, starting with value 1 as the smallest candidate.
totalAccumulator = computeRangeMinimumSum(0, totalCount - 1, 1);

console.log(totalAccumulator);
