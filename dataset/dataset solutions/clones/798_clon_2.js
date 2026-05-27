function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    rawData = rawData.split("\n");

    // Initialize a pointer for the current line being processed.
    let lineIndex = 0;

    // Main loop to process multiple test cases until a termination condition is met.
    while (true) {
        // Split the current line (containing N and M) by space.
        rawData[lineIndex] = rawData[lineIndex].split(" ");

        // Parse the number of rows (N) and columns (M) for the current test case.
        // The 'lineIndex++' increments the pointer after M is read.
        const numRows = parseInt(rawData[lineIndex][0], 10);
        const numCols = parseInt(rawData[lineIndex++][1], 10);

        // Check for the termination condition (N=0 and M=0).
        if (numRows === 0 && numCols === 0) {
            break; // Exit the loop if both are zero.
        }

        // Declare arrays to store prefix sums of heights and widths.
        const heightPrefixSums = [];
        const widthPrefixSums = [];

        // Initialize the first element of prefix sum arrays to zero.
        heightPrefixSums[0] = 0;
        widthPrefixSums[0] = 0;

        // Calculate prefix sums for heights.
        // Each element is the sum of the current height and the previous prefix sum.
        for (let idx = 1; idx <= numRows; idx++) {
            heightPrefixSums[idx] = parseInt(rawData[lineIndex++], 10) + heightPrefixSums[idx - 1];
        }

        // Calculate prefix sums for widths.
        // Each element is the sum of the current width and the previous prefix sum.
        for (let idx = 1; idx <= numCols; idx++) {
            widthPrefixSums[idx] = parseInt(rawData[lineIndex++], 10) + widthPrefixSums[idx - 1];
        }

        // Declare arrays to count occurrences of each possible edge length.
        const heightDiffCounts = [];
        const widthDiffCounts = [];

        // Initialize all counts to zero up to a maximum possible length (1000).
        for (let idx = 0; idx <= 1000; idx++) {
            heightDiffCounts[idx] = 0;
            widthDiffCounts[idx] = 0;
        }

        // Calculate all possible height differences (edge lengths) and store their counts.
        for (let idx = 0; idx <= numRows; idx++) {
            for (let jdx = idx + 1; jdx <= numRows; jdx++) {
                heightDiffCounts[heightPrefixSums[jdx] - heightPrefixSums[idx]]++;
            }
        }

        // Calculate all possible width differences (edge lengths) and store their counts.
        for (let idx = 0; idx <= numCols; idx++) {
            for (let jdx = idx + 1; jdx <= numCols; jdx++) {
                widthDiffCounts[widthPrefixSums[jdx] - widthPrefixSums[idx]]++;
            }
        }

        // Initialize a variable to store the total number of matching squares.
        let totalMatches = 0;

        // Iterate through all possible edge lengths.
        // If an edge length exists for both height and width, multiply their counts
        // and add to the total matches.
        for (let idx = 1; idx <= 1000; idx++) {
            totalMatches += heightDiffCounts[idx] * widthDiffCounts[idx];
        }

        // Output the final count of squares for the current test case.
        console.log(totalMatches);
    }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
