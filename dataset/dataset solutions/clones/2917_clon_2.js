'use strict';

// This section contains utility functions and constants, often copied between projects.

// A large constant, potentially for infinity or maximum value in certain contexts.
const MAX_VAL = 900719925474099; // A value derived from Math.floor(Number.MAX_SAFE_INTEGER / 10);

/**
 * Converts a space-separated string of numbers into an array of integers.
 * @param {string} inputLine - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumbers(inputLine) {
    return inputLine.split(' ').map((strNum) => parseInt(strNum, 10));
}

/**
 * Performs a binary search to find the lower bound (first element not less than targetValue)
 * in a sorted array segment.
 * @param {number[]} dataArr - The sorted array to search within.
 * @param {number} lowIdx - The starting index of the search segment.
 * @param {number} highIdx - The ending index (exclusive) of the search segment.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the first element not less than targetValue.
 */
function findInsertionPoint(dataArr, lowIdx, highIdx, targetValue) {
    // Binary search loop: continues as long as there are at least two elements in the segment.
    for (let midIdx; 1 < highIdx - lowIdx;) {
        midIdx = Math.floor((lowIdx + highIdx) / 2); // Calculate the middle index.
        // If the element at midIdx is less than the target, search in the upper half.
        if (dataArr[midIdx] < targetValue) {
            lowIdx = midIdx;
        } else {
            // Otherwise, search in the lower half (including midIdx).
            highIdx = midIdx;
        }
    }
    // After the loop, lowIdx and highIdx are adjacent.
    // Determine the correct lower bound based on the element at lowIdx.
    return dataArr[lowIdx] < targetValue ? highIdx : lowIdx;
}

// End of utility functions section.

/**
 * Main processing function for the problem.
 * Reads input, processes data, and prints the results.
 * @param {string} rawData - The complete input string from stdin.
 */
function ProcessInput(rawData) {
    // Clean and split the raw input into individual lines.
    const lines = rawData.trim().split('\n');

    // Parse the first line to get N (number of items) and Q (number of queries).
    const firstLineData = parseNumbers(lines[0]);
    const numItems = firstLineData.shift(); // N
    const numQueries = firstLineData.shift(); // Q

    // Read and store the item data (stx in original).
    // Each item is an array of numbers.
    const itemData = new Array(numItems);
    for (let itemIdx = 0; itemIdx < numItems; ++itemIdx) {
        itemData[itemIdx] = parseNumbers(lines[itemIdx + 1]);
    }

    // Read and store the query values (d in original).
    const queryValues = new Array(numQueries);
    for (let queryIdx = 0; queryIdx < numQueries; ++queryIdx) {
        queryValues[queryIdx] = parseInt(lines[numItems + queryIdx + 1], 10);
    }

    // Sort the item data in descending order based on their third element.
    itemData.sort((itemA, itemB) => itemB[2] - itemA[2]);

    // Initialize the results array with a default value of -1 for all queries.
    const results = new Array(numQueries).fill(-1);

    // Iterate through each item to update the query results.
    for (let currentItemIdx = 0; currentItemIdx < numItems; ++currentItemIdx) {
        const currentItem = itemData[currentItemIdx];
        const itemVal1 = currentItem[0];
        const itemVal2 = currentItem[1];
        const itemVal3 = currentItem[2];

        // Find the range of query values that are covered by the current item.
        // The lower bound for the range.
        const leftBound = findInsertionPoint(queryValues, 0, numQueries, itemVal1 - itemVal3);
        // The upper bound (exclusive) for the range, starting search from leftBound.
        const rightBound = findInsertionPoint(queryValues, leftBound, numQueries, itemVal2 - itemVal3);

        // If the found range is valid (leftBound is less than rightBound),
        // update the results for queries within this range.
        if (leftBound < rightBound) {
            for (let updateIdx = leftBound; updateIdx < rightBound; ++updateIdx) {
                results[updateIdx] = itemVal3;
            }
        }
    }
    // Print the final results, each on a new line.
    console.log(results.join('\n'));
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
