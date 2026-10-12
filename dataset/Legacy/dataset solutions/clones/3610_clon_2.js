function ProcessInputData(rawData) {
    // The initial raw input string is split into individual lines.
    let processedLines = rawData.split("\n");

    // The first line is treated as a sequence of characters.
    let charSequence = processedLines[0];
    // The second line is parsed as an integer, using base 10.
    let thresholdValue = parseInt(processedLines[1], 10);

    // Initialize a running total for calculations.
    let cumulativeSum = 0;
    // Define a large constant exponent for power operations.
    const exponentFactor = 5 * Math.pow(10, 15);

    // Iterate through each character in the sequence.
    for (let idx = 0; idx < charSequence.length; idx++) {
        // Add the current character raised to the exponent factor to the cumulative sum.
        cumulativeSum += Math.pow(charSequence[idx], exponentFactor);

        // Check if the cumulative sum has reached or exceeded the defined threshold.
        if (thresholdValue <= cumulativeSum) {
            // If the threshold is met, print the current character as an integer.
            console.log('%d', charSequence[idx]);
            // Exit the loop as the condition has been satisfied.
            break;
        }
    }
}

// This line handles reading input from standard input and passing it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
