function ProcessInputData(rawData) {
    // Split the entire input string into individual lines
    let parsedLines = rawData.split('\n');

    // Extract tokens from the first line, which should contain the array size
    const firstLineTokens = parsedLines[0].split(' ');

    // Determine the number of elements for our numeric array
    let elementCount = parseInt(firstLineTokens[0], 10);

    // Initialize an array to store the parsed numeric values
    let numericValues = new Array(elementCount).fill(0);

    // Variable to track the greatest difference encountered
    let greatestDiff = 0;

    // Counter for how many times the greatest difference has occurred
    let occurrenceCount = 0;

    // Variable to keep track of the smallest value seen up to the current point
    let currentMinimum = 0;

    // Iterate through the input numbers to find the maximum difference
    for (let idx = 0; idx < elementCount; idx++) {
        // Parse the current number from the second line of input
        numericValues[idx] = parseInt(parsedLines[1].split(' ')[idx], 10);

        // Update the current minimum if a smaller value is found or if it's the very first element
        if (currentMinimum > numericValues[idx] || idx === 0) {
            currentMinimum = numericValues[idx];
        }

        // Check if the current difference matches the greatest difference found so far
        if (greatestDiff === numericValues[idx] - currentMinimum) {
            occurrenceCount++; // Increment the counter if it's an equal match
        }
        // If a new, larger difference is found
        else if (greatestDiff < numericValues[idx] - currentMinimum) {
            occurrenceCount = 1; // Reset the counter as we have a new maximum
            greatestDiff = numericValues[idx] - currentMinimum; // Update the greatest difference
        }
    }

    // Output the final count of occurrences of the maximum difference
    console.log(String(occurrenceCount));
}

// Call the main processing function with data read from standard input
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));