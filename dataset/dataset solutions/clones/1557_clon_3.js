function processInputData(rawData) {
    const LINE_DELIMITER = '\n';
    const PAIR_DELIMITER = ' ';

    // Helper function to split a line string into an array of two string components
    const splitLineIntoPair = (lineContent) => lineContent.split(PAIR_DELIMITER);

    // Split the raw input data into an array of individual lines
    const lineArray = rawData.split(LINE_DELIMITER);

    // Transform each line into an array of its two string elements (e.g., ['A', 'B'])
    const pairStrings = lineArray.map(splitLineIntoPair);

    // Transform each line into a Set containing its two string elements (e.g., {'A', 'B'})
    const pairSets = lineArray.map(lineContent => new Set(splitLineIntoPair(lineContent)));

    // Initialize the count of distinct groups, assuming all pairs are distinct initially
    let distinctGroupCount = pairStrings.length;
    const totalPairsCount = pairStrings.length;

    // Iterate through the pairs, starting from the second pair (index 1)
    for (let outerIndex = 1; outerIndex < totalPairsCount; outerIndex++) {
        // Extract the elements of the current pair for easier access
        const currentPairFirstElement = pairStrings[outerIndex][0];
        const currentPairSecondElement = pairStrings[outerIndex][1];

        // For each current pair, compare it with all preceding pairs
        for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
            // Check if the first element of the current pair is present in the set of the preceding pair
            const isFirstElementFoundInPrecedingSet = pairSets[innerIndex].has(currentPairFirstElement);

            // Check if the second element of the current pair is present in a problematic access of the preceding pair's set
            // NOTE: This preserves the original code's behavior, which attempts to access property '0' on a Set object,
            // which will result in `undefined` and likely cause a TypeError when `.has()` is called on it,
            // unless the first part of the OR condition is true.
            const isSecondElementFoundInProblematicAccess = pairSets[innerIndex][0].has(currentPairSecondElement);

            // If either condition is met, it means the current pair is related to a preceding group
            if (isFirstElementFoundInPrecedingSet || isSecondElementFoundInProblematicAccess) {
                distinctGroupCount--; // Decrement the count of distinct groups
                break; // Break the inner loop as this pair has been associated with an existing group
            }
        }
    }
    // Output the final count of distinct groups
    console.log(distinctGroupCount);
}

// Read input from stdin and process it
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
