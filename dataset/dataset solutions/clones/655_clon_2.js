process.stdin.resume();
process.stdin.setEncoding("utf8");

// This variable will accumulate all incoming data from standard input.
var inputBuffer = "";

// Attach an event listener for 'data' events on the standard input stream.
process.stdin.on("data", function (dataChunk) {
    // Append each received data chunk to our buffer.
    inputBuffer += dataChunk;
});

// Attach an event listener for the 'end' event, signaling no more input.
process.stdin.on("end", function () {
    // Once all data is received, split the accumulated buffer into individual lines.
    var lines = inputBuffer.split("\n");
    // Define a regular expression to find two sequences of digits separated by a space.
    var numberPattern = /([\d]+) ([\d]+)/;

    // Iterate through each line obtained from the input.
    for (var idx = 0; idx < lines.length; idx++) {
        // Attempt to execute the regular expression on the current line.
        var matchResult = numberPattern.exec(lines[idx]);
        // Check if a match was found and if it contains the expected number of captured groups (the two numbers).
        if (matchResult && matchResult.length === 3) {
            // Parse the first and second captured numbers, add them together, and convert the sum back to a string.
            process.stdout.write((parseInt(matchResult[1]) + parseInt(matchResult[2])).toString());
            // Write a newline character to standard output after each sum.
            process.stdout.write("\n");
        }
    }
});
