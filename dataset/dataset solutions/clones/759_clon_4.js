const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = rawData.trim().split('\n');

let lineCursor = 0;
while (lineCursor < dataSegments.length) {
    const currentCountString = dataSegments[lineCursor];
    if (currentCountString === '0') {
        break;
    }
    const elementCount = parseInt(currentCountString, 10);
    lineCursor++; // Advance to the line with numbers

    if (lineCursor >= dataSegments.length) { // Handle incomplete input
        break;
    }

    const numericValues = dataSegments[lineCursor].split(' ').map(Number);
    console.log(calculateSmallestAbsoluteDifference(numericValues, elementCount));
    lineCursor++; // Advance to the next count line
}

function calculateSmallestAbsoluteDifference(sourceValues, effectiveCount) {
    // Original behavior: if effectiveCount < 2, the nested loops in findMinDiff
    // would not execute, and the uninitialized 'diff' variable would be returned,
    // resulting in 'undefined'. This clone replicates that specific behavior.
    if (effectiveCount < 2) {
        return undefined;
    }

    // Create a working set of values, respecting the effectiveCount limit.
    // This handles cases where effectiveCount > sourceValues.length by effectively ignoring
    // elements beyond sourceValues.length, as Math.abs(undefined - num) would be NaN,
    // which doesn't update minDiff.
    const relevantValues = sourceValues.slice(0, effectiveCount);

    // If after slicing, we still don't have enough elements to form a pair, return undefined.
    // This covers scenarios like sourceValues = [1, 2, 3], effectiveCount = 1.
    if (relevantValues.length < 2) {
        return undefined;
    }

    // Different core logic: Sort the array and find the minimum difference between adjacent elements.
    // This is an O(N log N) approach, substantially different from the original's O(N^2) nested loops.
    relevantValues.sort((valA, valB) => valA - valB);

    let minimumAbsoluteDifference = Infinity;

    // Iterate through the sorted array to find the smallest difference between adjacent elements.
    // In a sorted array, the minimum difference between any two elements must be between adjacent ones.
    for (let index = 0; index < relevantValues.length - 1; index++) {
        const currentPairDifference = Math.abs(relevantValues[index + 1] - relevantValues[index]);
        if (currentPairDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = currentPairDifference;
        }
    }

    return minimumAbsoluteDifference;
}
