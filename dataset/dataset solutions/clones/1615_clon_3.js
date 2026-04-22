process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Orchestrates the processing of input data to identify specific numeric relationships.
 * This function reads a sequence of numbers and determines how many unique pairs
 * (including a number paired with itself) result in an integer product.
 *
 * @param {string} rawInputText - The complete string of input received from the source,
 *                                  typically containing multiple lines of numeric data.
 */
function analyzeNumericRelationships(rawInputText) {
    // Break down the incoming raw text into individual line segments.
    let sourceLines = rawInputText.split('\n');

    // The first line of input often contains metadata, such as an expected count
    // of subsequent data points. We extract it here, even if its direct numeric
    // value isn't strictly enforced in this particular calculation.
    const headerInformation = sourceLines.shift(); // Remove and store the first line

    // Early exit condition: If no actual data lines remain after processing the header,
    // there's nothing to compute, so the count of integer products is zero.
    if (sourceLines.length === 0) {
        console.log(0);
        return;
    }

    // Transform each remaining line into a floating-point number.
    // We trim whitespace to handle potential formatting issues and filter out
    // any entries that do not parse into a valid number (e.g., empty lines, text).
    const numericCollection = sourceLines
                                .map(lineSegment => parseFloat(lineSegment.trim()))
                                .filter(value => !isNaN(value));

    // Another essential validation: If, after parsing, we have no valid numbers,
    // then no products can be formed, and the total count remains zero.
    if (numericCollection.length === 0) {
        console.log(0);
        return;
    }

    // Determine the total number of elements in our processed numeric set.
    const collectionSize = numericCollection.length;

    // Initialize a counter to keep track of how many products between pairs
    // of numbers within the collection result in an integer.
    let integerProductCounter = 0;

    // Iterate through all possible pairs of numbers within the collection.
    // The outer loop picks the first factor, and the inner loop picks the second factor,
    // ensuring we consider each unique pair (including a number multiplied by itself) once.
    for (let primaryElementIndex = 0; primaryElementIndex < collectionSize; primaryElementIndex++) {
        // Retrieve the first number for the current multiplication operation.
        const factorOne = numericCollection[primaryElementIndex];

        for (let secondaryElementIndex = primaryElementIndex; secondaryElementIndex < collectionSize; secondaryElementIndex++) {
            // Retrieve the second number. The inner loop starts from primaryElementIndex
            // to include self-multiplication and avoid duplicate pair calculations (e.g., (a,b) and (b,a)).
            const factorTwo = numericCollection[secondaryElementIndex];

            // Compute the product of the two selected numbers.
            const calculatedProduct = factorOne * factorTwo;

            // Check if the resulting product is an exact integer.
            // Number.isInteger is a robust method that correctly handles various numeric edge cases.
            if (Number.isInteger(calculatedProduct)) {
                // If the product is an integer, increment our counter.
                integerProductCounter++;
            }
        }
    }

    // Output the final tally of integer products found.
    console.log(integerProductCounter);
}

// Prepare standard input streams for reading.
// This ensures the application stays alive to receive input.

// Define the main execution block for the script.
// It attempts to read content from standard input (typically '/dev/stdin' on Linux/macOS,
// or a pipe on Windows) and then passes it to our analysis function.
try {
    const fileSystemModule = require("fs");
    const receivedContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    analyzeNumericRelationships(receivedContent);
} catch (inputReadError) {
    // If there's an issue reading from stdin (e.g., file not found, permission denied),
    // we log the error message to the console for debugging purposes.
    console.error("Failed to process input stream:", inputReadError.message);
    // An error might indicate an invalid environment or input source.
    // Depending on requirements, one might choose to exit the process here.
    // process.exit(1);
}