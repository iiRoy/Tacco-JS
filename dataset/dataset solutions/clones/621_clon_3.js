const fileSystem = require('fs');

// Function to process and aggregate item data from a given input string.
// This function encapsulates the core logic, making the program more modular.
function processItemAggregations(inputDataContent) {
    // A mapping structure to store aggregated numeric values for unique item identifiers.
    // Using a Map provides better performance for frequent additions/retrievals and
    // allows for non-string keys if needed, serving as a Type III structural change.
    const aggregatedValues = new Map();

    // Perform an initial validation to ensure the input data is provided and is a string.
    if (!inputDataContent || typeof inputDataContent !== 'string') {
        console.error("Error: Received invalid or empty input data for processing.");
        return; // Exit early if input is not suitable.
    }

    // Normalize input: remove leading/trailing whitespace, then split into an array of lines.
    const rawInputLines = inputDataContent.trim().split('\n');

    // The very first line of input is expected to specify the total count of subsequent data entries.
    // We extract this line and parse it into an integer.
    const declaredEntryCountString = rawInputLines.shift(); // Removes the first element from the array.
    const expectedEntryCount = parseInt(declaredEntryCountString, 10);

    // Validate the parsed entry count to ensure it's a non-negative number.
    if (isNaN(expectedEntryCount) || expectedEntryCount < 0) {
        console.error("Error: The initial line of input does not contain a valid non-negative integer for the expected entry count.");
        return; // Abort if the count is invalid.
    }

    // Iterate through the remaining lines, processing each data entry.
    // The loop runs for a maximum of `expectedEntryCount` times or until all available lines are processed,
    // whichever comes first, to prevent out-of-bounds access and handle truncated input gracefully.
    for (let currentLineIndex = 0; currentLineIndex < Math.min(expectedEntryCount, rawInputLines.length); currentLineIndex++) {
        const currentDataLine = rawInputLines[currentLineIndex];

        // Skip any lines that are empty or contain only whitespace.
        if (!currentDataLine || currentDataLine.trim() === '') {
            console.warn(`Warning: Skipping an empty or whitespace-only line at input index ${currentLineIndex}.`);
            continue; // Move to the next line.
        }

        // Split the current data line into its component parts based on a space delimiter.
        // Expecting an item identifier and a numeric value.
        const lineSegments = currentDataLine.split(' ');

        // Validate that the line contains at least two segments (key and value).
        if (lineSegments.length < 2) {
            console.warn(`Warning: Skipping malformed line "${currentDataLine}" at index ${currentLineIndex}. Expected at least two segments (identifier and value).`);
            continue;
        }

        const itemIdentifier = lineSegments[0]; // The first segment is the unique identifier (key).
        const rawValuePart = lineSegments[1];    // The second segment is the value string.
        const numericValue = Number(rawValuePart); // Convert the value string to a number explicitly.

        // Validate that the converted numeric value is indeed a valid number.
        if (isNaN(numericValue)) {
            console.warn(`Warning: Skipping line "${currentDataLine}" at index ${currentLineIndex}. The value "${rawValuePart}" is not a valid number.`);
            continue;
        }

        // Retrieve the current accumulated sum for the `itemIdentifier` from the Map.
        // If the identifier is not yet in the map, `get()` returns undefined, so we default to 0.
        const existingSum = aggregatedValues.get(itemIdentifier) || 0;
        // Update the map with the new total sum for the identifier.
        aggregatedValues.set(itemIdentifier, existingSum + numericValue);
    }

    // After processing all lines, extract all unique item identifiers (keys) from the Map.
    // Array.from() is used to convert the Map's keys iterator into a standard array.
    const distinctItemIdentifiers = Array.from(aggregatedValues.keys());

    // Define a custom comparison function for sorting the item identifiers.
    // The sorting logic prioritizes length: shorter strings come first.
    // If two strings have the same length, they are then sorted lexicographically (alphabetically).
    const customIdentifierSorter = (firstKey, secondKey) => {
        const lengthComparison = firstKey.length - secondKey.length;
        if (lengthComparison !== 0) {
            return lengthComparison; // If lengths differ, sort by length.
        }
        // If lengths are identical, use localeCompare for stable lexicographical sorting.
        return firstKey.localeCompare(secondKey);
    };

    // Apply the custom sorting logic to the array of unique identifiers.
    distinctItemIdentifiers.sort(customIdentifierSorter);

    // Finally, iterate through the now-sorted identifiers and print each one
    // along with its corresponding aggregated total value.
    for (const identifierToOutput of distinctItemIdentifiers) {
        const finalAggregatedValue = aggregatedValues.get(identifierToOutput);
        // Use template literals for cleaner and more readable output formatting.
        console.log(`${identifierToOutput} ${finalAggregatedValue}`);
    }
}

// This Immediately Invoked Function Expression (IIFE) serves as the main entry point
// for the script, handling file reading and initiating the data processing.
(function mainExecutionBlock() {
    let standardInputContent;
    try {
        // Attempt to read the entire content from /dev/stdin synchronously.
        // Using 'utf8' encoding ensures proper character handling.
        standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    } catch (readError) {
        // If an error occurs during file reading (e.g., file not found, permission issues),
        // log a fatal error message and terminate the process with an error code.
        console.error("Fatal Error: Unable to read from /dev/stdin. Details:", readError.message);
        process.exit(1); // Indicate an abnormal termination.
    }

    // Once the input content is successfully read, pass it to the processing function.
    processItemAggregations(standardInputContent);
})(); // The IIFE is immediately executed.