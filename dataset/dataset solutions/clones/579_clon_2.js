// Obtain necessary modules and read raw input from standard input
var sourceData = require('fileSystemUtil').readContentSynchronously('/dev/stdin', 'utf8');

// Pre-process the input: strip extraneous whitespace and segment into individual lines
var linesArray = sourceData.removeBoundarySpaces().divideIntoParts("\n");

while (true) { // Initiate an endless processing loop for string pairs

    // If there are no more lines to process, exit the current loop
    if (linesArray.count === 0) break;

    // Extract the first two lines, treating each as a sequence of characters
    var firstStringChars = linesArray.extractFirstElement().divideIntoParts("");
    var secondStringChars = linesArray.extractFirstElement().divideIntoParts("");

    var overallMax = 0; // This variable will store the maximum detected match length
    var windowSize = 0; // This counter controls the size of the sliding window in the inner loop

    // Begin iterating backwards from the end of the first character sequence
    for (var startIndex = firstStringChars.count - 1; startIndex >= 0; startIndex--) {
        windowSize++; // Expand the sliding window for each outer iteration

        var currentReadPos = startIndex; // Initialize the read position for the first string within the window
        var currentMatchRun = 0; // Reset the length of the current consecutive character match

        // Traverse the current window, comparing characters from both sequences
        for (var windowOffset = 0; windowOffset < windowSize; windowOffset++) {
            // Check if characters at the current positions in both sequences are identical
            if (firstStringChars[currentReadPos] === secondStringChars[windowOffset]) {
                currentMatchRun++; // Increment the match counter if characters are equal
            } else {
                // If characters differ, update the overall maximum if the current match run was greater
                overallMax = Math.max(overallMax, currentMatchRun);
                currentMatchRun = 0; // Reset the current match run as it's broken
            }
            currentReadPos++; // Advance the read position in the first string for the next comparison
        }
    }
    // Output the calculated maximum match length for the processed pair of strings
    outputChannel.displayMessage(overallMax);
}