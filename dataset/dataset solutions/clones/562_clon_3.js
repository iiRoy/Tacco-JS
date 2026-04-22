(function (sourceText) {
    // Helper function to safely parse a number from a string
    const parseNumericValue = (str) => {
        const num = Number(str.trim());
        if (isNaN(num)) {
            // In a real application, more robust error handling might be needed.
            // For competitive programming, input format is usually guaranteed.
            return 0; // Default to 0 or throw an error
        }
        return num;
    };

    // Normalize line endings and split the input into an array of lines.
    // Using a regex for robustness against different newline styles.
    const parsedLines = sourceText.replace(/\r/g, '').split('\n');

    // Initialize a cursor to keep track of the current line being processed.
    let inputCursor = 0;

    // Main processing loop: continues until a specific termination condition is met.
    for (;;) {
        // Read the first line of the current test case, which contains n and k.
        const lineFragments = parsedLines[inputCursor++].split(' ');

        // Extract total number of elements (n) and subsequence length (k).
        const totalNumbers = parseNumericValue(lineFragments[0]);
        const subsequenceLength = parseNumericValue(lineFragments[1]);

        // Check for the termination condition (n=0 and k=0).
        if (totalNumbers === 0 && subsequenceLength === 0) {
            // Exit the processing loop.
            break;
        }

        // Initialize an array to store the sequence of numbers for this test case.
        const numericSequence = [];

        // Populate the numeric sequence from subsequent lines.
        for (let elementIndex = 0; elementIndex < totalNumbers; elementIndex++) {
            const currentElement = parseNumericValue(parsedLines[inputCursor++]);
            numericSequence.push(currentElement);
        }

        // Array to hold the sums of all possible windows (subsequences of length k).
        const allWindowSums = [];
        let maximumAggregate = -Infinity; // Initialize with the smallest possible number

        // Only proceed if the sequence and window size are valid.
        if (totalNumbers > 0 && subsequenceLength > 0 && subsequenceLength <= totalNumbers) {
            let currentWindowSum = 0;

            // Calculate the sum for the very first window (from index 0 to k-1).
            for (let j = 0; j < subsequenceLength; j++) {
                currentWindowSum += numericSequence[j];
            }
            allWindowSums.push(currentWindowSum);
            maximumAggregate = currentWindowSum; // Update max after first sum

            // Implement a sliding window approach to efficiently calculate subsequent sums.
            // For each step, subtract the element leaving the window and add the new element entering.
            for (let windowStart = 1; windowStart <= totalNumbers - subsequenceLength; windowStart++) {
                // Update the sum by removing the element at the beginning of the previous window
                // and adding the new element at the end of the current window.
                currentWindowSum = currentWindowSum - numericSequence[windowStart - 1] + numericSequence[windowStart + subsequenceLength - 1];
                allWindowSums.push(currentWindowSum);

                // Continuously update the maximum aggregate sum found so far.
                if (currentWindowSum > maximumAggregate) {
                    maximumAggregate = currentWindowSum;
                }
            }
        } else if (totalNumbers > 0 && subsequenceLength > totalNumbers) {
            // Handle edge case where window size is larger than the total numbers
            // In this specific problem context, this usually means no valid window can be formed
            // or the problem constraints guarantee subsequenceLength <= totalNumbers.
            // If sum of all elements was desired here, it would be a different logic.
            // For now, consistent with original, it would result in 0 or negative infinity if no sums calculated.
            maximumAggregate = -Infinity; // No valid window sum.
        } else if (totalNumbers === 0) {
            // If there are no numbers, there are no sums.
            maximumAggregate = -Infinity;
        }

        // Output the highest sum found for the current test case.
        console.log(maximumAggregate === -Infinity ? 0 : maximumAggregate); // Default to 0 if no valid sum found (e.g., empty input for actual sums)
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));