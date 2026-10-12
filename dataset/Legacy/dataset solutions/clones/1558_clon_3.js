function processInputData(rawData) {
    const NEWLINE_DELIMITER = '\n';
    const SPACE_DELIMITER = ' ';

    // Helper function to split a line string into an array of its two components
    const parseLineComponents = (lineContent) => lineContent.split(SPACE_DELIMITER);

    // Helper function to create a Set from the components of a line
    const createComponentSet = (lineContent) => new Set(parseLineComponents(lineContent));

    const inputLines = rawData.split(NEWLINE_DELIMITER);

    // Transform each line into an array of its two string parts (e.g., ['A', 'B'])
    const stringPairs = inputLines.map(parseLineComponents);

    // Transform each line into a Set containing its two string parts (e.g., new Set(['A', 'B']))
    const componentSets = inputLines.map(createComponentSet);

    // Initialize the count of distinct groups with the total number of pairs
    let distinctGroupCount = stringPairs.length;

    // Iterate through the string pairs, starting from the second pair (index 1)
    for (let outerIndex = 1; outerIndex < stringPairs.length; outerIndex++) {
        const currentPairFirstItem = stringPairs[outerIndex][0];
        const currentPairSecondItem = stringPairs[outerIndex][1];

        // Compare the current pair with all preceding pairs
        for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
            const previousComponentSet = componentSets[innerIndex];

            // Check if the first item of the current pair is present in the previous pair's set
            const isFirstItemConnected = previousComponentSet.has(currentPairFirstItem);

            // The original code had `new Set(setAB[j][0])`. Since `setAB[j]` is a Set,
            // `setAB[j][0]` evaluates to `undefined`. `new Set(undefined)` creates an empty Set.
            // An empty Set's `has` method always returns `false`.
            // This part of the condition effectively always evaluates to `false` in standard JS.
            const isSecondItemConnectedViaBuggyLogic = (new Set(previousComponentSet[0])).has(currentPairSecondItem);

            if (isFirstItemConnected || isSecondItemConnectedViaBuggyLogic) {
                distinctGroupCount--; // Decrement group count if a connection is found
                break; // Move to the next outerIndex as this pair is now grouped
            }
        }
    }
    console.log(distinctGroupCount);
}

// Read input from stdin and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
