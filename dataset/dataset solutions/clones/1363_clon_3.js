/// <reference path="nodelib/node.js"/>

// Define constants for clarity and potential reuse
const INPUT_STREAM_ENCODING = 'utf8';
const VALUE_DELIMITER = " ";

// A small helper function to perform the numeric comparison for sorting
function performNumericComparison(firstValue, secondValue) {
    // Explicitly convert string values to integers for comparison
    const numericFirst = parseInt(firstValue, 10);
    const numericSecond = parseInt(secondValue, 10);

    // Calculate the difference for sorting order
    const comparisonDifference = numericFirst - numericSecond;
    return comparisonDifference;
}

// A helper function to encapsulate the data processing logic
function processAndSortData(incomingChunk) {
    // Step 1: Remove leading/trailing whitespace from the input chunk
    const cleanedChunk = incomingChunk.trim();

    // Step 2: Split the cleaned chunk into an array of string elements
    const stringElementArray = cleanedChunk.split(VALUE_DELIMITER);

    // Step 3: Sort the array numerically using the custom comparison function
    stringElementArray.sort(performNumericComparison);

    // Step 4: Join the sorted elements back into a single string
    const finalOutputString = stringElementArray.join(VALUE_DELIMITER);

    return finalOutputString;
}

// Initialize the standard input stream
process.stdin.resume();

// Set the encoding for the incoming data
process.stdin.setEncoding(INPUT_STREAM_ENCODING);

// Attach an event listener for 'data' events on the standard input
process.stdin.on('data', function (receivedInputData) {
    // Process the received data using the helper function
    const processedResult = processAndSortData(receivedInputData);

    // Output the final processed string to the console
    console.log(processedResult);
});
