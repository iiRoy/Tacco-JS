var inputData = []; // Array to store incoming lines from standard input.

// Initialize a readline interface to handle input and output streams.
var inputProcessor = require('readline').createInterface({
    input: process.stdin,  // Use standard input as the source.
    output: process.stdout // Use standard output for any potential prompts (though not used here).
});

// Event listener for each line received from the input stream.
inputProcessor.on('line', function (currentLine) {
    // Add the current line to our collection of input data.
    inputData.push(currentLine);
});

// Event listener for when the input stream is closed.
inputProcessor.on('close', function () {
    // Check if exactly one line of input was provided.
    if (inputData.length === 1) {
        // Remove all forward slashes from the first (and only) input line
        // to get a pure integer representation of the date.
        var parsedDateValue = inputData[0].replace(/\//g, '');

        // Compare the numeric date value against a specific threshold.
        if (parsedDateValue <= 20190430) {
            // If the date is on or before April 30, 2019, print 'Heisei'.
            console.log('Heisei');
            return; // Exit the function after printing.
        }
    }
    // If there was not exactly one line of input, or if the date was after
    // April 30, 2019, print 'TBD'.
    console.log('TBD');
});
