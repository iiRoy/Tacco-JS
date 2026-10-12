function processInputLines(sourceLines) {
    // Locate the position of the termination sequence "0 0" within the provided data.
    var sentinelPosition = sourceLines.indexOf('0 0');
    var formattedResults = [];

    // Iterate through each line of data until the termination sequence is encountered.
    for (var currentLineIndex = 0; currentLineIndex < sentinelPosition; currentLineIndex++) {
        var lineParts = sourceLines[currentLineIndex].split(' ');
        // Convert string parts to integers for numerical comparison.
        if (parseInt(lineParts[1]) < parseInt(lineParts[0])) {
            // If the second number is smaller, append them in ascending order.
            formattedResults.push(lineParts[1] + ' ' + lineParts[0]);
        } else {
            // Otherwise, append the original line as is.
            formattedResults.push(sourceLines[currentLineIndex]);
        }
    }
    // Output all processed lines, separated by newline characters.
    console.log(formattedResults.join('\n'));
}


/*
// Standard input handling setup for Node.js environments.
process.stdin.resume();
var accumulatedInput = '';
process.stdin.setEncoding('utf-8');

// Accumulate incoming data chunks.
process.stdin.on('data', function(dataSegment) {
    accumulatedInput += dataSegment;
});

// When all input has been received, process it.
process.stdin.on('end', function() {
    var parsedInputData = accumulatedInput.split('\n');
    processInputLines(parsedInputData);
});
*/
