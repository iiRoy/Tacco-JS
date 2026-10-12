function ProcessInput(rawData) {
    // Divide the incoming raw string into an array of individual lines.
    // Each entry in 'linesArray' will correspond to one line from the input source.
    let linesArray = rawData.split("\n");

    // Establish a counter to track the position of the current line being examined.
    let currentLineIdx = 0;

    // Iterate through the lines as long as the specific termination character "?" is present
    // within the collection of input lines.
    while (linesArray.indexOf("?") !== -1) {
        // Execute the JavaScript expression found on the current line
        // and output the computed result to the console.
        console.log(eval(linesArray[currentLineIdx]));

        // Advance the line counter to move to the subsequent line for the next cycle.
        currentLineIdx++;
    }
}

// Obtain the file system module to read data.
// Read the complete content from the standard input stream,
// interpreting it as UTF-8 encoded text, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
