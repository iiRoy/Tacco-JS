process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputString) {
    // When data is received from standard input, pass it to our initial processing function.
    processInputData(inputString);
});

// Create an alias for console.log for consistent output handling.
var outputResult = console.log;

/**
 * Handles the initial processing of the raw input string.
 * It splits the string into individual lines and filters out any empty entries.
 * The cleaned array of lines is then passed to the main algorithm.
 * @param {string} inputString - The raw string content received from stdin.
 */
function processInputData(inputString) {
    // Split the incoming string by newline characters to get an array of lines.
    var inputLinesArray = inputString.split("\n");

    // Filter the array to remove any empty strings, which might occur from trailing newlines.
    inputLinesArray = inputLinesArray.filter(function(element) {
        return (element !== ""); // Only keep lines that are not empty.
    });

    // Invoke the core logic function with the prepared array of lines.
    executeProcessingLogic(inputLinesArray);
}

// --- Main Algorithm Implementation ---

/**
 * Executes the primary data processing algorithm.
 * It takes an array of stringified numbers, converts them, and then processes them in segments.
 * For each segment, it removes the minimum and maximum values, calculates the average of the rest,
 * and outputs the rounded average.
 * @param {string[]} numericStrings - An array where each string represents a number.
 */
function executeProcessingLogic(numericStrings) {
    // Convert all string elements in the input array to actual numeric values.
    var dataSequence = numericStrings.map(function(item) {
        return Number(item);
    });

    // Continue processing as long as there are enough elements in the data sequence
    // to determine a segment length and at least one segment.
    while (dataSequence.length > 1) {
        // The first number in the sequence indicates the length of the next segment to process.
        var segmentLength = dataSequence.shift();

        // Extract the current segment from the beginning of the data sequence.
        var currentSegment = dataSequence.slice(0, segmentLength);

        // Update the main data sequence by removing the elements that were just extracted into the segment.
        dataSequence = dataSequence.slice(segmentLength);

        // Find the index of the smallest value within the current segment.
        // Math.min.apply(this, currentSegment) is used to pass array elements as individual arguments to Math.min.
        var minIndex = currentSegment.indexOf(Math.min.apply(this, currentSegment));
        // Remove the minimum value from the segment.
        currentSegment.splice(minIndex, 1);

        // Find the index of the largest value within the modified segment (after removing the minimum).
        var maxIndex = currentSegment.indexOf(Math.max.apply(this, currentSegment));
        // Remove the maximum value from the segment.
        currentSegment.splice(maxIndex, 1);

        // Calculate the sum of the remaining elements in the segment using the reduce method.
        var segmentSum = currentSegment.reduce(function(previousValue, currentValue, currentIndex, arrayReference) {
            return previousValue + currentValue;
        });

        // Calculate the average of the remaining elements and output it, rounded to the nearest whole number.
        outputResult(Math.round(segmentSum / currentSegment.length));
    }
}
