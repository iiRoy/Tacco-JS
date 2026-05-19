'use strict'

// Constant for a large number, equivalent to original INF
const LARGE_NUMBER_CONSTANT = 900719925474099;

/**
 * Converts a space-separated string of numbers into an array of numbers.
 * @param {string} lineStr - The input string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers.
 */
function parseNumericStringArray(lineStr) {
    const stringTokens = lineStr.split(' ');
    const numericValues = stringTokens.map((token) => Number(token)); // Using Number() for parsing
    return numericValues;
}

/**
 * Performs a lower bound search on a sorted array.
 * Finds the first index 'i' such that dataArr[i] is not less than targetVal.
 * If all elements are less than targetVal, returns highIdx.
 * @param {number[]} dataArr - The sorted array to search within.
 * @param {number} lowIdx - The starting index for the search (inclusive).
 * @param {number} highIdx - The ending index for the search (exclusive).
 * @param {number} targetVal - The value to search for.
 * @returns {number} The lower bound index.
 */
function findFirstGreaterOrEqual(dataArr, lowIdx, highIdx, targetVal) {
    let currentLow = lowIdx;
    let currentHigh = highIdx;
    let middleIndex;

    // Continue binary search as long as there's more than one element in the search range
    while (currentHigh - currentLow > 1) {
        middleIndex = Math.floor((currentLow + currentHigh) / 2);
        const valueAtIndex = dataArr[middleIndex]; // Helper variable for clarity
        if (valueAtIndex < targetVal) {
            currentLow = middleIndex;
        } else {
            currentHigh = middleIndex;
        }
    }

    // Determine the final lower bound index
    if (dataArr[currentLow] < targetVal) {
        return currentHigh;
    } else {
        return currentLow;
    }
}

/**
 * Main function to process the input and generate the solution.
 * @param {string} rawInputData - The raw input string from stdin.
 */
function processSolution(rawInputData) {
    const allInputLines = rawInputData.trim().split('\n');

    // Parse the first line to get item count and query count using destructuring
    const [itemCount, queryCount] = parseNumericStringArray(allInputLines[0]);

    // Parse item data using slice and map for conciseness
    const itemDataLines = allInputLines.slice(1, itemCount + 1);
    const itemDetailsArray = itemDataLines.map(line => parseNumericStringArray(line));

    // Parse query points using slice and map
    const queryPointLines = allInputLines.slice(itemCount + 1, itemCount + queryCount + 1);
    const queryPointsArray = queryPointLines.map(line => Number(line)); // Using Number() for single integer lines

    // Sort item details by the third element (index 2) in descending order
    itemDetailsArray.sort((itemA, itemB) => itemB[2] - itemA[2]);

    // Initialize an array to store the final answers, filled with -1
    const finalResultArray = new Array(queryCount).fill(-1);

    // Iterate through each item to determine its effect on query points
    for (let currentItemIndex = 0; currentItemIndex < itemCount; currentItemIndex++) {
        const currentItem = itemDetailsArray[currentItemIndex];
        const startCoord = currentItem[0];
        const endCoord = currentItem[1];
        const itemWeightValue = currentItem[2];

        // Calculate effective bounds for the lower bound search based on item properties
        const effectiveRangeStart = startCoord - itemWeightValue;
        const effectiveRangeEnd = endCoord - itemWeightValue;

        // Find the range of query points affected by the current item
        const affectedQueryStartIdx = findFirstGreaterOrEqual(queryPointsArray, 0, queryCount, effectiveRangeStart);
        const affectedQueryEndIdx = findFirstGreaterOrEqual(queryPointsArray, affectedQueryStartIdx, queryCount, effectiveRangeEnd);

        // If there's an actual range of affected queries, update their answers
        if (affectedQueryStartIdx < affectedQueryEndIdx) {
            for (let fillTargetIdx = affectedQueryStartIdx; fillTargetIdx < affectedQueryEndIdx; fillTargetIdx++) {
                finalResultArray[fillTargetIdx] = itemWeightValue;
            }
        }
    }

    // Output the results, each on a new line
    console.log(finalResultArray.join('\n'));
}

// Read input from stdin and execute the solution
processSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
