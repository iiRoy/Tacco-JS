'use strict';

/**
 * Processes the raw input string to calculate the sum of the two smallest numbers.
 * @param {string} rawData - The raw input string from standard input.
 */
function ProcessInput(rawData) {
    // Split the input string by newline, take the first line, then split by space.
    // This assumes the input consists of a single line of space-separated numbers.
    const parsedNumbers = rawData.split("\n")[0].split(" ");

    // Sort the array of string numbers in ascending numerical order.
    // The comparison function (a, b) => a - b ensures numerical sorting.
    parsedNumbers.sort((a, b) => a - b);

    // Parse the first two (smallest) numbers as integers and log their sum.
    // parseInt(..., 10) ensures parsing in base 10.
    console.log(parseInt(parsedNumbers[0], 10) + parseInt(parsedNumbers[1], 10));
}

// Read the input from standard input and pass it to the processing function.
// require("fs") gets the file system module.
// .readFileSync("/dev/stdin", "utf8") reads the entire content of stdin as a UTF-8 string.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
