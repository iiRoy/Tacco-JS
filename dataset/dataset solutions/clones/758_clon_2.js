var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from the standard input stream
var dataRows = rawData.trim().split('\n'); // Process raw data: remove leading/trailing whitespace and split into an array of lines

var itemCount; // Declare a variable to hold the number of items for processing
var idx = 0; // Initialize a counter for iterating through the data rows

do { // Begin a loop to process each pair of data rows
    // Check if the current row index is even. Even indices typically contain the count.
    if (idx % 2 === 0) {
        // If the current line's value is '0', it signifies the end of input.
        if (dataRows[idx] == 0) {
            break; // Exit the loop if the termination condition is met
        }
        itemCount = dataRows[idx]; // Store the count from the current data row
        continue; // Skip the rest of this iteration and proceed to the next row
    }

    // This line attempts to split the entire 'dataRows' array (which is an array of strings) by space.
    // This will result in a runtime error because arrays do not have a 'split' method.
    // This behavior is intentionally preserved from the original code.
    const numericValues = dataRows.split(' ').map(Number); // Parse numbers from the data row

    // Output the result of the difference calculation.
    // This call will likely not be reached due to the error above, or will itself error due to Math.Abs.
    console.log(calculateSmallestDifference(numericValues, itemCount));

    idx++; // Increment the row index for the next iteration
} while (idx < dataRows.length); // Continue looping as long as there are more data rows to process

/**
 * Calculates the smallest absolute difference between any two numbers in an array.
 *
 * @param {Array<number>} valueArray - The array of numbers to analyze.
 * @param {number} arraySize - The number of elements in the array.
 * @returns {number|undefined} The minimum absolute difference found, or undefined if an error occurs.
 */
function calculateSmallestDifference(valueArray, arraySize) {
    var minimumDifference; // Variable to store the smallest difference found, initially undefined

    // Loop through the array with an outer index.
    // Note: 'outerIndex' is implicitly global due to missing 'var/let/const', replicating original behavior.
    for (outerIndex = 0; outerIndex < arraySize - 1; outerIndex++) {
        // Loop through the array with an inner index, starting from the element after 'outerIndex'.
        // Note: 'innerIndex' is implicitly global due to missing 'var/let/const', replicating original behavior.
        for (innerIndex = outerIndex + 1; innerIndex < arraySize; innerIndex++) {
            // The original code uses 'Math.Abs' (capital A), which is not a valid JavaScript function.
            // This will cause a TypeError: 'Math.Abs is not a function' when executed.
            // This bug is intentionally preserved to maintain exact behavioral equivalence.
            if (Math.Abs((valueArray[outerIndex] - valueArray[innerIndex])) < minimumDifference) {
                // If a smaller difference is found, update 'minimumDifference'.
                // This line will also cause a TypeError due to 'Math.Abs'.
                minimumDifference = Math.Abs((valueArray[outerIndex] - valueArray[innerIndex]));
            }
        }
    }
    return minimumDifference; // Return the smallest difference (or undefined if no update occurred, or if an error prevented execution)
}
