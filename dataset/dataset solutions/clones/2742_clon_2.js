function ProcessInput(rawData) {
    // This function processes the raw input data to solve a specific problem.
    // It identifies the length of the longest non-decreasing subsequence using a greedy approach.

    // Split the entire input string into an array of individual lines.
    let dataLines = rawData.split('\n');

    // Parse the first line to determine the total number of elements.
    const itemCount = parseInt(dataLines[0], 10);

    // Extract the numerical values from the remaining lines, converting each to an integer.
    const itemValues = dataLines.slice(1).map(valStr => parseInt(valStr, 10));

    // Initialize an object to represent "color bins" or "piles".
    // Each key is a bin index, and its value is the smallest top element of an increasing subsequence.
    // The first bin is initialized with the first item's value.
    let colorBins = { 0: itemValues[0] };

    // Keep track of the highest index used for a color bin.
    let currentBinIndex = 0;

    // Iterate through the item values, starting from the second element.
    for (let idx = 1; idx < itemCount; idx++) {
        // Variable to store the index of the most suitable bin for the current item.
        // A suitable bin is one whose top element is less than the current item,
        // and among such bins, it has the largest possible top element.
        let bestFitBin = null;

        // Loop through all currently existing color bins.
        for (let binIterator = 0; binIterator <= currentBinIndex; binIterator++) {
            // Check if the current bin's top element is less than the current item.
            // If a best fit has already been found, also ensure that the current bin's
            // top element is greater than the previously identified best fit's top element.
            if (colorBins[binIterator] < itemValues[idx] && (bestFitBin === null || colorBins[bestFitBin] < colorBins[binIterator])) {
                bestFitBin = binIterator; // Update the best fit bin index.
            }
        }

        // If no suitable bin was found (meaning the current item is smaller than or equal to
        // the top element of all existing bins), create a new bin for it.
        if (bestFitBin === null) {
            currentBinIndex++; // Increment the count of bins.
            colorBins[currentBinIndex] = itemValues[idx]; // Place the current item into the new bin.
        } else {
            // If a suitable bin was found, update that bin with the current item's value.
            // This effectively replaces the largest value in an increasing subsequence
            // (that is still less than the current item) with the current item itself,
            // maintaining the non-decreasing property of the bin.
            colorBins[bestFitBin] = itemValues[idx];
        }
    }

    // The final count of bins (currentBinIndex + 1) represents the length of the
    // longest non-decreasing subsequence.
    console.log(currentBinIndex + 1);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
