function ProcessData(incomingText) {
    // Divide the entire input string into an array of individual text lines.
    let textSegments = incomingText.split('\n');

    // Remove the very first line from the array, as it's often not part of the core data.
    textSegments.shift();

    // Convert each remaining text line into an array of parsed integer values.
    const numericDataMatrix = textSegments.map(function(lineSegment) {
        return lineSegment.split(' ').map(function(numericToken) {
            // Parse each string token into a base-10 integer.
            return parseInt(numericToken, 10);
        });
    });

    // Initialize a variable to accumulate the final computed sum.
    let totalAccumulator = 0;

    // Iterate through each row of the numerically processed data.
    for (
        let dataRowIndex = 0;
        dataRowIndex < numericDataMatrix.length;
        dataRowIndex++
    ) {
        // Perform a specific calculation: (second element - first element + 1)
        // and add this result to the running total.
        totalAccumulator += (
            numericDataMatrix[dataRowIndex][1] -
            numericDataMatrix[dataRowIndex][0] +
            1
        );
    }

    // Display the final calculated aggregate value to the standard output.
    console.log('%d', totalAccumulator);
}

// Execute the main data processing function by reading content from standard input.
ProcessData(
    require("fs")
        .readFileSync(
            "/dev/stdin",
            "utf8"
        )
);