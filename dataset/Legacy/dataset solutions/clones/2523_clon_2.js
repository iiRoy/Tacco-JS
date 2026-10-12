function processInputData(rawData) {
    // The initial raw input string is split into an array of lines.
    let processedLines = rawData.split("\n");

    // The first line is further divided into components based on spaces.
    let firstLineParts = processedLines[0].split(" ");

    // The second line is also split into its constituent elements.
    let secondLineElements = processedLines[1].split(" ");

    // Initialize a counter for elements that meet a specific condition.
    let matchingElementsCount = 0;

    // Iterate through a range determined by the first component of the first line.
    for (let idx = 0; idx < firstLineParts[0]; idx++) {
        // Check if the current element from the first line is less than or equal to the second component of the first line.
        if (firstLineParts[idx] <= firstLineParts[1]) {
            // If the condition is met, increment the counter.
            matchingElementsCount++;
        }
    }
    // Output the final count to the console.
    console.log(matchingElementsCount);
}

// This section handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
