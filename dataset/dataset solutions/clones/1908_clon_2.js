"use strict";
// Acquire the file system module to read input data
var sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
// Divide the incoming data string into individual tokens using spaces or newlines as delimiters
var parsedTokens = sourceData.split(/ |\n/), tokenIndex = 0;

// Invoke the primary computation function and store its outcome
var resultValue = computeSolution();
// If a valid result is returned, display it to the standard output
if (resultValue !== undefined) console.log(resultValue);

/**
 * Executes the core algorithm to process the input tokens and determine the final answer.
 * This function implements a two-pointer approach on two derived and sorted arrays.
 * @returns {number} The calculated numerical result.
 */
function computeSolution() {
    // Original code included commented-out debugging lines.
    // console.log(parsedTokens);
    // parsedTokens = parsedTokens.map(item => +item);

    // Extract the first token, converting it to a number, which represents the total count of subsequent elements.
    let elementCount = +parsedTokens.shift();

    // Construct the first auxiliary array.
    // Each element is formed by adding its numeric value to its current index within the 'parsedTokens' array.
    // The resulting array is then sorted in ascending numerical order.
    let firstArray = parsedTokens.map((currentVal, idx) => +currentVal + idx).sort((valA, valB) => valA - valB);

    // Construct the second auxiliary array.
    // Each element is formed by subtracting its numeric value from its current index within the 'parsedTokens' array.
    // This array is also sorted in ascending numerical order.
    let secondArray = parsedTokens.map((currentVal, idx) => idx - currentVal).sort((valA, valB) => valA - valB);

    // More commented-out debugging from the original source.
    // console.log({ firstArray });
    // console.log({ secondArray });

    // Initialize two pointers for traversing the sorted arrays.
    let leftPtr = 0;
    let rightPtr = 0;
    // Initialize a variable to accumulate the final computed result.
    let finalResult = 0;

    // Iterate as long as both pointers remain within the bounds of their respective arrays.
    while (leftPtr < elementCount && rightPtr < elementCount) {

        // Determine the end index of the current block of identical values in 'firstArray'.
        let nextLeftPtr = leftPtr + 1;
        while (nextLeftPtr < elementCount && firstArray[leftPtr] === firstArray[nextLeftPtr]) {
            nextLeftPtr++;
        }

        // Determine the end index of the current block of identical values in 'secondArray'.
        let nextRightPtr = rightPtr + 1;
        while (nextRightPtr < elementCount && secondArray[rightPtr] === secondArray[nextRightPtr]) {
            nextRightPtr++;
        }

        // Compare the values at the current pointer positions.
        if (firstArray[leftPtr] === secondArray[rightPtr]) {
            // If the values are equal, multiply the lengths of their respective blocks
            // and add this product to the total result.
            finalResult += (nextLeftPtr - leftPtr) * (nextRightPtr - rightPtr);
            // Advance both pointers past their current blocks.
            leftPtr = nextLeftPtr;
            rightPtr = nextRightPtr;
        } else if (firstArray[leftPtr] < secondArray[rightPtr]) {
            // If the value in 'firstArray' is smaller, advance its pointer past its current block.
            leftPtr = nextLeftPtr;
        } else { // This implies firstArray[leftPtr] > secondArray[rightPtr]
            // If the value in 'secondArray' is smaller, advance its pointer past its current block.
            rightPtr = nextRightPtr;
        }

        // Another commented-out debugging line.
        // console.log({ leftPtr, rightPtr, nextLeftPtr, nextRightPtr, finalResult });
    }

    // Return the accumulated final result.
    return finalResult;
}
