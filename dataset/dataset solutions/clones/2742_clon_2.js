function ProcessData(rawDataInput) {
    // This function takes raw input and processes it to determine a specific count.
    // It's designed to solve a variation of the Longest Increasing Subsequence problem.

    // First, split the entire input string by newline characters
    // to get an array where each element is a line from the input.
    const processedLines = rawDataInput.split('\n');

    // The very first line of the input contains the total number of elements
    // that follow. We parse this string to an integer.
    const totalElements = parseInt(processedLines[0], 10);

    // From the second line onwards, we have the actual data points.
    // We slice the array to get only these data lines, then map each
    // string line to its integer representation.
    const numericalValues = processedLines.slice(1).map( (currentString) => {
        return parseInt(currentString, 10);
    } );

    // We'll use an object (acting as a hash map) to store our "bins" or "stacks".
    // Each key represents a bin index, and its value is the top element of that bin.
    // Initialize the first bin with the first numerical value.
    var bins = {
        0: numericalValues[0]
    };

    // This variable keeps track of the highest index used for a bin.
    // It essentially counts how many distinct bins we currently have.
    var currentBinCount = 0;

    // Now, iterate through the rest of the numerical values, starting from the second one.
    // For each value, we try to place it into an existing bin or create a new one.
    for (let itemIndex = 1; itemIndex < totalElements; itemIndex++) {

        // Initialize a variable to hold the index of the most suitable bin found so far.
        // It's null initially, meaning no suitable bin has been identified yet.
        let targetBinIndex = null;

        // Loop through all currently active bins to find where the current item fits best.
        for (let searchBinIndex = 0; searchBinIndex <= currentBinCount; searchBinIndex++) {
            // A bin is suitable if its top element is less than the current numerical value.
            // Among suitable bins, we want the one with the largest top element
            // (this is crucial for the LIS variant logic).
            if (
                bins[searchBinIndex] < numericalValues[itemIndex] &&
                (targetBinIndex === null || bins[targetBinIndex] < bins[searchBinIndex])
            ) {
                // If this bin is better than previous candidates, update our target.
                targetBinIndex = searchBinIndex;
            }
        }

        // After checking all existing bins:
        // If 'targetBinIndex' is still null, it means the current numerical value
        // cannot be placed on top of any existing bin (it's smaller than or equal to all bin tops).
        // In this case, we must create a new bin for it.
        if (targetBinIndex === null) {
            currentBinCount++; // Increment the total count of bins.
            bins[currentBinCount] = numericalValues[itemIndex]; // Place the value in the new bin.
        } else {
            // Otherwise, a suitable bin was found. We update that bin's top element
            // with the current numerical value. This effectively means we are replacing
            // a larger value with a smaller one at the top of an increasing sequence,
            // which helps in finding the longest sequence.
            bins[targetBinIndex] = numericalValues[itemIndex];
        }
    }

    // Finally, the result is the total number of bins created, plus one.
    // (Since 'currentBinCount' is a 0-indexed count of additional bins beyond the first).
    console.log(currentBinCount + 1);
}

// Invoke the main processing function by reading input from standard input.
// The 'fs' module is used for file system operations, and 'readFileSync'
// reads the content of '/dev/stdin' (standard input in Unix-like systems)
// as a UTF-8 encoded string.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));