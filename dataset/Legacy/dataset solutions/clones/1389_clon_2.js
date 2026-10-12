(function(rawData) {
    // This anonymous function processes input from stdin.

    // First, split the entire input string into an array of individual lines.
    rawData = rawData.split("\n");

    // Initialize an array to hold the parsed data, where each line is further split.
    var parsedLines = [];

    // Initialize a counter to keep track of the current line being processed.
    var lineCounter = 0;

    // Iterate through each line obtained from the raw input.
    for (var lineIdx = 0; lineIdx < rawData.length; lineIdx++) {
        // For each line, split it by spaces and store the resulting array in parsedLines.
        parsedLines[lineIdx] = rawData[lineIdx].split(" ");
    }

    // Continue processing lines as long as the first two elements of the current line are not zero.
    while (parsedLines[lineCounter][0] != 0 && parsedLines[lineCounter][1] != 0) {
        // Convert the second and first elements of the current line to numbers and print them
        // in reverse order, separated by a space.
        console.log(+parsedLines[lineCounter][1] + " " + +parsedLines[lineCounter][0]);

        // Move to the next line for processing.
        lineCounter++;
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input as UTF-8.
