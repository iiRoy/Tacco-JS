process.stdin.on("data", function processInputData(inputDataChunk) {
    // Initialize score counters for two participants.
    let firstParticipantScore = 0;
    let secondParticipantScore = 0;

    // Convert the incoming data chunk (typically a Buffer) to a string,
    // remove any leading or trailing whitespace, then divide it into an array of lines.
    // The .slice(1) method is used to discard the first line,
    // and .some() iterates over the remaining lines to process each one.
    String(inputDataChunk)
        .trim()
        .split("\n")
        .slice(1)
        .some(function evaluateSingleMatch(currentMatchLine) {
            // For each line, split it by space to get individual scores or values.
            // The variable 'currentMatchLine' is reassigned from a string to an array of strings.
            currentMatchLine = currentMatchLine.split(" ");

            // Apply scoring rules based on the comparison of the two values.
            if (currentMatchLine[0] === currentMatchLine[1]) {
                // If both values are identical, each participant receives one point.
                firstParticipantScore++;
                secondParticipantScore++;
            } else if (currentMatchLine[0] > currentMatchLine[1]) {
                // If the first value is greater, the first participant receives three points.
                firstParticipantScore += 3;
            } else {
                // Otherwise (if the second value is greater), the second participant receives three points.
                secondParticipantScore += 3;
            }
            // The 'some' method continues iterating as long as the callback returns a falsy value.
            // Since there's no explicit return, it implicitly returns 'undefined', which is falsy,
            // ensuring all match lines are processed.
        });

    // Output the final accumulated scores for both participants.
    console.log(firstParticipantScore, secondParticipantScore);
});

// Activate the standard input stream to ensure it starts emitting 'data' events.
process.stdin.resume();
