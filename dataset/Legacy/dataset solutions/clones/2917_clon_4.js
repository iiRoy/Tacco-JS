'use strict';

// Constants
const HUGE_NUMBER = 900719925474099; // Equivalent to INF

// Helper to parse a space-separated string of numbers into an array of integers
const parseNumbers = (lineString) => lineString.split(' ').map(Number);

// Recursive binary search for lower bound
// array: the array to search in
// startIdx: starting index of the search range (inclusive)
// endIdx: ending index of the search range (exclusive)
// targetVal: the value to find the lower bound for
function findBoundaryIndex(array, startIdx, endIdx, targetVal) {
    if (startIdx >= endIdx) {
        return startIdx;
    }

    const midIdx = Math.floor((startIdx + endIdx) / 2);

    if (array[midIdx] < targetVal) {
        return findBoundaryIndex(array, midIdx + 1, endIdx, targetVal);
    } else {
        return findBoundaryIndex(array, startIdx, midIdx, targetVal);
    }
}

// Main processing function
function processInput(rawInput) {
    const inputLines = rawInput.trim().split('\n');

    const [numEntries, numQueries] = parseNumbers(inputLines[0]);

    // Collect entry data using Array.from for different array population
    const entryData = Array.from({ length: numEntries }, (_, index) =>
        parseNumbers(inputLines[index + 1])
    );

    // Collect query values using Array.from for different array population
    const queryValues = Array.from({ length: numQueries }, (_, index) =>
        Number(inputLines[numEntries + index + 1])
    );

    // Sort entryData by the third element (z) in descending order
    entryData.sort((firstItem, secondItem) => secondItem[2] - firstItem[2]);

    const finalResults = new Array(numQueries).fill(-1);

    // Process each entry
    entryData.forEach(currentEntry => {
        const [xCoordinate, yCoordinate, zValue] = currentEntry;

        // Calculate bounds for queryValues based on current entry
        const lowerBoundCriterion = xCoordinate - zValue;
        const upperBoundCriterion = yCoordinate - zValue;

        // Find indices in queryValues using the custom recursive binary search
        const leftBoundary = findBoundaryIndex(queryValues, 0, numQueries, lowerBoundCriterion);
        const rightBoundary = findBoundaryIndex(queryValues, leftBoundary, numQueries, upperBoundCriterion);

        // If a valid range is found, update finalResults using a functional approach
        if (leftBoundary < rightBoundary) {
            Array.from({ length: rightBoundary - leftBoundary }, (_, offset) => leftBoundary + offset)
                 .forEach(resultIndex => {
                     finalResults[resultIndex] = zValue;
                 });
        }
    });

    console.log(finalResults.join('\n'));
}

// Execute with stdin
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
