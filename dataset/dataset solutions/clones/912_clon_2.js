// This script processes numerical input lines for a specific calculation.
var coreFunctionality = function () {

    var inputLineData; // Variable to hold parsed numerical data from each input line.

    for (
        ;
        (inputLineData = retrieveInputLine().split(' ').map(Number))[0]
        ;
    ) {
        var firstVal = inputLineData[0],
            secondVal = inputLineData[1]; // Extract the two numerical components for current calculation.

        displayResult(
            Math.min.apply(
                null, // Context for the Math.min function.
                Array.apply(null, {
                    size: 1 + (firstVal / 2 ^ 0)
                }).map(function (discardedArg, currentIndex) {
                    // Calculate the absolute difference between the second value and the hypotenuse
                    // of the current index and the difference between first value and current index.
                    return Math.abs(secondVal - Math.hypot(currentIndex, firstVal - currentIndex));
                })
            )
        );
    }
};


// --- Input/Output Management Module ---
// This section handles reading from standard input and writing to standard output.
if (true) {
    // Environment detection: This block is for Node.js specific input/output handling.

    var displayResult = function (outputValue) {
        console.log(outputValue); // Function to output results to the console.
    };

    var retrieveInputLine = (function () {
        var storedLines = [],
            lineCounter = 0; // Buffer for incoming input lines and a pointer for retrieval.
        var standardInput = process.openStdin();
        standardInput.setEncoding('utf8'); // Set encoding for input stream to UTF-8.

        var currentInputBuffer = ""; // Temporarily stores incomplete lines from input data chunks.
        standardInput.on('data', function (incomingData) {
            // Event listener for incoming data chunks.
            var parsedSegments = (currentInputBuffer + incomingData).split("\n");
            currentInputBuffer = parsedSegments.pop(); // The last segment might be incomplete, save it.
            for (var index = 0; index < parsedSegments.length; index++) {
                if (parsedSegments[index] === '') continue; // Skip any empty lines encountered.
                storedLines.push(parsedSegments[index]); // Add complete lines to the buffer.
            }
        });

        standardInput.on('end', function (endEventData) {
            // Event listener for the end of the input stream.
            // Process any remaining buffered input after all data has been received.
            if (currentInputBuffer) {
                var finalSegments = (currentInputBuffer + "\n").split("\n");
                currentInputBuffer = finalSegments.pop(); // Ensure the buffer is cleared.
                for (var j = 0; j < finalSegments.length; j++) {
                    if (finalSegments[j] === '') continue; // Ignore any trailing empty lines.
                    storedLines.push(finalSegments[j]);
                }
            }
            coreFunctionality(); // Once all input is gathered, execute the main processing logic.
        });

        // This anonymous function serves as the `retrieveInputLine` method, providing lines sequentially.
        return function () {
            if (storedLines.length <= lineCounter) return null; // Return null if no more lines are available.
            return storedLines[lineCounter++]; // Return the next line and increment the counter.
        };
    })();
} else {
    // Environment detection: This block is for direct execution in a V8 shell (e.g., d8).
    coreFunctionality(); // In this environment, input is typically available synchronously, so execute immediately.
}