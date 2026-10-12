process.stdin.resume();
process.stdin.setEncoding('utf8');

// Set up an event listener to process incoming data from standard input.
process.stdin.on('data', function(inputDataChunk) {
    // Trim any leading/trailing whitespace from the input and pass it to the main processing function.
    processInput(inputDataChunk.trim());
});

/**
 * Main function to process the input chunk, perform array manipulations, and print results.
 * @param {string} inputData - The raw input string received from stdin.
 */
function processInput(inputData) {
    // Split the input string into an array of lines.
    var inputLines = inputData.split("\n");

    // The first line contains the width value.
    var widthVal = Number(inputLines[0]);
    // The second line contains the number of swap operations.
    var numSwaps = Number(inputLines[1]);

    // Initialize an array with sequential numbers from 1 to widthVal.
    var resultArray = [];
    for (var idx = 1; idx <= widthVal; idx++) {
        resultArray.push(idx);
    }

    // Initialize a pointer to the current line being read for swap operations.
    var linePointer = 2;

    // Iterate through each swap operation.
    for (var k = 0; k < numSwaps; k++) {
        // Parse the current line to get the two positions for swapping.
        // Subtract 1 to convert to zero-based indexing.
        var firstPos = Number(inputLines[linePointer].split(",")[0]) - 1;
        var secondPos = Number(inputLines[linePointer].split(",")[1]) - 1;

        // Perform the swap using a temporary variable.
        var tempVal = resultArray[firstPos];
        resultArray[firstPos] = resultArray[secondPos];
        resultArray[secondPos] = tempVal;

        // Move to the next line for the subsequent swap operation.
        linePointer++;
    }

    // Print each element of the final resultArray on a new line.
    for (var j = 0; j < widthVal; j++) {
        console.log(resultArray[j]);
    }
}
