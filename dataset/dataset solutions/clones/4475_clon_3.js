const ProcessInputData = (inputBuffer) => {
    // This function processes raw input to extract and compute the sum of top K elements.

    const inputLines = inputBuffer.trim().split('\n');

    // --- Input Validation and Parsing (Added Guard Clauses & Intermediate Steps) ---
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least 2.");
        return; // Exit if input is malformed
    }

    const configurationLineParts = inputLines[0].split(' ');
    if (configurationLineParts.length < 2) {
        console.error("Error: Configuration line malformed. Expected N and K.");
        return;
    }

    const totalItemsCount = parseInt(configurationLineParts[0], 10);
    const itemsToSelectCount = parseInt(configurationLineParts[1], 10);

    // Basic numerical validation
    if (isNaN(totalItemsCount) || isNaN(itemsToSelectCount) || totalItemsCount < 0 || itemsToSelectCount < 0) {
        console.error("Error: Invalid N or K values. Must be non-negative integers.");
        return;
    }

    const dataItemsAsStrings = inputLines[1].split(' ');

    if (dataItemsAsStrings.length < totalItemsCount) {
        console.error(`Error: Data line has fewer elements (${dataItemsAsStrings.length}) than specified N (${totalItemsCount}).`);
        return;
    }

    // Convert string items to numbers using map, with a safety check
    const numericalDataPoints = dataItemsAsStrings.slice(0, totalItemsCount).map(itemStr => {
        const numVal = parseFloat(itemStr); // Using parseFloat for more general number parsing
        if (isNaN(numVal)) {
            console.error(`Error: Non-numeric value encountered in data: '${itemStr}'`);
            throw new Error("Invalid data format."); // Propagate error for malformed data
        }
        return numVal;
    });
    // --- End Input Validation and Parsing ---


    // Sort the numerical data points in descending order
    // Replaced separate 'compare' function with an inline arrow function for conciseness.
    // (valB - valA) ensures descending order.
    numericalDataPoints.sort((valA, valB) => valB - valA); 

    // Ensure K does not exceed the available number of data points
    const actualItemsToSum = Math.min(itemsToSelectCount, numericalDataPoints.length);

    // Calculate the sum of the top K elements
    // Replaced the 'for' loop with slice() and reduce() for a more functional approach.
    const calculatedSum = numericalDataPoints
        .slice(0, actualItemsToSum)
        .reduce((currentTotal, value) => currentTotal + value, 0);

    console.log(calculatedSum);
};

// --- Execution Block (Modified to include error handling) ---
try {
    const INPUT_SOURCE_PATH = '/dev/stdin'; // Constant for input path
    const rawInputContent = require('fs').readFileSync(INPUT_SOURCE_PATH, 'utf8');
    ProcessInputData(rawInputContent);
} catch (executionError) {
    console.error("An error occurred during program execution:", executionError.message);
    // Potentially log more details or exit with a specific code
    process.exit(1);
}
// --- End Execution Block ---