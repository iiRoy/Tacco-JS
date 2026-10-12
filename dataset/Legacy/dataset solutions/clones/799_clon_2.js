function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get an array of lines.
    rawData = rawData.split("\n");

    // Initialize an index to keep track of the current line being processed.
    let lineIndex = 0;

    // Main processing loop. It continues until a specific termination condition is met.
    while (true) {
        // Split the current line (which contains N and M) by spaces.
        rawData[lineIndex] = rawData[lineIndex].split(" ");

        // Parse the first number as N (number of rows/height segments).
        const numRows = parseInt(rawData[lineIndex][0], 10);
        // Parse the second number as M (number of columns/width segments).
        // Increment lineIndex here as this line has been fully consumed.
        const numCols = parseInt(rawData[lineIndex++][1], 10);

        // Check for the termination condition: N and M are both zero.
        if (numRows === 0 && numCols === 0) {
            break; // Exit the loop if the termination condition is met.
        }

        // Declare arrays to store prefix sums for heights and widths.
        // These will store cumulative sums of segment lengths.
        const rowPrefixSums = [];
        const colPrefixSums = [];

        // Initialize the first element of prefix sum arrays to zero.
        // This represents the sum up to the "start" of the first segment.
        rowPrefixSums[0] = 0;
        colPrefixSums[0] = 0;

        // Calculate prefix sums for row segments (heights).
        // Each element `rowPrefixSums[idxA]` will store the sum of heights from index 1 to `idxA`.
        for (let idxA = 1; idxA <= numRows; idxA++) {
            // Read the next line, parse it as an integer, and add to the previous prefix sum.
            rowPrefixSums[idxA] = parseInt(rawData[lineIndex++], 10) + rowPrefixSums[idxA - 1];
        }

        // Calculate prefix sums for column segments (widths).
        // Each element `colPrefixSums[idxA]` will store the sum of widths from index 1 to `idxA`.
        for (let idxA = 1; idxA <= numCols; idxA++) {
            // Read the next line, parse it as an integer, and add to the previous prefix sum.
            colPrefixSums[idxA] = parseInt(rawData[lineIndex++], 10) + colPrefixSums[idxA - 1];
        }

        // Declare arrays to count occurrences of each possible segment length.
        // `rowSegmentCounts[len]` will store how many row segments have length `len`.
        // `colSegmentCounts[len]` will store how many column segments have length `len`.
        const rowSegmentCounts = [];
        const colSegmentCounts = [];

        // Determine the maximum possible sum (either total height or total width).
        // This helps in sizing the segment count arrays.
        const maxDimensionSum = rowPrefixSums[numRows] > colPrefixSums[numCols] ? rowPrefixSums[numRows] : colPrefixSums[numCols];

        // Initialize all counts in the segment count arrays to zero.
        // The arrays are sized up to `maxDimensionSum`.
        for (let idxA = 0; idxA <= maxDimensionSum; idxA++) {
            rowSegmentCounts[idxA] = 0;
            colSegmentCounts[idxA] = 0;
        }

        // Populate `rowSegmentCounts` by iterating through all possible row segments.
        // A segment length is `rowPrefixSums[idxB] - rowPrefixSums[idxA]`.
        for (let idxA = 0; idxA <= numRows; idxA++) {
            for (let idxB = idxA + 1; idxB <= numRows; idxB++) {
                rowSegmentCounts[rowPrefixSums[idxB] - rowPrefixSums[idxA]]++;
            }
        }

        // Populate `colSegmentCounts` by iterating through all possible column segments.
        // A segment length is `colPrefixSums[idxB] - colPrefixSums[idxA]`.
        for (let idxA = 0; idxA <= numCols; idxA++) {
            for (let idxB = idxA + 1; idxB <= numCols; idxB++) {
                colSegmentCounts[colPrefixSums[idxB] - colPrefixSums[idxA]]++;
            }
        }

        // Initialize the total count of matching squares.
        let totalMatches = 0;

        // Calculate the total number of squares by multiplying counts of matching segment lengths.
        // If `rowSegmentCounts[len]` is the number of row segments of length `len`,
        // and `colSegmentCounts[len]` is the number of column segments of length `len`,
        // then `rowSegmentCounts[len] * colSegmentCounts[len]` is the number of squares of side `len`.
        for (let idxA = 1; idxA <= maxDimensionSum; idxA++) {
            totalMatches += rowSegmentCounts[idxA] * colSegmentCounts[idxA];
        }

        // Output the final calculated number of squares for the current test case.
        console.log(totalMatches);
    }
}

// Read the entire input from standard input using Node.js file system module.
// The input is expected to be UTF-8 encoded.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
