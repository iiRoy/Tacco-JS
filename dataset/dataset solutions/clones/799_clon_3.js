// Function responsible for orchestrating the entire data processing workflow.
// It takes the raw input string, parses it, performs calculations, and outputs results.
function processInputData(rawInputString) {
    // Split the monolithic input string into an array of individual lines.
    // This makes line-by-line parsing much more manageable.
    const allInputLines = rawInputString.split("\n");

    // Initialize an index to keep track of the current line being read from 'allInputLines'.
    // This pointer advances as data is consumed.
    let currentLineReadIndex = 0;

    // The main processing loop continues indefinitely until an explicit break condition is met.
    // This structure is common for competitive programming problems with multiple test cases.
    for (;;) {
        // Attempt to retrieve the current line that should contain the dimensions (N and M).
        const dimensionLine = allInputLines[currentLineReadIndex];

        // Guard clause: If the retrieved line is undefined or empty, it signifies the end of input.
        // This prevents errors from trying to process non-existent lines.
        if (!dimensionLine) {
            break; // Exit the loop as there's no more data to process.
        }

        // Split the dimension line into tokens based on spaces.
        // The first token is N (number of heights), the second is M (number of widths).
        const dimensionTokens = dimensionLine.split(" ");

        // Parse N and M into integers. Using radix 10 is good practice.
        const numberOfHeights = parseInt(dimensionTokens[0], 10);
        const numberOfWidths = parseInt(dimensionTokens[1], 10);

        // Advance the line index, as the current dimension line has been fully processed.
        currentLineReadIndex++;

        // Termination condition for the problem: If both N and M are zero,
        // it signals that there are no more test cases.
        if (numberOfHeights === 0 && numberOfWidths === 0) {
            break; // Exit the main processing loop.
        }

        // Prepare arrays to store the cumulative sums (prefix sums) of heights and widths.
        // These arrays are sized `count + 1` because index 0 will store 0 (sum before any elements),
        // and index `count` will store the total sum of all elements.
        const cumulativeHeightSums = new Array(numberOfHeights + 1).fill(0);
        const cumulativeWidthSums = new Array(numberOfWidths + 1).fill(0);

        // --- Populate the cumulative height sums array ---
        // Iterate to read each individual height value and calculate its prefix sum.
        for (let i = 1; i <= numberOfHeights; i++) {
            const currentHeightValue = parseInt(allInputLines[currentLineReadIndex], 10);
            // Calculate the current cumulative sum by adding the new value to the previous sum.
            cumulativeHeightSums[i] = currentHeightValue + cumulativeHeightSums[i - 1];
            currentLineReadIndex++; // Move the pointer to the next input line.
        }

        // --- Populate the cumulative width sums array ---
        // Perform the same operation for individual width values.
        for (let i = 1; i <= numberOfWidths; i++) {
            const currentWidthValue = parseInt(allInputLines[currentLineReadIndex], 10);
            cumulativeWidthSums[i] = currentWidthValue + cumulativeWidthSums[i - 1];
            currentLineReadIndex++; // Move the pointer to the next input line.
        }

        // Determine the maximum possible segment length that can occur in either heights or widths.
        // This value is crucial for correctly sizing the frequency arrays.
        // It's the greater of the total sum of heights or the total sum of widths.
        const overallMaxSegmentLength = Math.max(
            cumulativeHeightSums[numberOfHeights],
            cumulativeWidthSums[numberOfWidths]
        );

        // Initialize frequency maps (arrays) for segment lengths.
        // `heightSegmentFrequencies[len]` will store how many height segments have a length of `len`.
        // `widthSegmentFrequencies[len]` will store how many width segments have a length of `len`.
        // They are sized `overallMaxSegmentLength + 1` to cover lengths from 0 up to `overallMaxSegmentLength`.
        const heightSegmentFrequencies = new Array(overallMaxSegmentLength + 1).fill(0);
        const widthSegmentFrequencies = new Array(overallMaxSegmentLength + 1).fill(0);

        // --- Calculate frequencies of all possible height segment lengths ---
        // A segment length is the difference between two cumulative sums.
        // Iterate through all unique pairs of indices (start_idx, end_idx) where start_idx < end_idx.
        for (let startIdx = 0; startIdx <= numberOfHeights; startIdx++) {
            for (let endIdx = startIdx + 1; endIdx <= numberOfHeights; endIdx++) {
                const segmentLength = cumulativeHeightSums[endIdx] - cumulativeHeightSums[startIdx];
                heightSegmentFrequencies[segmentLength]++;
            }
        }

        // --- Calculate frequencies of all possible width segment lengths ---
        // Apply the identical logic to the width cumulative sums.
        for (let startIdx = 0; startIdx <= numberOfWidths; startIdx++) {
            for (let endIdx = startIdx + 1; endIdx <= numberOfWidths; endIdx++) {
                const segmentLength = cumulativeWidthSums[endIdx] - cumulativeWidthSums[startIdx];
                widthSegmentFrequencies[segmentLength]++;
            }
        }

        // --- Compute the total count of matching segments ---
        // Initialize a variable to accumulate the matches for the current test case.
        let currentTestCasesMatchingSegments = 0;

        // Iterate through all possible segment lengths, from 1 up to the maximum observed length.
        // Length 0 segments are typically not considered for matching.
        for (let segmentLen = 1; segmentLen <= overallMaxSegmentLength; segmentLen++) {
            // Retrieve the frequency of the current segment length for both heights and widths.
            // Using `|| 0` ensures that if a length doesn't exist in a frequency array (though `fill(0)` prevents this),
            // it defaults to 0, preventing `undefined * number` issues.
            const freqInHeights = heightSegmentFrequencies[segmentLen] || 0;
            const freqInWidths = widthSegmentFrequencies[segmentLen] || 0;

            // If there are X height segments of a specific length and Y width segments of the same length,
            // then there are X * Y ways to pair them up. Add this product to the total.
            currentTestCasesMatchingSegments += freqInHeights * freqInWidths;
        }

        // Output the final count of matching segments for the current test case to the console.
        console.log(currentTestCasesMatchingSegments);
    }
}

// The entry point for the program.
// It reads the entire content of standard input (usually "/dev/stdin" in competitive programming environments)
// as a UTF-8 string and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));