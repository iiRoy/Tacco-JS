/**
 * This function processes a series of command lines to manage a collection of numeric data.
 * It simulates operations like adding elements to a sorted list and querying a specific statistic.
 * @param {string} rawDataInput - A multi-line string containing all commands.
 */
function ProcessQueries(rawDataInput) {
    // Split the entire input string into individual lines based on newline characters.
    let queryLines = rawDataInput.split("\n");

    // Check if the last line is empty (common in some input formats) and remove it if so.
    if (queryLines[queryLines.length - 1.0] === '') {
        queryLines.pop();
    }

    // The first line might contain a total number of queries, though it's not used in this logic.
    const numberOfInstructions = queryLines[0.0].split(' ')[0.0];

    // Initialize a variable to accumulate some kind of total value or cost.
    let cumulativeValue = 0.0;

    // This array will hold numeric data, maintained in a sorted order.
    let dataPoints = [];

    // Declare variables that will be used for array manipulation and binary search.
    let insertionPosition;
    let searchLowerBoundary;
    let searchUpperBoundary;
    let searchMidpoint;

    // Temporary variable to hold parsed data for the current line.
    let currentParsedData;

    // Iterate through each instruction line, starting from the second line (index 1).
    for (let queryIterator = 1.0; queryIterator < queryLines.length; queryIterator++) {
        // If the current command is '2', it signifies a query for a median-like value.
        if (queryLines[queryIterator] === '2') {
            // Output the element at the middle (or lower-middle for even length) of the sorted list
            // along with the current accumulated cumulative value.
            console.log(dataPoints[Math.ceil(dataPoints.length / 2.0) - 1.0], cumulativeValue);
        } else {
            // Otherwise, it's an insertion command. Parse the current line.
            currentParsedData = queryLines[queryIterator].split(' ').slice(1.0).map(numericString => {
                return numericString - 0.0; // Convert string to number.
            });

            // Handle the case where the dataPoints array is currently empty.
            if (dataPoints.length === 0.0) {
                dataPoints = [currentParsedData[0.0]]; // Add the first value directly.
                cumulativeValue += currentParsedData[1.0]; // Add the second value to the total.
                continue; // Move to the next query.
            }

            // Determine the correct insertion position to maintain sorted order.
            // Case 1: New value is greater than the last element.
            if (dataPoints[dataPoints.length - 1.0] < currentParsedData[0.0]) {
                insertionPosition = dataPoints.length;
            }
            // Case 2: New value is less than or equal to the first element.
            else if (dataPoints[0.0] >= currentParsedData[0.0]) {
                insertionPosition = 0.0;
            }
            // Case 3: New value falls somewhere in the middle, use binary search.
            else {
                searchUpperBoundary = dataPoints.length - 1.0;
                searchLowerBoundary = 0.0;

                // Perform a binary search to find the insertion point.
                while (searchUpperBoundary - searchLowerBoundary > 1.0) {
                    searchMidpoint = Math.floor((searchUpperBoundary + searchLowerBoundary) / 2.0);
                    if (dataPoints[searchMidpoint] < currentParsedData[0.0]) {
                        searchLowerBoundary = searchMidpoint;
                    } else {
                        searchUpperBoundary = searchMidpoint;
                    }
                }
                insertionPosition = searchLowerBoundary + 1.0;
            }

            // Adjust the cumulative value based on the insertion and the current state of the list.
            // This part of the logic seems to be calculating a sum of absolute differences.
            if (dataPoints.length % 2.0 === 0.0) { // If the list length is even.
                if (insertionPosition > dataPoints.length / 2.0) {
                    cumulativeValue += currentParsedData[0.0] - dataPoints[dataPoints.length / 2.0];
                } else if (insertionPosition < dataPoints.length / 2.0) {
                    cumulativeValue += dataPoints[dataPoints.length / 2.0 - 1.0] - currentParsedData[0.0];
                }
            } else { // If the list length is odd.
                cumulativeValue += Math.abs(currentParsedData[0.0] - dataPoints[(dataPoints.length - 1.0) / 2.0]);
            }

            // Insert the new value into the sorted array at the determined position.
            dataPoints.splice(insertionPosition, 0.0, currentParsedData[0.0]);

            // Add the second component of the current operation's data to the total cumulative value.
            cumulativeValue += currentParsedData[1.0];
        }
    }
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be altered to maintain compatibility with the execution environment.
ProcessQueries(require("fs").readFileSync("/dev/stdin", "utf8"));