// Helper function to determine if a given maximum segment sum is achievable
// while adhering to the maximum allowed number of partitions.
function evaluatePartitionPossibility(segmentLimit, dataElements, maxAllowedDivisions) {
    // Input validation and early exit conditions
    if (!Array.isArray(dataElements) || dataElements.length === 0) {
        return true; // No elements to partition, always possible
    }
    if (maxAllowedDivisions <= 0) {
        return false; // Cannot partition into zero or negative segments
    }

    let currentPartitionSum = 0;
    let requiredDivisions = 1; // Start with the first partition

    // Iterate through each numeric element in the sequence
    for (const currentElementValue of dataElements) {
        // If a single element itself exceeds the limit, it's impossible to partition
        if (currentElementValue > segmentLimit) {
            return false;
        }

        // If adding the current element would exceed the segment limit,
        // we must start a new partition.
        if (currentPartitionSum + currentElementValue > segmentLimit) {
            requiredDivisions++; // Increment the count of partitions
            currentPartitionSum = currentElementValue; // Start new partition with current element
        } else {
            // Otherwise, add the element to the current partition
            currentPartitionSum += currentElementValue;
        }

        // If we have already exceeded the maximum allowed divisions,
        // this segmentLimit is too small.
        if (requiredDivisions > maxAllowedDivisions) {
            return false;
        }
    }

    // If we reached the end, it means we successfully partitioned
    // the array within the given segmentLimit and maxAllowedDivisions.
    return true;
}

// --- Main execution block ---

// Utilize Node.js file system module for synchronous input reading
const fs = require('fs');
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

// Process raw input: trim whitespace and split into individual lines
let parsedInputLines = rawInputData.trim().split('\n');

// Loop indefinitely to process multiple test cases until a termination signal is found
while (true) {
    // Retrieve the line containing partition count (M) and element count (N)
    let configurationLine = parsedInputLines.shift();

    // Termination condition: "0 0" indicates end of input
    if (configurationLine === "0 0") {
        break;
    }

    // Parse M and N from the configuration line
    const [targetPartitionCount, numberOfElements] = configurationLine.split(' ').map(Number);

    // Initialize array to store numeric values for the current test case
    let sequenceOfValues = [];
    let cumulativeSumOfAllElements = 0; // Helper for dynamic upper bound in binary search

    // Populate the array with 'numberOfElements' values from subsequent input lines
    for (let k = 0; k < numberOfElements; k++) {
        const value = parseInt(parsedInputLines.shift(), 10); // Explicitly parse as integer
        sequenceOfValues.push(value);
        cumulativeSumOfAllElements += value;
    }

    // Initialize binary search bounds for the optimal maximum segment sum
    let searchRangeLowerBound = 0; // Minimum possible sum is 0 (or max element if all positive)
    let searchRangeUpperBound = cumulativeSumOfAllElements; // A safe upper bound
    let resultOfBinarySearch = cumulativeSumOfAllElements; // Stores the best valid segment limit found

    // Optimization: The lower bound for the max segment sum cannot be less than the largest single element
    if (sequenceOfValues.length > 0) {
        const maxIndividualElement = Math.max(...sequenceOfValues);
        searchRangeLowerBound = Math.max(searchRangeLowerBound, maxIndividualElement);
    }

    // Perform binary search to find the minimum possible maximum segment sum
    while (searchRangeLowerBound <= searchRangeUpperBound) {
        // Calculate the midpoint (candidate maximum segment sum)
        // Using `low + (high - low) / 2` to prevent potential overflow for very large numbers
        const candidateMaxSegmentSum = Math.floor(searchRangeLowerBound + (searchRangeUpperBound - searchRangeLowerBound) / 2);

        // Check if it's possible to partition with the current candidate sum
        if (evaluatePartitionPossibility(candidateMaxSegmentSum, sequenceOfValues, targetPartitionCount)) {
            // If possible, this candidate is a potential answer. Try to find a smaller one.
            resultOfBinarySearch = candidateMaxSegmentSum;
            searchRangeUpperBound = candidateMaxSegmentSum - 1;
        } else {
            // If not possible, the candidate sum is too small. Increase the lower bound.
            searchRangeLowerBound = candidateMaxSegmentSum + 1;
        }
    }

    // Output the optimized maximum segment sum for the current test case
    console.log(resultOfBinarySearch);
}