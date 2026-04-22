// This script is designed to process and analyze numerical data from a specified input source.

// Establish an alias for the global module loading mechanism to fetch external functionalities.
const fetchModule = require;

// Retrieve the core file system utility module using the aliased loader.
const fileSystemHandler = fetchModule('fs');

// Create a named reference for the synchronous file reading function provided by the file system module.
const fetchContentSynchronously = fileSystemHandler.readFileSync;

// Read all incoming data from the standard input stream, interpreting it as UTF-8 encoded text.
let sourceData = fetchContentSynchronously('/dev/stdin', 'utf8');

// Normalize the raw input data: first, remove any leading or trailing whitespace characters.
// Then, segment the cleaned data into an array of strings, using the newline character as a delimiter.
let dataSegments = sourceData.trim().split("\n");

// Extract the initial numerical value from the beginning of the data segments.
// This value indicates the total number of entries that need to be processed in subsequent steps.
let countOfEntries = Number(dataSegments.shift());

// Initialize an empty array to accumulate the results of various numerical combinations generated during processing.
let calculatedSums = [];

// Initiate the primary iteration loop, traversing through each available data segment.
// The loop continues from the first record up to, but not including, the total count of entries.
for (let primaryIndex = 0; primaryIndex < countOfEntries; primaryIndex++) {

    // Launch a secondary iteration loop. This loop always begins from the element
    // immediately following the current primary index to ensure unique pairs and avoid self-pairing.
    for (let secondaryIndex = primaryIndex + 1; secondaryIndex < countOfEntries; secondaryIndex++) {

        // Concatenate the string representation of two distinct elements from the data segments array.
        // Subsequently, explicitly convert the combined string into a numerical value and append it to the collection.
        calculatedSums.push(Number(dataSegments[primaryIndex] + dataSegments[secondaryIndex]));

        // Perform the same concatenation and explicit numerical conversion,
        // but with the two elements in reversed order, then add this new result to the collection as well.
        calculatedSums.push(Number(dataSegments[secondaryIndex] + dataSegments[primaryIndex]));
    }
}

// Arrange the entire collection of calculated numerical results in ascending order.
// This uses a standard comparison function for numeric sorting.
calculatedSums.sort(function(valueOne, valueTwo) {
    // The comparison logic: returns a negative value if valueOne is smaller,
    // a positive value if valueOne is larger, and zero if they are equal.
    return valueOne - valueTwo;
});

// Create an alias for the standard console output object to manage display operations.
const outputDestination = console;

// Define a specific function reference for logging messages to the console through the aliased object.
const emitMessage = outputDestination.log;

// Display the third smallest numerical value from the sorted collection to the standard output.
// This corresponds to the element located at index 2 in a zero-indexed array.
emitMessage(calculatedSums[2]);

// End of data processing sequence and script execution.