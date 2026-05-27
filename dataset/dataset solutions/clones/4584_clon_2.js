"use strict";

/**
 * Orchestrates the processing of input data to find a specific item.
 * @param {string} inputData - The raw string content read from standard input.
 */
const processInput = (inputData) => {
    // Normalize input: remove leading/trailing whitespace and split into individual lines.
    let processedLines = inputData.trim().split("\n");

    // Extract the first line which contains configuration parameters.
    const configParts = processedLines[0].split(" ");
    // Parse the total number of data entries (N).
    const countElements = parseInt(configParts[0], 10);
    // Parse the target cumulative sum (K).
    const targetSumValue = parseInt(configParts[1], 10);

    // Isolate the lines that contain the actual item data.
    // These are from the second line up to N lines after it.
    const dataLines = processedLines.slice(1, countElements + 1);

    // Initialize an array to hold structured item objects.
    const itemRecords = [];

    // Iterate over each data line to parse and store item information.
    for (let idx in dataLines) {
        // Split the current line by space and convert parts to integers.
        let parsedLine = dataLines[idx].split(" ").map(numStr => parseInt(numStr, 10));

        // Assign the parsed values to descriptive variables.
        let itemValue = parsedLine[0];
        let itemQuantity = parsedLine[1];

        // Push an object representing the item into the records array.
        // Using 'val' and 'qty' as property names.
        itemRecords.push({ val: itemValue, qty: itemQuantity });
    }

    // The original code included a commented-out sort operation.
    // Keeping it commented to maintain Type II structural similarity.
    // itemRecords.sort((a, b) => a.val - b.val);

    // Initialize a variable to track the running total of quantities.
    let currentTotal = 0;
    // Initialize an index to iterate through the item records.
    let recordIndex = 0;

    // Loop through the item records, accumulating quantities,
    // until the current total meets or exceeds the target sum.
    while (currentTotal < targetSumValue) {
        currentTotal += itemRecords[recordIndex].qty; // Add the quantity of the current item.
        recordIndex++; // Move to the next item in the sequence.
    }

    // Once the loop exits, 'recordIndex' will be one position past the item
    // that caused the sum to reach or exceed the target.
    // Therefore, we access the item at 'recordIndex - 1' to get its value.
    console.log(itemRecords[recordIndex - 1].val);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
