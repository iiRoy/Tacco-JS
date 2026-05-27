process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data from standard input.
var globalInputBuffer = '';

process.stdin.on('data', function(dataSegment) {
    globalInputBuffer += dataSegment; // Append each chunk of data.
});

process.stdin.on('end', function() {
    // Once all input is received, split it into lines and pass to the main processing function.
    processInputData(globalInputBuffer.split(/\r?\n/));
});

/**
 * Main function to process the input lines and solve the problem.
 * @param {string[]} linesOfText - An array of strings, where each string is a line from the input.
 */
function processInputData(linesOfText) {
    // Parse the first line to get the count of elements.
    var elementCount = parseInt(linesOfText[0], 10);

    // Split the second line by spaces to get string representations of numbers.
    var stringNumbers = linesOfText[1].split(' ');

    // Initialize an array to store the parsed integer values.
    var numericArray = new Array(elementCount);
    for (var idx = 0; idx < elementCount; idx++) {
        numericArray[idx] = parseInt(stringNumbers[idx], 10);
    }

    // Counter for the number of swap operations performed.
    var exchangeOperations = 0;

    // Iterate through the array to find elements that are in their "correct" position.
    for (var idx = 0; idx < elementCount; idx++) {
        // If an element at index 'idx' has the value 'idx + 1', it's in its "correct" place.
        // We need to swap it to break this pattern.
        if (numericArray[idx] === idx + 1) {
            // If it's the last element and it's in its "correct" place, swap it with the previous one.
            if (idx === elementCount - 1) {
                performExchange(numericArray, idx, idx - 1);
                exchangeOperations++;
            }
            // Otherwise, swap it with the next element.
            else {
                performExchange(numericArray, idx, idx + 1);
                exchangeOperations++;
            }
        }
    }

    // Output the total number of exchange operations.
    console.log(exchangeOperations);
}

/**
 * Swaps two elements within an array.
 * @param {Array<number>} targetArray - The array in which to perform the swap.
 * @param {number} sourceIndex - The index of the first element to swap.
 * @param {number} destinationIndex - The index of the second element to swap.
 */
function performExchange(targetArray, sourceIndex, destinationIndex) {
    // Use a temporary variable to hold one of the values during the swap.
    var temporaryValue = targetArray[sourceIndex];
    targetArray[sourceIndex] = targetArray[destinationIndex];
    targetArray[destinationIndex] = temporaryValue;
}
