function processInputData(inputStringContent) {
    // A utility function to safely parse a line of space-separated numbers.
    // It converts string values to integers and filters out any non-numeric results.
    const extractNumbersFromLine = (lineText) => {
        return lineText.split(' ')
                       .map(segment => parseInt(segment, 10))
                       .filter(value => !isNaN(value));
    };

    // Split the entire input content into individual lines.
    // Handles both Windows (\r\n) and Unix (\n) line endings.
    const contentLines = inputStringContent.split(/\r?\n/);

    // Ensure there are at least two lines of data for processing.
    if (contentLines.length < 2) {
        console.error("Input processing error: Not enough data lines provided.");
        return;
    }

    // Process the first line to get configuration parameters.
    // Expects at least two parameters, the second of which dictates the number of elements to sum.
    const systemConfiguration = extractNumbersFromLine(contentLines[0]);

    if (systemConfiguration.length < 2) {
        console.error("Input parsing error: Configuration parameters are incomplete or invalid.");
        return;
    }

    // The second parameter from the first line determines how many top values to aggregate.
    const numberOfElementsToAggregate = systemConfiguration[1];

    // Validate the aggregation count to ensure it's a positive integer.
    if (!Number.isInteger(numberOfElementsToAggregate) || numberOfElementsToAggregate <= 0) {
        console.error(`Input validation error: Invalid number of elements specified for aggregation: ${numberOfElementsToAggregate}. Must be a positive integer.`);
        return;
    }

    // Process the second line to get the raw list of data points.
    let collectionOfNumericValues = extractNumbersFromLine(contentLines[1]);

    if (collectionOfNumericValues.length === 0) {
        console.warn("Data warning: No valid numeric values found in the data line.");
        // If no data points, the sum is 0.
        console.log(0);
        return;
    }

    // Sort the collected numeric values in descending order.
    // This places the largest values at the beginning of the array.
    collectionOfNumericValues.sort((firstVal, secondVal) => secondVal - firstVal);

    // Select the top 'numberOfElementsToAggregate' values from the sorted list.
    // Uses Math.min to prevent trying to slice more elements than available.
    const valuesForSummation = collectionOfNumericValues.slice(0, Math.min(numberOfElementsToAggregate, collectionOfNumericValues.length));

    // Calculate the sum of these selected values using the reduce method.
    const finalCalculatedSum = valuesForSummation.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the final accumulated sum.
    console.log(finalCalculatedSum);
}

// Node.js specific code for reading input from standard input.
const nodeFileSystem = require("node:fs");

try {
    // Attempt to read all content from stdin synchronously.
    const inputContentFromStandardIn = nodeFileSystem.readFileSync("/dev/stdin", "utf8");
    // Pass the read content to our main processing function.
    processInputData(inputContentFromStandardIn);
} catch (readingError) {
    // Catch and report any errors encountered during file reading.
    console.error("Runtime error: Failed to read input from standard input stream.", readingError.message);
}