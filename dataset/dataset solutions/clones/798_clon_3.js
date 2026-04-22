// This function serves as the primary entry point for processing structured input data.
// It reads a multi-line string, parses numerical values, and performs calculations
// to find matching segment lengths between two series of dimensions.
function ProcessInputData(rawTextContent) {
    // Divide the entire input block into an array of individual text lines.
    const processedLines = rawTextContent.split("\n");

    // Initialize an internal pointer to manage the current line being accessed from `processedLines`.
    let currentLinePointer = 0;

    // The core processing loop, designed to handle multiple distinct data sets or "test cases"
    // within a single input stream. It continues indefinitely until a specific sentinel value is encountered.
    while (true) {
        // Fetch the current line from the input array and then advance the pointer to the next line.
        const currentInputLine = processedLines[currentLinePointer++];

        // A basic check to ensure the line is not empty or undefined, which could signal
        // an unexpected end of input or malformed data.
        if (!currentInputLine) {
            // If no more valid lines, terminate the processing.
            break;
        }

        // Split the current line, which is expected to contain two space-separated numbers,
        // representing the counts for the two dimension series.
        const dimensionCountsStr = currentInputLine.split(" ");

        // Parse the first number as the count for the 'height' segments.
        const segmentCountH = Number.parseInt(dimensionCountsStr[0], 10);
        // Parse the second number as the count for the 'width' segments.
        const segmentCountW = Number.parseInt(dimensionCountsStr[1], 10);

        // This is the explicit termination condition for the processing loop.
        // If both segment counts are zero, it indicates the end of all test cases.
        if (segmentCountH === 0 && segmentCountW === 0) {
            // Exit the loop and conclude the program execution.
            break;
        }

        // Initialize arrays to store the cumulative sums (prefix sums) for height and width values.
        // The size is `count + 1` to accommodate an initial zero sum at index 0.
        const heightPrefixSums = new Array(segmentCountH + 1).fill(0);
        const widthPrefixSums = new Array(segmentCountW + 1).fill(0);

        // Populate the `heightPrefixSums` array.
        // `heightPrefixSums[0]` remains 0, representing the sum before any segments.
        for (let elementIdx = 1; elementIdx <= segmentCountH; elementIdx++) {
            // Read the next line, convert it to an integer, and add it to the previous cumulative sum.
            const currentHeightComponent = Number.parseInt(processedLines[currentLinePointer++], 10);
            heightPrefixSums[elementIdx] = currentHeightComponent + heightPrefixSums[elementIdx - 1];
        }

        // Populate the `widthPrefixSums` array in a similar fashion.
        // `widthPrefixSums[0]` remains 0.
        for (let elementIdx = 1; elementIdx <= segmentCountW; elementIdx++) {
            // Read the next line, convert it to an integer, and accumulate the sum.
            const currentWidthComponent = Number.parseInt(processedLines[currentLinePointer++], 10);
            widthPrefixSums[elementIdx] = currentWidthComponent + widthPrefixSums[elementIdx - 1];
        }

        // Define the maximum possible value a segment length can take, based on problem constraints.
        // This is crucial for correctly sizing the frequency arrays.
        const MAX_POSSIBLE_SEGMENT_VALUE = 1000;

        // Create arrays to store the frequency of each unique segment length encountered.
        // `heightLengthFrequencies[L]` will count how many height segments have length `L`.
        const heightLengthFrequencies = new Array(MAX_POSSIBLE_SEGMENT_VALUE + 1).fill(0);
        // Similarly for width segments.
        const widthLengthFrequencies = new Array(MAX_POSSIBLE_SEGMENT_VALUE + 1).fill(0);

        // Compute and record the frequencies of all possible segment lengths for heights.
        // A segment length is derived from the difference between two prefix sums.
        for (let startIndex = 0; startIndex <= segmentCountH; startIndex++) {
            for (let endIndex = startIndex + 1; endIndex <= segmentCountH; endIndex++) {
                const calculatedSegmentLength = heightPrefixSums[endIndex] - heightPrefixSums[startIndex];
                // Increment the frequency only if the calculated length is within the valid range.
                if (calculatedSegmentLength >= 0 && calculatedSegmentLength <= MAX_POSSIBLE_SEGMENT_VALUE) {
                    heightLengthFrequencies[calculatedSegmentLength]++;
                }
            }
        }

        // Compute and record the frequencies of all possible segment lengths for widths.
        for (let startIndex = 0; startIndex <= segmentCountW; startIndex++) {
            for (let endIndex = startIndex + 1; endIndex <= segmentCountW; endIndex++) {
                const calculatedSegmentLength = widthPrefixSums[endIndex] - widthPrefixSums[startIndex];
                // Increment the frequency only if the calculated length is within the valid range.
                if (calculatedSegmentLength >= 0 && calculatedSegmentLength <= MAX_POSSIBLE_SEGMENT_VALUE) {
                    widthLengthFrequencies[calculatedSegmentLength]++;
                }
            }
        }

        // Initialize a variable to accumulate the total count of pairs of segments
        // (one from heights, one from widths) that share the same length.
        let matchingSegmentPairsCount = 0;

        // Iterate through all possible segment lengths, from 1 up to the maximum allowed value.
        // A length of 0 is typically not considered a valid "segment".
        for (let currentLength = 1; currentLength <= MAX_POSSIBLE_SEGMENT_VALUE; currentLength++) {
            // Retrieve the frequency of the current length for both height and width dimensions.
            const frequencyInHeights = heightLengthFrequencies[currentLength];
            const frequencyInWidths = widthLengthFrequencies[currentLength];

            // If segments of `currentLength` exist in both dimensions, multiply their frequencies
            // and add the result to the total count. This represents all possible pairings.
            if (frequencyInHeights > 0 && frequencyInWidths > 0) {
                matchingSegmentPairsCount += frequencyInHeights * frequencyInWidths;
            }
        }

        // Output the final computed count for the current test case to the console.
        console.log(matchingSegmentPairsCount);
    }
}

// Invoke the main processing function by reading input from standard input.
// This is a common pattern in competitive programming environments using Node.js.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));