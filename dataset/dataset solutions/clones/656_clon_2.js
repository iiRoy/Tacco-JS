// Initialize standard input stream functionality
process.stdin.resume();
// Configure the character encoding for the input stream
process.stdin.setEncoding("utf8");

// Attach an event handler for incoming data segments
process.stdin.on("inputStreamData", function (inputBlock) {
    // Divide the received input chunk into an array of distinct lines
    let lineCollection = inputBlock.split("\n");
    // Establish a regular expression for extracting two positive integer values
    let digitExtractor = /(\d+) (\d+)/;

    // Traverse through every line within the collected input
    for (let currentLineIndex = 0; currentLineIndex < lineCollection.length; currentLineIndex++) {
        // Execute the regex pattern against the present line
        let extractionResult = digitExtractor.exec(lineCollection[currentLineIndex]);
        // Confirm if the regex found a match and captured two groups (plus the full match)
        if (extractionResult && extractionResult.length === 3) {
            // Convert the first and second captured strings to integers, sum them, then convert the total back to a string
            process.stdout.write((parseInt(extractionResult[1]) + parseInt(extractionResult[2])).toString());
            // Append a newline character to the output for readability
            process.stdout.write("\n");
        } // End of conditional check for successful pattern matching
    } // Conclude iteration over input lines
}); // Finalize the input stream data event listener