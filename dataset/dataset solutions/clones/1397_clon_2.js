(function(rawData) {
    // This function processes each line of the provided input data.
    var linesArray = rawData.split('\n');

    // Iterate through each parsed line.
    for (var idx = 0; idx < linesArray.length; idx++) {
        var currentLine = linesArray[idx];

        // If the current line contains a question mark, terminate processing.
        if (currentLine.match(/\?/)) {
            return;
        }

        // Evaluate the current line as a JavaScript expression and print the result.
        console.log(eval(currentLine));
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
