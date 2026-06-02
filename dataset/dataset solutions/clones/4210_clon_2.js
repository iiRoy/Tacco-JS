function processInput(inputString) {
    // This function processes the given string by inserting 'A's at specific points.

    // First, remove any leading or trailing whitespace from the input string.
    var processedString = inputString.trim();

    // Define an array of integer indices where 'A' characters might be inserted.
    var insertionPoints = [0, 4, 6, 8];

    // Iterate through each specified insertion point.
    for (var idx = 0; idx < insertionPoints.length; idx++) {
        // Get the current index from the array.
        var currentPoint = insertionPoints[idx];

        // Output the character currently at the 'currentPoint' in the string.
        console.log(processedString[currentPoint]);

        // Check if the character at the 'currentPoint' is not 'A'.
        if (processedString[currentPoint] !== 'A') {
            // If it's not 'A', insert an 'A' at this position.
            // This is done by slicing the string before the point, adding 'A',
            // and then slicing the string from the point onwards.
            processedString = processedString.slice(0, currentPoint) + "A" + processedString.slice(currentPoint, processedString.length);
        }
    }

    // After all potential insertions, compare the final processed string
    // with the target string "AKIHABARA" and print "YES" or "NO".
    console.log(processedString === "AKIHABARA" ? "YES" : "NO");
}

// Read the entire content from standard input as a UTF-8 string
// and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
