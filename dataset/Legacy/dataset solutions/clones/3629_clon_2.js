var inputLines = [];
var unusedVariable = 0; // This variable was declared but not utilized in the original logic.

// Import the necessary module for reading input line by line.
var standardInputReader = require('readline');

// Configure the interface for reading from standard input and writing to standard output.
var inputReader = standardInputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line of input received.
inputReader.on('line', function (currentLine) {
    inputLines.push(currentLine); // Store the received line in our array.
});

// Event listener for when the input stream is closed.
inputReader.on('close', function () {
    // Parse the first line to get the two main parameters.
    var totalElements = parseNumberAtIndex(inputLines[0], 0);
    var moduloValue = parseNumberAtIndex(inputLines[0], 1);

    // Parse the second line, splitting by space and converting each part to a number.
    var inputArray = inputLines[1].split(" ").map(elementString => Number(elementString));

    // Initialize an array to store prefix sums modulo M.
    // The first element (index 0) is always 0, representing the sum before any elements.
    var prefixSums = [];
    prefixSums[0] = 0;

    // Calculate the cumulative sums modulo M.
    // This loop computes prefixSums[k+1] = (prefixSums[k] + inputArray[k]) % moduloValue.
    for (var idx = 0; idx < totalElements; idx++) {
        prefixSums[idx + 1] = (prefixSums[idx] + inputArray[idx]) % moduloValue;
    }

    // Initialize the final count of subarrays and a frequency map for remainders.
    var finalCount = 0;
    var remainderCounts = {}; // This object will store how many times each remainder has appeared.

    // Iterate through the prefix sums to find pairs that satisfy the condition.
    // If prefixSums[j] and prefixSums[i] (where j > i) have the same remainder modulo M,
    // then the subarray from index i to j-1 sums to a multiple of M.
    for (var idx = 0; idx < prefixSums.length; idx++) {
        // If this remainder hasn't been seen before, initialize its count to zero.
        if (remainderCounts[prefixSums[idx]] === undefined) {
            remainderCounts[prefixSums[idx]] = 0;
        }

        // Add the number of times this remainder has been seen previously to our total count.
        // Each previous occurrence forms a valid subarray ending at the current position.
        finalCount += remainderCounts[prefixSums[idx]];

        // Increment the count for the current remainder.
        remainderCounts[prefixSums[idx]]++;
    }

    // Output the final calculated count.
    console.log(finalCount);
});

/**
 * Parses a number from a space-separated string at a specific index.
 * @param {string} inputString - The string containing space-separated numbers.
 * @param {number} indexToParse - The zero-based index of the number to parse.
 * @returns {number} The parsed number.
 */
function parseNumberAtIndex(inputString, indexToParse) {
    return (Number(inputString.split(" ")[indexToParse]));
}
