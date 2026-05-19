var inputLines = [];
var unusedVariable = 0; // This variable is declared but not utilized in the program's logic.

// Import the 'readline' module to handle input/output operations.
var readline = require('readline');

// Create an interface for reading input line by line from the standard input.
var interfaceHandler = readline.createInterface({
    input: process.stdin, // Standard input stream.
    output: process.stdout, // Standard output stream (not used for direct output in this case, but required by createInterface).
});

// Event listener for each line of input received.
interfaceHandler.on('line', function (currentLine) {
    inputLines.push(currentLine); // Store the received line in our array.
});

// Event listener for when the input stream closes (e.g., EOF is reached).
interfaceHandler.on('close', function () {
    // Parse the first two numbers from the initial input line.
    var firstParam = parseNumberAtIndex(inputLines[0], 0); // N
    var secondParam = parseNumberAtIndex(inputLines[0], 1); // M

    // Process the second line of input: split by space and convert to numbers.
    var numberArray = inputLines[1].split(" ").map(strVal => Number(strVal));

    // Initialize an array to store prefix sums modulo M.
    var prefixSumsMod = [];
    prefixSumsMod[0] = 0; // The sum before any elements is 0.

    // Calculate prefix sums modulo M.
    for (var idx = 0; idx < firstParam; idx++) {
        prefixSumsMod[idx + 1] = (prefixSumsMod[idx] + numberArray[idx]) % secondParam;
    }

    // Initialize the final count and a frequency map for remainders.
    var finalCount = 0;
    var remainderCounts = {}; // Object to store counts of each remainder.

    // Iterate through the prefix sums to find pairs.
    for (var idx = 0; idx < prefixSumsMod.length; idx++) {
        // If the current remainder hasn't been seen before, initialize its count to 0.
        if (remainderCounts[prefixSumsMod[idx]] === undefined) {
            remainderCounts[prefixSumsMod[idx]] = 0;
        }

        // Add the count of previous occurrences of this remainder to the total.
        finalCount += remainderCounts[prefixSumsMod[idx]];
        // Increment the count for the current remainder.
        remainderCounts[prefixSumsMod[idx]]++;
    }

    // Output the final calculated count.
    console.log(finalCount);
});

/**
 * Parses a number from a space-separated string at a specific index.
 * @param {string} inputString - The string containing space-separated numbers.
 * @param {number} indexToExtract - The zero-based index of the number to extract.
 * @returns {number} The parsed number.
 */
function parseNumberAtIndex(inputString, indexToExtract) {
    return (Number(inputString.split(" ")[indexToExtract]));
}
