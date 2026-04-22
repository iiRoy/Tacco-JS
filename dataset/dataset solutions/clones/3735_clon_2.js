'use strict';

/*
 * This script processes input from standard input
 * to perform a specific calculation related to array manipulation.
 */

/**
 * Executes the primary data processing workflow.
 * @param {string} rawInputContent The complete string content read from the input source.
 */
function ExecuteTask(rawInputContent) {
    // Divide the entire input string into an array of lines.
    rawInputContent = rawInputContent.split("\n");

    // Extract numerical parameters from the very first line of input.
    let firstLineSegments = rawInputContent[0].split(' ');

    // Determine the total number of items from the first parameter.
    let totalItemCount = parseInt(firstLineSegments[0]);

    // Ascertain the grouping factor from the second parameter.
    let groupingFactor = parseInt(firstLineSegments[1]);

    // Parse the second line of input to obtain the array of data elements.
    let dataElements = rawInputContent[1].split(' ');

    // Initialize a placeholder for a potential computed value (unused in this specific logic).
    let finalResult = 0;

    // Keep track of the array index that holds the minimum value encountered.
    let minimumValueIndex = -1;

    // Traverse through the data elements to pinpoint the location of the smallest value.
    for (let currentPosition = 0; currentPosition < totalItemCount; currentPosition += 1) {
        // If it's the initial check or a smaller element is found, update the minimum index.
        if (minimumValueIndex === -1 || dataElements[minimumValueIndex] > dataElements[currentPosition]) {
            minimumValueIndex = currentPosition;
        }
    }

    // Output the final calculated value, which involves integer division.
    console.log(
        Math.floor(
            (totalItemCount - 1 + groupingFactor - 2) / (groupingFactor - 1)
        )
    );
}

// Call the main task execution function with data acquired from the standard input stream.
ExecuteTask(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);