function ProcessInput(rawData) {
    // Split the incoming data into individual lines
    const linesArray = rawData.split("\n");

    // Parse the first line to get the number of subsequent entries
    const firstValue = parseInt(linesArray[0], 10);

    // Initialize a variable to store the final result message
    let outcomeMessage = "No";

    // Initialize a counter for consecutive matching pairs
    let consecutiveMatches = 0;

    // Iterate through the lines starting from the second one up to 'firstValue'
    for (let idx = 1; idx <= firstValue; idx++) {
        // Split the current line into two parts based on space
        const currentPair = linesArray[idx].split(" ");

        // Check if the two parsed numbers in the pair are equal
        if (parseInt(currentPair[0], 10) === parseInt(currentPair[1], 10)) {
            // If they are equal, increment the consecutive matches counter
            consecutiveMatches++;

            // If three or more consecutive matches are found, set the outcome and exit the loop
            if (consecutiveMatches >= 3) {
                outcomeMessage = "Yes";
                break; // Terminate the loop early
            }
            // Continue to the next iteration if condition met but not enough consecutive matches yet
            continue;
        }
        // If the numbers are not equal, reset the consecutive matches counter
        consecutiveMatches = 0;
    }

    // Output the determined outcome message to the console
    console.log(outcomeMessage);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
