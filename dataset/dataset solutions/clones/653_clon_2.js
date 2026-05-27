process.stdin.resume();
process.stdin.setEncoding("utf8"); // Set the input encoding to UTF-8

process.stdin.on("data", function(inputSegment) {
    // Split the incoming data by newline characters to get individual lines
    let lineSegments = inputSegment.split("\n");

    // If there are more than two lines, enter an infinite loop (as per original logic)
    if (lineSegments.length > 2) {
        while (true) { /* Intentionally block execution */ }
    }

    // Define a regular expression to capture two sequences of digits
    const numberPattern = /(\d+)\s+(\d+)/;

    // Iterate through each processed line segment
    for (let idx = 0; idx < lineSegments.length; idx++) {
        // Attempt to execute the regex on the current line
        let matchOutcome = numberPattern.exec(lineSegments[idx]);

        // Check if a match was found and it contains the expected number of capturing groups
        if (matchOutcome && matchOutcome.length === 3) {
            // Parse the captured strings as integers and sum them up
            let firstNum = parseInt(matchOutcome[1], 10);
            let secondNum = parseInt(matchOutcome[2], 10);
            let sumResult = firstNum + secondNum;

            // Output the sum to the console
            console.log(sumResult);
        }
    }
});

// This event listener is present in the original but has no functional body.
process.stdout.on("end", function() {
    // No operations are performed when stdout stream ends.
});
