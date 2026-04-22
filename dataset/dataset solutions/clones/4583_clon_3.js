"use strict"; // Enforce strict mode for cleaner code execution

// A utility function to parse a string line containing space-separated numbers
// into an array of integers. Includes basic error handling for non-numeric values.
const parseNumericLine = (lineContent) => {
    // Split by one or more whitespace characters to handle various spacing
    return lineContent.split(/\s+/).map(segment => {
        const parsedValue = parseInt(segment, 10); // Use radix 10 for explicit decimal parsing
        if (isNaN(parsedValue)) {
            // Log a warning for non-numeric input segments.
            // Depending on requirements, this could also throw an error or default to 0.
            console.warn(`Warning: Non-numeric value encountered "${segment}". Defaulting to 0.`);
            return 0;
        }
        return parsedValue;
    });
};

/**
 * Processes raw input data to find the first item whose cumulative value
 * meets or exceeds a specified target sum. This function encapsulates the core logic.
 * @param {string} inputString - The raw string input, typically from a file or stdin.
 *                               It contains configuration on the first line and item data on subsequent lines.
 */
const processCumulativeSumQuery = (inputString) => {
    // Validate the input string to ensure it's a non-empty string
    if (typeof inputString !== 'string' || inputString.trim().length === 0) {
        console.error("Error: Input data is empty or invalid. Please provide valid string input.");
        return; // Exit early if input is unusable
    }

    // Split the entire input string into an array of individual lines
    const allInputLines = inputString.trim().split('\n');

    // Ensure there's at least one line for global parameters (N and K)
    if (allInputLines.length < 1) {
        console.error("Error: No configuration line found in input. Expected at least N (item count) and K (target sum).");
        return;
    }

    // Parse the first line which contains the global parameters: total item count (N) and target sum (K)
    const globalParameters = parseNumericLine(allInputLines[0]);

    // Destructure the parameters for clearer, more descriptive variable names
    const [totalItemCount, requiredCumulativeValue] = globalParameters;

    // Perform basic validation on the parsed global parameters
    if (isNaN(totalItemCount) || isNaN(requiredCumulativeValue) || totalItemCount < 0 || requiredCumulativeValue < 0) {
        console.error("Error: Invalid or negative values detected for total item count (N) or required cumulative value (K).");
        return;
    }

    // Check if the number of data lines provided matches the declared totalItemCount
    if (allInputLines.length < totalItemCount + 1) {
        console.error(`Error: Expected ${totalItemCount} item data lines, but only ${allInputLines.length - 1} were found after the configuration line.`);
        return;
    }

    // Prepare a list to store all individual item details (identifier and value)
    const individualItemData = [];
    // Iterate from the second line (index 1) up to the specified total item count
    for (let currentLineIndex = 1; currentLineIndex <= totalItemCount; currentLineIndex++) {
        const itemLineContent = allInputLines[currentLineIndex];
        const [identifier, value] = parseNumericLine(itemLineContent);

        // Validate each item's data to ensure it's properly formed
        if (isNaN(identifier) || isNaN(value)) {
            console.error(`Error: Malformed item data on line ${currentLineIndex + 1}. This item will be skipped.`);
            continue; // Skip this malformed line and proceed to the next
        }
        individualItemData.push({ identifier: identifier, value: value });
    }

    // This array will store objects, each representing an item along with its running cumulative sum
    const processedCumulativeCollection = [];
    let currentAggregateSum = 0; // Initialize the running total for all items

    // Build the collection of items, enriching each with its cumulative sum up to that point
    for (const itemEntry of individualItemData) {
        currentAggregateSum += itemEntry.value; // Add current item's value to the aggregate sum

        // Create an enriched item record containing its ID, individual contribution, and the overall sum
        const enrichedItemRecord = {
            itemId: itemEntry.identifier,
            itemContribution: itemEntry.value,
            currentOverallSum: currentAggregateSum
        };
        processedCumulativeCollection.push(enrichedItemRecord);
    }

    let finalAnswerIdentifier = null; // Variable to hold the ID of the item that first meets the criteria
    let resultFoundFlag = false;       // Flag to explicitly track if a suitable item has been identified

    // Search through the cumulative collection to find the first item
    // where the currentOverallSum reaches or exceeds the requiredCumulativeValue.
    // A standard `for` loop is used for explicit indexing and control.
    for (let recordIndex = 0; recordIndex < processedCumulativeCollection.length; recordIndex++) {
        const currentRecord = processedCumulativeCollection[recordIndex];

        if (currentRecord.currentOverallSum >= requiredCumulativeValue) {
            finalAnswerIdentifier = currentRecord.itemId; // Store the ID of the qualifying item
            resultFoundFlag = true;                      // Set the flag to true
            break;                                       // Exit the loop immediately as the first suitable item is found
        }
    }

    // Output the determined result based on whether a qualifying item was found
    if (resultFoundFlag) {
        console.log(finalAnswerIdentifier); // Print the ID of the item that met the target sum
    } else {
        // This block executes if the target sum was never reached by any item in the sequence.
        // The original code printed the entire array here, which was likely for debugging purposes.
        // Here, we provide a more informative message to the user.
        console.log("No item sequence reached the specified cumulative target value.");
        // Optionally, one could print the maximum cumulative sum achieved if that information is useful:
        // console.log(`Maximum cumulative sum achieved: ${currentAggregateSum}`);
    }
};

// Self-executing anonymous function (IIFE) to handle program execution,
// especially reading input from standard input and managing potential errors.
(function executeProgram() {
    try {
        // Attempt to read the entire content of the standard input stream as a UTF-8 string
        const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the successfully read content to our main processing function
        processCumulativeSumQuery(fileContent);
    } catch (errorReadingFile) {
        // Catch and report any errors that occur during the file reading process
        console.error("An error occurred while attempting to read the input file:", errorReadingFile.message);
        // Provide additional context for common file-related errors, e.g., file not found
        if (errorReadingFile.code === 'ENOENT') {
            console.error("Please ensure that '/dev/stdin' exists and is accessible to the program.");
        }
    }
})();