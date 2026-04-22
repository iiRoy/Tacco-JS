// This module processes input data to calculate a specific sum based on given parameters.
// The primary goal is to read a set of numbers, identify a certain quantity to omit,
// and then sum the remaining numbers.
function DataProcessor(rawInputContent) {
    // Guard clause: Ensure the provided input is a valid string and not empty.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Input data is either invalid (not a string) or empty. Processing halted.");
        return; // Terminate execution if input is bad.
    }

    // Split the raw input string into an array of individual lines.
    // Trim any leading/trailing whitespace from the entire input first.
    const dataRowCollection = rawInputContent.trim().split('\n');

    // Validate that we have at least two lines of data, as expected by the problem structure.
    if (dataRowCollection.length < 2) {
        console.error("Insufficient data lines provided. Expected a minimum of two lines.");
        return;
    }

    // Extract the "count to skip" (K) from the first line of the input.
    // The first line is expected to contain space-separated values, where the second value is K.
    const initialLineComponents = dataRowCollection[0].split(' ');

    // Validate the structure of the first line to ensure K can be extracted.
    if (initialLineComponents.length < 2) {
        console.error("The first line is malformed; unable to determine the number of elements to omit.");
        return;
    }

    // Parse the extracted string value of K into an integer.
    // Use parseInt with radix 10 for explicit base conversion.
    const numberOfElementsToDiscard = parseInt(initialLineComponents[1], 10);

    // Perform validation on the parsed K value. It must be a non-negative integer.
    if (isNaN(numberOfElementsToDiscard) || numberOfElementsToDiscard < 0) {
        console.error(`Invalid count for elements to discard ('${initialLineComponents[1]}') detected. Must be a non-negative integer.`);
        return;
    }

    // Process the second line, which contains the sequence of numbers to be evaluated.
    const stringValuesFromSecondLine = dataRowCollection[1].split(' ');

    // Convert each string value into a number, filtering out any non-numeric entries.
    // This loop provides a robust way to handle potential malformed number strings.
    const validNumericEntries = [];
    for (const currentStringValue of stringValuesFromSecondLine) {
        const convertedNumber = Number(currentStringValue); // Attempt conversion.
        if (!isNaN(convertedNumber)) { // Check if the conversion resulted in a valid number.
            validNumericEntries.push(convertedNumber);
        }
    }

    // If, after parsing, no valid numbers remain, the sum is trivially zero.
    if (validNumericEntries.length === 0) {
        console.log(0);
        return;
    }

    // If the number of elements to discard is greater than or equal to the total valid entries,
    // it implies all numbers should be skipped, resulting in a sum of zero.
    if (numberOfElementsToDiscard >= validNumericEntries.length) {
        console.log(0);
        return;
    }

    // Sort the collected numeric values in ascending order.
    // This strategy simplifies the subsequent summation by allowing us to easily skip the smallest 'K' values.
    const sortedValuesAscending = validNumericEntries.sort((valueA, valueB) => valueA - valueB);

    // Calculate the cumulative sum of the elements that are NOT discarded.
    // We iterate from the index equivalent to 'numberOfElementsToDiscard' to the end of the sorted array.
    let aggregateSum = 0;
    for (let indexToSum = numberOfElementsToDiscard; indexToSum < sortedValuesAscending.length; indexToSum++) {
        aggregateSum += sortedValuesAscending[indexToSum];
    }

    // Output the final calculated aggregate sum to the console.
    console.log(aggregateSum);
}

// This function acts as the application's entry point, handling file I/O.
function initializeAndExecuteApp() {
    let applicationInputData = ''; // Variable to hold the content read from stdin.
    try {
        // Attempt to synchronously read all data from the standard input stream (/dev/stdin).
        // The data is expected to be UTF-8 encoded.
        applicationInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        // If an error occurs during file reading (e.g., file not found, permissions issue),
        // log the error and terminate the process with an error code.
        console.error("An error occurred while attempting to read from standard input:", ioError.message);
        process.exit(1); // Exit with a non-zero status to indicate an error.
    }

    // Once data is successfully read, pass it to the main processing function.
    DataProcessor(applicationInputData);
}

// Invoke the application's initialization routine to start execution.
initializeAndExecuteApp();