process.stdin.resume();
process.stdin.setEncoding('ascii');

/*
 * Variable to accumulate all incoming standard input data.
 * Initially an empty string, data chunks will be appended here.
 */
var accumulatedInputData = "";
// This variable will hold the input data split into individual lines
var parsedInputLines = "";

  // Index tracking the current line being processed from the input array.
var currentLineIndex = 0;

// Event listener for incoming data from standard input.
process.stdin.on('data', function (chunkOfData) {
        accumulatedInputData += chunkOfData; // Append new data to the total input string.
});

/*
 * This section was previously commented out. It shows a potential way
 * to handle process interruption (e.g., Ctrl+C) to process input
 * and exit cleanly. For this specific problem, the 'end' event is used.
process.on('SIGINT', function(){
    parsedInputLines = accumulatedInputData.split("\n");
    executeCoreLogic();
    process.exit();
});
*/

// Event listener for the 'end' of standard input stream.
process.stdin.on('end', function () {
    parsedInputLines = accumulatedInputData.split("\n");  // Split the entire input into an array of lines.
    executeCoreLogic(); // Invoke the primary function to handle the problem logic.
});

// Function to retrieve the next line from the parsed input array.
function getNextInputLine() {
    return parsedInputLines[currentLineIndex++]; // Return current line and increment the index.
}

// ----------------------------------------------------------------------
// The core problem-solving logic begins below this demarcation line.
// ----------------------------------------------------------------------

function executeCoreLogic() {
    // Read the first line of input, which contains grid dimensions.
    var firstLineContent = getNextInputLine();

    // Split the first line by space to get individual dimension values.
    firstLineContent = firstLineContent.split(' ');

    // Parse the dimensions for the larger grid (N) and the pattern grid (M).
    var gridSizeN = parseInt(firstLineContent[0]);
    var patternSizeM = parseInt(firstLineContent[1]);

    // Initialize arrays to store the rows of the larger grid and the pattern grid.
    var largeGridMatrix = [];
    var smallPatternMatrix = [];

    // Loop to read and populate the rows of the large grid.
    for (var rowIterator = 0; rowIterator < gridSizeN; rowIterator++) {
        // Read a line, take the relevant substring (up to N characters) and add to the grid.
        var currentGridRowText = getNextInputLine().substring(0, gridSizeN);
        largeGridMatrix.push(currentGridRowText);
    }

    // Loop to read and populate the rows of the small pattern grid.
    for (var patternRowIterator = 0; patternRowIterator < patternSizeM; patternRowIterator++) {
        // Read a line, take the relevant substring (up to M characters) and add to the pattern.
        var currentRowPatternText = getNextInputLine().substring(0, patternSizeM);
        smallPatternMatrix.push(currentRowPatternText);
    }

    // Variable to store the ultimate result, initialized to "No".
    var finalVerdict = "No";

    // Iterate through possible starting rows in the large grid where the pattern could fit.
    for (var outerGridRowIndex = 0; outerGridRowIndex < gridSizeN - patternSizeM + 1; outerGridRowIndex++) {
        // Iterate through possible starting columns in the large grid where the pattern could fit.
        for (var outerGridColIndex = 0; outerGridColIndex < gridSizeN - patternSizeM + 1; outerGridColIndex++) {
            // Flag to check if the current subgrid matches the pattern.
            var isMatchFound = 1;

            // Iterate through each row of the pattern.
            for (var patternMatchRowIndex = 0; patternMatchRowIndex < patternSizeM; patternMatchRowIndex++) {
                // Extract the corresponding sub-row from the large grid.
                // Compare it with the current row of the pattern.
                if (largeGridMatrix[outerGridRowIndex + patternMatchRowIndex].substring(outerGridColIndex, patternSizeM).localeCompare(smallPatternMatrix[patternMatchRowIndex]) !== 0) {
                    isMatchFound = 0; // If they don't match, set flag to 0.
                    break; // No need to check further rows for this subgrid.
                }
            }

            // If the flag is still 1 after checking all pattern rows, a match was found.
            if (isMatchFound === 1) {
                process.stdout.write("Yes"); // Output "Yes".
                process.exit(); // Terminate the process as a match is confirmed.
            }
        }
    }

    // If the loops complete without finding any match, output "No".
    process.stdout.write("No");
    process.exit(); // Terminate the process.
}