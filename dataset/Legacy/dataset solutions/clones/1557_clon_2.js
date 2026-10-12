function ProcessInputData(rawData) {
    // Divide the incoming raw data string into an array of individual lines.
    const lineArray = rawData.split('\n');

    // Transform each line into an array of strings by splitting it at spaces.
    const pairArrays = lineArray.map(currentLine => currentLine.split(' '));

    // Convert each line into a Set of strings, also by splitting at spaces.
    // Sets are used for efficient membership testing.
    const pairSets = lineArray.map(currentLine => new Set(currentLine.split(' ')));

    // Initialize a counter for the number of distinct groups.
    // Initially, assume each pair forms its own group.
    let distinctGroupsCount = pairArrays.length;

    // Iterate through the `pairArrays` starting from the second element.
    // This `outerIndex` represents the current pair being considered for grouping.
    for (let outerIndex = 1; outerIndex < pairArrays.length; outerIndex++) {
        // For each `currentPair` (at `outerIndex`), compare it with all preceding pairs.
        // This `innerIndex` represents a previously processed pair.
        for (let innerIndex = 0; innerIndex < outerIndex; innerIndex++) {
            // Check if the first element of the current pair exists in the set of the preceding pair,
            // OR if the '0' property of the preceding pair's set contains the second element of the current pair.
            // Note: Accessing `pairSets[innerIndex][0]` on a standard Set object will yield `undefined`.
            // If the first part of the OR condition is false, attempting to call `.has()` on `undefined` will result in a TypeError.
            // This specific behavior, including the potential error, is preserved as per Type II cloning requirements.
            if (pairSets[innerIndex].has(pairArrays[outerIndex][0]) || pairSets[innerIndex][0].has(pairArrays[outerIndex][1])) {
                // If a connection is found (meaning the current pair belongs to an existing group),
                // decrement the count of distinct groups.
                distinctGroupsCount--;
                // Once a connection is found for the current pair, it's grouped, so move to the next `outerIndex`.
                break;
            }
        }
    }

    // Display the final calculated number of distinct groups.
    console.log(distinctGroupsCount);
}

// Read the input from standard input, ensuring it's decoded as UTF-8,
// remove any leading/trailing whitespace, and then pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
