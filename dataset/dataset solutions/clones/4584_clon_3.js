"use strict";

// This module processes a structured data input to find a specific value.

/**
 * Parses input data to identify a numerical identifier based on a cumulative quantity threshold.
 * @param {string} inputContentString - The raw string content read from an input source.
 * @returns {void} Outputs the determined identifier code to the console.
 */
const processInputData = (inputContentString) => {
    // Basic validation for the input string
    if (!inputContentString || typeof inputContentString !== 'string') {
        console.error("Error: Input content is invalid or empty.");
        return;
    }

    const LINE_DELIMITER = "\n";
    const PART_DELIMITER = " ";

    // Normalize and split the input string into individual lines
    const allInputLines = inputContentString.trim().split(LINE_DELIMITER);

    // Ensure there's at least one line for N and K
    if (allInputLines.length === 0) {
        console.error("Error: No data lines found in input.");
        return;
    }

    // Parse the first line to get the total number of entries and the target cumulative limit
    const headerParts = allInputLines[0].split(PART_DELIMITER);
    if (headerParts.length < 2) {
        console.error("Error: Header line is malformed, expected N and K.");
        return;
    }

    const totalEntriesCount = parseInt(headerParts[0], 10);
    const cumulativeLimitValue = parseInt(headerParts[1], 10);

    // Validate parsed header values
    if (isNaN(totalEntriesCount) || totalEntriesCount <= 0 || isNaN(cumulativeLimitValue) || cumulativeLimitValue < 0) {
        console.error("Error: Invalid N or K values in header.");
        return;
    }

    // Extract the data lines containing value-quantity pairs
    // Using slice to get lines from index 1 up to totalEntriesCount (inclusive of N lines)
    const entryDataSegments = allInputLines.slice(1, totalEntriesCount + 1);

    // Ensure enough data lines are provided
    if (entryDataSegments.length < totalEntriesCount) {
        console.warn(`Warning: Expected ${totalEntriesCount} data lines, but found only ${entryDataSegments.length}. Processing available data.`);
        // Adjust totalEntriesCount if actual data is less
        // totalEntriesCount = entryDataSegments.length; // Decided against changing N, as problem implies N is fixed.
    }

    // Array to store parsed objects {identifierCode, quantityValue}
    const processedValueQuantities = [];

    // Iterate through each data segment, parse the numerical identifier and its corresponding quantity
    for (let currentSegmentIndex = 0; currentSegmentIndex < entryDataSegments.length; currentSegmentIndex++) {
        const segment = entryDataSegments[currentSegmentIndex];
        const currentLineParts = segment.split(PART_DELIMITER);

        if (currentLineParts.length < 2) {
            console.warn(`Warning: Skipping malformed data line at index ${currentSegmentIndex + 1}: "${segment}"`);
            continue; // Skip malformed lines
        }

        const identifierCode = parseInt(currentLineParts[0], 10);
        const quantityValue = parseInt(currentLineParts[1], 10);

        // Validate parsed values for the current entry
        if (isNaN(identifierCode) || isNaN(quantityValue)) {
            console.warn(`Warning: Skipping invalid number or amount in line "${segment}".`);
            continue;
        }

        processedValueQuantities.push({ identifierCode: identifierCode, quantityValue: quantityValue });
    }

    // If no valid items were parsed, there's nothing to process
    if (processedValueQuantities.length === 0) {
        console.error("Error: No valid value-quantity items were successfully parsed.");
        return;
    }

    let currentAccumulation = 0; // Tracks the running total of quantities
    let itemIteratorIndex = 0;    // Index to traverse the processedValueQuantities array

    // Iterate through the items, accumulating quantities until the cumulative limit is reached or exceeded
    while (currentAccumulation < cumulativeLimitValue && itemIteratorIndex < processedValueQuantities.length) {
        currentAccumulation += processedValueQuantities[itemIteratorIndex].quantityValue;
        itemIteratorIndex++;
    }

    // The problem implies that K will always be met.
    // However, if K is never met, we should handle it gracefully.
    if (itemIteratorIndex === 0) { // This case means K was 0 or less, or first item quantity was 0.
        // If K is 0 or negative, and the first item quantity is 0, the loop might not run.
        // The problem description implies a positive K and positive quantities.
        // If cumulativeLimitValue is 0 or negative, and currentAccumulation starts at 0,
        // the loop might not run even if processedValueQuantities is not empty.
        // In this specific problem context, K is positive, and quantities are positive.
        // So itemIteratorIndex will be at least 1 unless K is never reached.
        console.error("Error: Could not find an item that satisfies the cumulative limit. Check input data or limit value.");
        return;
    }

    // Output the identifier code of the item that caused the cumulative limit to be met or exceeded.
    // The index `itemIteratorIndex - 1` points to that specific item.
    const finalResultIdentifier = processedValueQuantities[itemIteratorIndex - 1].identifierCode;
    console.log(finalResultIdentifier);
};

// Define constants for file system operations
const fileSystemModule = require('fs');
const STANDARD_INPUT_PATH = '/dev/stdin';
const ENCODING_UTF8 = 'utf8';

// Read data from the standard input synchronously and pass it to the processing function.
try {
    const rawInputData = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, ENCODING_UTF8);
    processInputData(rawInputData);
} catch (error) {
    console.error(`Failed to read input from ${STANDARD_INPUT_PATH}:`, error.message);
    // Optionally, exit with an error code
    // process.exit(1);
}