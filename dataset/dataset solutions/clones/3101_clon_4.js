function processInput(rawInputData) {
    const inputLines = rawInputData.trim().split('\n');

    // The first line (N, number of queries) is typically unused in these problems.
    // The second line contains the main sequence string.
    const sequenceString = inputLines[1];

    // Subsequent lines represent queries, each with a left and right boundary.
    // Convert them to 0-indexed values as per the original code's logic (e.g., `e - 1`).
    const queryBoundaries = inputLines.slice(2).map(queryLine =>
        queryLine.split(' ').map(Number).map(value => value - 1)
    );

    // Pre-compute cumulative counts of "AC" pairs.
    // `acPrefixSum[k]` will store the total count of "AC" pairs found in `sequenceString`
    // from index 0 up to and including index `k`.
    // The array will have a length equal to `sequenceString.length`.
    // `acPrefixSum[0]` will be 0, as there are no pairs ending at index 0.
    let currentAcTally = 0;
    const acPrefixSum = Array.from({ length: sequenceString.length }, (_, k) => {
        if (k === 0) {
            // No 'AC' pair can end at index 0.
            return 0;
        }
        // Check if the pair `sequenceString[k-1]` and `sequenceString[k]` forms "AC".
        // This corresponds to the original code's `s[i]` and `s[i+1]` where `i = k-1`.
        // The original loop iterates `i` from `0` to `s.length - 2`.
        // This means `k` (which is `i+1`) iterates from `1` to `s.length - 1`.
        // The check `sequenceString[k]` is therefore always within bounds.
        if (sequenceString[k - 1] === 'A' && sequenceString[k] === 'C') {
            currentAcTally++;
        }
        return currentAcTally;
    });

    // Process each query to calculate the number of "AC" pairs within the specified range.
    // The result for a range `[left, right]` (0-indexed) is `acPrefixSum[right] - acPrefixSum[left]`.
    const queryResults = queryBoundaries.map(bounds => {
        const leftBoundary = bounds[0];
        const rightBoundary = bounds[1];
        return acPrefixSum[rightBoundary] - acPrefixSum[leftBoundary];
    });

    // Output all results, each on a new line.
    console.log(queryResults.join('\n'));
}

// Read input from stdin and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
