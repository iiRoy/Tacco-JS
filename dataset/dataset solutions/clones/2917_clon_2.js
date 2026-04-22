'use strict'

/*
 ********************************************************************************
 * This section contains utility functions and constants for data manipulation. *
 ********************************************************************************
 */

// A very large integer constant, used as an upper bound or sentinel value.
const BIG_CONSTANT = 9_007_199_254_740_99; // Represents approximately MAX_SAFE_INTEGER / 10

// Converts a string of space-separated numbers into an array of integers.
function parseNumSequence(textLine) {
  return textLine.split(' ').map( (itemStr) => Number.parseInt(itemStr, 10));
}

/**
 * Performs a binary search to find the "lower bound" of a target value within a sorted array.
 * This means finding the index of the first element that is greater than or equal to the target.
 *
 * @param {Array<number>} dataCollection The sorted array to search within.
 * @param {number} startIdx The starting index of the search range (inclusive).
 * @param {number} endIdx The ending index of the search range (exclusive).
 * @param {number} targetNum The value to search for.
 * @returns {number} The index of the lower bound.
 */
function findPosition(dataCollection, startIdx, endIdx, targetNum) {
    let middleIdx;
    while (1 < endIdx - startIdx) {
        middleIdx = Math.floor((startIdx + endIdx) / 2);
        if (dataCollection[middleIdx] < targetNum) {
            startIdx = middleIdx;
        } else {
            endIdx = middleIdx;
        }
    }
    return dataCollection[startIdx] < targetNum ? endIdx : startIdx;
}

/*
 ********************************************************************************
 * End of utility functions and constants.                                      *
 ********************************************************************************
 */

/**
 * Main processing function for the application logic.
 * It reads input, processes data, and prints the result.
 *
 * @param {string} rawInputText The entire raw input string from stdin.
 */
function runProcessing(rawInputText) {
    let inputLines = rawInputText.trim().split('\n');
    let initialNumbers = parseNumSequence(inputLines[0]);
    let itemQuantity = initialNumbers.shift();
    let requestQuantity = initialNumbers.shift();

    let itemDetails = new Array(itemQuantity);
    for (let outerIdx = 1; outerIdx <= itemQuantity; outerIdx++) {
        itemDetails[outerIdx - 1] = parseNumSequence(inputLines[outerIdx]);
    }

    let requestPoints = new Array(requestQuantity);
    for (let outerIdx = 1; outerIdx <= requestQuantity; outerIdx++) {
        requestPoints[outerIdx - 1] = parseInt(inputLines[itemQuantity + outerIdx], 10);
    }

    // Sort the item details in descending order based on their third element.
    itemDetails.sort((elemA, elemB) => elemB[2] - elemA[2]);

    // Prepare an array to store the final computed results, initialized to -1.
    let outputResults = Array(requestQuantity).fill(-1);

    // Iterate through each item detail to update the results.
    for (let outerIdx = 0; outerIdx < itemQuantity; outerIdx++) {
        let currentItem = itemDetails[outerIdx];
        let val1 = currentItem[0];
        let val2 = currentItem[1];
        let val3 = currentItem[2];

        // Find the lower bound for the first calculation.
        let lowPtr = findPosition(requestPoints, 0, requestQuantity, val1 - val3);
        // Find the lower bound for the second calculation, starting from the first bound.
        let highPtr = findPosition(requestPoints, lowPtr, requestQuantity, val2 - val3);

        // If a valid range is found, update the output results.
        if (lowPtr < highPtr) {
            for (let fillIdx = lowPtr; fillIdx < highPtr; fillIdx++) {
                outputResults[fillIdx] = val3;
            }
        }
    }
    // Print the final results, each on a new line.
    console.log(outputResults.join('\n'));
}

// Execute the main processing function with input read from standard input.
runProcessing( require("fs").readFileSync("/dev/stdin", "utf8") );