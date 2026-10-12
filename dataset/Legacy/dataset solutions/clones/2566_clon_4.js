function Main(inputData) {
    const dataLines = inputData.split("\n");
    const stringLength = parseInt(dataLines[0], 10);
    const targetString = dataLines[1];

    // Initialize a memoization table to store results of subproblems.
    // Using -1 to indicate that a subproblem has not yet been computed.
    // The table size is stringLength x stringLength, as opposed to the original's N x (N+1).
    // Boundary conditions are handled by recursive base cases.
    const memoizationTable = Array.from({ length: stringLength }, () => Array(stringLength).fill(-1));

    // Recursive function to calculate the length of the common substring
    // starting at firstIndex and secondIndex.
    function computeCommonSubstringLength(firstIndex, secondIndex) {
        // Base case: If either index goes out of bounds, no more common characters.
        if (firstIndex >= stringLength || secondIndex >= stringLength) {
            return 0;
        }

        // Base case: If the starting indices are the same, the original problem
        // defines the common substring length as 0 to avoid self-matching.
        if (firstIndex === secondIndex) {
            return 0;
        }

        // Check if the result for this pair of indices is already memoized.
        if (memoizationTable[firstIndex][secondIndex] !== -1) {
            return memoizationTable[firstIndex][secondIndex];
        }

        let currentMatch = 0;
        // If characters at current indices match, extend the common substring.
        if (targetString[firstIndex] === targetString[secondIndex]) {
            currentMatch = computeCommonSubstringLength(firstIndex + 1, secondIndex + 1) + 1;
        }
        // If characters do not match, currentMatch remains 0, which is the correct behavior.

        // Store the computed result in the memoization table before returning.
        memoizationTable[firstIndex][secondIndex] = currentMatch;
        return currentMatch;
    }

    let overallMaximumLength = 0;

    // Iterate through all possible pairs of starting indices (i, j)
    // to trigger the recursive computation for all relevant subproblems
    // and find the maximum common substring length.
    for (let i = 0; i < stringLength; i++) {
        for (let j = 0; j < stringLength; j++) {
            // The recursive function handles the case where i === j by returning 0.
            // We call it for all pairs to ensure all possible common substrings are considered.
            overallMaximumLength = Math.max(overallMaximumLength, computeCommonSubstringLength(i, j));
        }
    }

    console.log(overallMaximumLength);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
