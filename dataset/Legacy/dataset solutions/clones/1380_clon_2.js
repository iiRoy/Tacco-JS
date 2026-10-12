'use strict';

// This immediately-invoked function expression processes input data.
(function(inputStringData) {
    // Split the raw input string into an array of lines.
    // Assuming 'sample' in the original code was a typo and meant 'hoge' (inputStringData).
    var rawLinesArray = inputStringData.split('\x0A');

    // Initialize an array to store parsed dimensions (width and height).
    var parsedDimensions = [];

    // Iterate through each line of the input data.
    for (var lineIndex = +0, totalLines = rawLinesArray.length; lineIndex < totalLines; ++lineIndex) {
        // Split the current line by space to get width and height strings.
        parsedDimensions[lineIndex] = rawLinesArray[lineIndex].split(' ');

        // Convert the first part to a number for width.
        var currentWidth = parsedDimensions[lineIndex][0] - 0;
        // Convert the second part to a number for height.
        var currentHeight = parsedDimensions[lineIndex][1] - 0;

        // Check for the termination condition (0 0).
        if (currentWidth === 0x0 && currentHeight === 0x0) {
            // If both dimensions are zero, exit the function.
            return false;
        }

        // Create the pattern for a full row of '#' characters.
        // The `join` method creates a string of (currentWidth - 1) '#'s, then one more is added.
        var fullRowPattern = (new Array(currentWidth + 1)).join(String.fromCharCode(35)) + '\x0A';

        // Create the pattern for a hollow row: '#' + (currentWidth - 2) '.' + '#' + newline.
        var hollowRowPattern = String.fromCharCode(35) + (new Array(currentWidth - 1)).join(String.fromCharCode(46)) + String.fromCharCode(35) + '\x0A';

        // Assemble the complete frame:
        // Top row (fullRowPattern)
        // Middle rows (hollowRowPattern repeated currentHeight - 2 times)
        // Bottom row (fullRowPattern)
        var generatedFrame = fullRowPattern + (new Array(currentHeight - 1)).join(hollowRowPattern) + fullRowPattern;

        // Output the generated ASCII frame to the console.
        console.log(generatedFrame);
    }
}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from standard input.
