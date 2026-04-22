process.stdin.resume();


process.stdin.setEncoding('utf8');


process.stdin.on('data', function (incomingDataBlock) {
    // Process the received data by trimming whitespace and passing it to the core logic handler.
    performShuffle(incomingDataBlock.trim());
});

/**
 * Executes a series of element swaps based on the provided input.
 * This function reads configuration parameters and then performs specified
 * permutation operations on a sequence of numbers.
 *
 * @param {string} rawInputBlock The raw string data, typically from standard input,
 *                                containing configuration and swap instructions.
 */
function performShuffle(rawInputBlock) {
    // Divide the raw input string into an array, where each element is a line.
    var inputRows = rawInputBlock.split("\n");

    // The first line specifies the total size of the collection.
    var containerSize = parseInt(inputRows[0], 10);

    // The second line indicates how many swap operations will be executed.
    var operationCount = parseInt(inputRows[1], 10);

    // Initialize an array to store the numerical elements.
    var dataElements = [];

    // Populate the array with a sequence of integers from 1 up to the defined container size.
    for (let currentNum = 1; currentNum <= containerSize; currentNum++) {
        dataElements.push(currentNum);
    }

    // Set an internal pointer to start reading swap instructions from the third line onwards.
    var currentLinePtr = 2;

    // Iterate through each of the specified swap operations.
    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        // Parse the current line for swap positions, splitting by comma.
        const positions = inputRows[currentLinePtr].split(",");

        // Convert the first position string to an integer, adjusting for zero-based indexing.
        var firstPosition = parseInt(positions[0], 10) - 1;

        // Convert the second position string to an integer, adjusting for zero-based indexing.
        var secondPosition = parseInt(positions[1], 10) - 1;

        // Store the value at the first position temporarily before overwriting.
        var temporaryValue = dataElements[firstPosition];

        // Move the value from the second position to the first.
        dataElements[firstPosition] = dataElements[secondPosition];

        // Move the temporarily stored value to the second position, completing the swap.
        dataElements[secondPosition] = temporaryValue;

        // Advance the line pointer to the next operation instruction.
        currentLinePtr++;
    }

    // After all swap operations are complete, print each element of the modified array on a new line.
    for (let outputIter = 0; outputIter < containerSize; outputIter++) {
        console.log(dataElements[outputIter]);
    }
}