"use strict"; // Enforce stricter parsing and error handling for better code quality

// Acquire raw text data from the standard input stream
var sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Divide the acquired string into an array of tokens, using spaces or newlines as separators.
// A cursor for the token array is also declared, although it is not utilized in this particular algorithm.
var tokenArray = sourceContent.split(/ |\n/), tokenPointer = 0;

// Invoke the primary routine responsible for data computation.
var finalResult = processData();

// If the computation yields a non-null or non-undefined outcome, print it to the console.
if (finalResult !== undefined) {
    console.log(finalResult);
}


/**
 * Core function to execute the numerical data manipulation.
 * It identifies and counts specific pairs based on derived sums and differences
 * between array indices and their corresponding values.
 *
 * @returns {number} The ultimate tally of all identified matching pairs.
 */
function processData() {
    // The initial element of the token stream, representing the total count
    // of subsequent data points, is extracted. Its value is not further used.
    let itemCount = +tokenArray.shift();

    // This object stores the frequency of (loop_index + numerical_value) combinations.
    let sumCounts = {};

    // This object stores the frequency of (loop_index - numerical_value) combinations.
    let diffCounts = {};

    // Iterate through each remaining token in the array.
    // 'loopIndex' refers to the zero-based index of the current element within the 'tokenArray'
    // after the initial 'itemCount' has been removed.
    tokenArray.forEach((currentValue, loopIndex) => {
        // Convert the string representation of the current token into a numeric type.
        let numericValue = +currentValue;

        // Compute the sum key and update its frequency in 'sumCounts'.
        // If the key doesn't exist, it's initialized to 0 then incremented.
        sumCounts[String(loopIndex + numericValue)] = (sumCounts[String(loopIndex + numericValue)] || 0) + 1;

        // Compute the difference key and update its frequency in 'diffCounts'.
        // Similar logic applies for initial entry or incrementation.
        diffCounts[String(loopIndex - numericValue)] = (diffCounts[String(loopIndex - numericValue)] || 0) + 1;
    });

    // Retrieve all distinct keys (representing sum values) present in the 'sumCounts' collection.
    let sumKeys = Object.keys(sumCounts);

    // Initialize a counter to accumulate the total number of valid pairs.
    let totalPairs = 0;

    // Filter the 'sumKeys' to retain only those keys that also exist within 'diffCounts'.
    // For each such common key, multiply its frequency from 'sumCounts' by its frequency
    // from 'diffCounts', and add the product to 'totalPairs'.
    sumKeys.filter(keyVal => diffCounts[keyVal]).forEach(keyVal => {
        totalPairs += (sumCounts[keyVal] * diffCounts[keyVal]);
    });

    // Return the final calculated aggregate.
    return totalPairs;
}