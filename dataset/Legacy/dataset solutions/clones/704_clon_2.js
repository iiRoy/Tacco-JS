process.stdin.resume();
process.stdin.setEncoding('utf8');

// Set up an event listener to process incoming data from standard input.
process.stdin.on('data', function(inputString) {
    processInputLines(inputString);
});

// Alias console.log for output operations.
var outputFunc = console.log;

/**
 * Pre-processes the raw input string by splitting it into lines
 * and filtering out any empty lines.
 * @param {string} inputString - The raw string received from stdin.
 */
function processInputLines(inputString) {
    // Split the input string by newline characters to get individual lines.
    var parsedLines = inputString.split("\n");

    // Filter out any lines that are empty strings.
    parsedLines = parsedLines.filter(function(element) {
        return (element !== "");
    });

    // Pass the cleaned array of lines to the main logic function.
    executeLogic(parsedLines);
}

//-----------
/**
 * Executes the core logic of the program, processing numeric data in chunks.
 * @param {string[]} dataRows - An array of string representations of numbers.
 */
function executeLogic(dataRows) {
    // Convert all string elements in the array to numbers.
    var numericData = dataRows.map(function(item) {
        return Number(item);
    });

    // Continue processing as long as there's more than one element left in the numeric data array.
    while (numericData.length > 1) {
        // The first element indicates the size of the next tuple to process.
        var tupleSize = numericData.shift();

        // Extract the current array (tuple) based on the tupleSize.
        var currentArray = numericData.slice(0, tupleSize);

        // Update the main numericData array by removing the processed tuple.
        numericData = numericData.slice(tupleSize);

        // Find the index of the minimum value in the current array.
        var minValIndex = currentArray.indexOf(Math.min.apply(null, currentArray));

        // Remove the minimum value from the array.
        currentArray.splice(minValIndex, 1);

        // Find the index of the maximum value in the modified array.
        var maxValIndex = currentArray.indexOf(Math.max.apply(null, currentArray));

        // Remove the maximum value from the array.
        currentArray.splice(maxValIndex, 1);

        // Calculate the sum of the remaining elements in the array.
        var totalSum = currentArray.reduce(function(previousValue, currentValue, currentIndex, arrayRef) {
            return previousValue + currentValue;
        });

        // Calculate the floor of the average of the remaining elements and output it.
        outputFunc(Math.floor(totalSum / currentArray.length));
    }
}
