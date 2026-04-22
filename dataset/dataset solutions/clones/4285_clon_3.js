process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all input lines received from standard input.
let inputReadings = [];

// Establish an interface for reading lines using the 'readline' module.
const lineInputProcessor = require('readline').createInterface({
    input: process.stdin,   // Source for input data.
    output: process.stdout  // Destination for output data (not explicitly used for writing in this script).
});

// Register an event handler for each new line received from the input stream.
lineInputProcessor.on('line', (currentLineSegment) => {
    // Trim any leading/trailing whitespace from the line and store it.
    inputReadings.push(currentLineSegment.trim());
});

// Register an event handler for when the input stream signals its end.
lineInputProcessor.on('close', () => {
    // Verify that at least two lines of input were provided, as required for the calculation.
    if (inputReadings.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines for processing.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Parse the first line to determine the total count 'N'.
    const totalItemsCount = parseInt(inputReadings[0], 10);

    // Validate 'totalItemsCount' to ensure it's a valid non-negative integer.
    if (isNaN(totalItemsCount) || totalItemsCount < 0) {
        console.error("Error: Invalid total items count provided. Must be a non-negative integer.");
        process.exit(1);
    }

    // Process the second line: split it into individual string values,
    // convert each to a number, and filter out any non-numeric results.
    const numericDataSet = inputReadings[1].split(" ").map(itemValue => {
        const parsedValue = Number(itemValue); // Explicit conversion to number.
        if (isNaN(parsedValue)) {
            // Log a warning for non-numeric entries and return null to be filtered later.
            console.error(`Warning: Non-numeric value '${itemValue}' detected in the data set. This value will be skipped.`);
            return null;
        }
        return parsedValue;
    }).filter(val => val !== null); // Remove any entries that failed parsing.

    // Initialize a counter specifically for even numbers found in the data set.
    let evenNumberQuantity = 0;

    // Iterate through the processed numeric data to count how many elements are even.
    for (const item of numericDataSet) {
        // Use a bitwise AND operation to efficiently check if a number is even.
        // A number is even if its least significant bit is 0.
        if ((item & 1) === 0) {
            evenNumberQuantity++;
        }
    }

    // Define named constants for the bases used in the exponential calculations,
    // enhancing readability and maintainability.
    const BASE_FOR_ALL_POSSIBILITIES = 3;
    const BASE_FOR_EXCLUDED_CASES = 2;

    // Calculate the total number of combinations using the ES6 exponentiation operator.
    const allPossibleCombinations = BASE_FOR_ALL_POSSIBILITIES ** totalItemsCount;

    // Calculate the number of combinations that need to be excluded.
    const excludedCasesValue = BASE_FOR_EXCLUDED_CASES ** evenNumberQuantity;

    // Compute the final result by subtracting the excluded cases from all possibilities.
    const finalCalculatedValue = allPossibleCombinations - excludedCasesValue;

    // Output the computed final value to the console.
    console.log(finalCalculatedValue);
});