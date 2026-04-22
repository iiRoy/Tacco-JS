'use strict'; // Enforce stricter parsing and error handling in the script.

/**
 * Initiates the primary data processing flow.
 * This function is responsible for parsing raw input,
 * filtering a list of items based on criteria, and identifying
 * the lowest applicable value.
 * @param {string} rawDataStream - The complete stream of input as a single string.
 */
const processDataRecords = (rawDataStream) => {
    // Divide the entire input string into an array of individual lines.
    // Each element in the 'linesContainer' array will be a distinct line from the input.
    let linesContainer = rawDataStream.split('\n');

    // Extract and parse the global configuration parameters from the very first line.
    // These parameters typically define the problem's scope or constraints.
    let initialConfiguration = linesContainer[0].split(' ').map(itemString => parseInt(itemString, 10));

    // The first parsed value represents the total count of subsequent data records.
    const recordCount = initialConfiguration[0];
    // The second parsed value establishes a critical temporal boundary or limit.
    const temporalThreshold = initialConfiguration[1];

    // Isolate the actual data records from the 'linesContainer',
    // excluding the initial configuration line.
    let dataEntriesCollection = linesContainer.slice(1, recordCount + 1);

    // Initialize a variable to track the minimum value found.
    // A high arbitrary value ensures any legitimate value will be lower.
    let minimumDiscoveredValue = 1001;

    // Iterate over each individual data entry within the collection.
    dataEntriesCollection.forEach(currentDataItem => {
        // Parse the current data entry line, converting its components to integers.
        // An entry usually consists of a value and a corresponding time.
        let parsedDataItem = currentDataItem.split(' ').map(numericString => parseInt(numericString, 10));

        // Assign the extracted numerical components to semantically clear variables.
        let entryValue = parsedDataItem[0];
        let entryTimestamp = parsedDataItem[1];

        // Evaluate if the current data entry meets the specified conditions:
        // 1. Its timestamp must be less than the global temporal threshold.
        // 2. Its value must be less than the current minimum discovered value.
        if (entryTimestamp < temporalThreshold && entryValue < minimumDiscoveredValue) {
            // If both conditions are satisfied, update the minimum discovered value.
            minimumDiscoveredValue = entryValue;
        }
    });

    // After evaluating all data entries, determine the final outcome.
    // If 'minimumDiscoveredValue' remains unchanged from its initial high value,
    // it implies no entry met the criteria.
    if (minimumDiscoveredValue === 1001) {
        // Output a specific message indicating failure to find a suitable entry.
        console.log('TLE');
    } else {
        // Otherwise, display the successfully identified minimum value.
        console.log(minimumDiscoveredValue);
    }
};

// Invoke the primary processing function by reading input from the standard input stream.
// The input is read synchronously and decoded as UTF-8 before being passed.
processDataRecords(require('fs').readFileSync('/dev/stdin', 'utf-8'));