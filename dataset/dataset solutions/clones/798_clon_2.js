function ProcessInputData(rawData) {
    // Divide the entire input string into an array of separate lines
    let linesOfData = rawData.split('\n');
    /*
     * Initialize an index variable to keep track of the current line
     * being read from the 'linesOfData' array during processing.
     */
    var lineIndex = 0;

    while (true) {
        // For each test case, the first line contains two dimensions.
        linesOfData[lineIndex] = linesOfData[lineIndex].split(' ');
        const numHeights = parseInt(linesOfData[lineIndex][0], 10);
        const numWidths = parseInt(linesOfData[lineIndex++][1], 10);

        // If both dimensions are zero, it signifies the end of input.
        if (numHeights === 0 && numWidths === 0) {
            break;
        }

        // Declare arrays to store cumulative sums of heights and widths.
        let heightPrefixSums = [],
            widthPrefixSums = [];

        // Set the initial (zero-th) element of both prefix sum arrays to zero.
        heightPrefixSums[0] = 0;
        widthPrefixSums[0] = 0;

        /*
         * Populate the 'heightPrefixSums' array. Each element at index 'idx'
         * stores the sum of heights from the beginning up to 'idx-1'.
         */
        for (let idx = 1; idx <= numHeights; idx++) {
            heightPrefixSums[idx] = parseInt(linesOfData[lineIndex++], 10) + heightPrefixSums[idx - 1];
        }

        /*
         * Populate the 'widthPrefixSums' array in a similar fashion.
         * Each element is a running total of widths.
         */
        for (let idx = 1; idx <= numWidths; idx++) {
            widthPrefixSums[idx] = parseInt(linesOfData[lineIndex++], 10) + widthPrefixSums[idx - 1];
        }

        // Arrays to count the frequency of each possible segment length for heights and widths.
        let heightSegmentCounts = [],
            widthSegmentCounts = [];

        // Initialize all entries in the count arrays to zero.
        // The maximum possible length is assumed to be 1000.
        for (let idx = 0; idx <= 1000; idx++) {
            heightSegmentCounts[idx] = widthSegmentCounts[idx] = 0;
        }

        // Calculate all possible segment lengths for heights from the prefix sums.
        // A segment length between indices 'idx' and 'innerIdx' is heightPrefixSums[innerIdx] - heightPrefixSums[idx].
        for (let idx = 0; idx <= numHeights; idx++) {
            for (let innerIdx = idx + 1; innerIdx <= numHeights; innerIdx++) {
                heightSegmentCounts[heightPrefixSums[innerIdx] - heightPrefixSums[idx]]++;
            }
        }

        // Calculate all possible segment lengths for widths from the prefix sums.
        for (let idx = 0; idx <= numWidths; idx++) {
            for (let innerIdx = idx + 1; innerIdx <= numWidths; innerIdx++) {
                widthSegmentCounts[widthPrefixSums[innerIdx] - widthPrefixSums[idx]]++;
            }
        }

        // Variable to store the final tally of matching segments.
        let totalMatches = 0;

        // Iterate through all possible segment lengths (from 1 to 1000).
        // For each length, multiply its count in heights by its count in widths
        // and add to the total.
        for (let idx = 1; idx <= 1000; idx++) {
            totalMatches += heightSegmentCounts[idx] * widthSegmentCounts[idx];
        }

        // Print the calculated total number of matching segments to the console.
        console.log(totalMatches);
    }
}
// Read the entire input content from standard input (e.g., a file)
// and then invoke the main processing function with this data.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));