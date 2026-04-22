function ProcessInputData(rawInputString) {
    // Validate the input: ensure it's a non-empty string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input data is invalid or empty. Please provide a non-empty string.");
        return; // Exit if input is not usable.
    }

    // Split the raw input into individual lines.
    // .trim() removes leading/trailing whitespace including newlines.
    // .filter(Boolean) removes any empty strings that might result from multiple newlines.
    const parsedLines = rawInputString.trim().split('\n').filter(Boolean);

    // Ensure we have the minimum required number of lines:
    // 1. N and K values
    // 2. Array A
    // 3. Array F
    if (parsedLines.length < 3) {
        console.error("Insufficient data lines provided. Expected at least 3 lines.");
        return;
    }

    // Helper function to convert a space-separated string of numbers into a numeric array.
    const convertLineToNumberArray = (lineContent) => lineContent.split(' ').map(Number);

    // Extract the primary problem parameters (N and K) from the first line.
    const initialParameters = convertLineToNumberArray(parsedLines[0]);
    if (initialParameters.length < 2 || isNaN(initialParameters[0]) || isNaN(initialParameters[1])) {
        console.error("Failed to parse N and K values from the first line.");
        return;
    }
    const totalItemCount = initialParameters[0]; // Corresponds to N
    const maxAllowedCostReduction = initialParameters[1]; // Corresponds to K

    // Process the second line to get array 'A', then sort it in ascending order.
    const itemValuesSortedAsc = convertLineToNumberArray(parsedLines[1]).sort((a, b) => a - b);

    // Process the third line to get array 'F', then sort it in descending order.
    const factorMultipliersSortedDesc = convertLineToNumberArray(parsedLines[2]).sort((a, b) => b - a);

    // Verify that the lengths of the processed arrays match the specified totalItemCount (N).
    if (itemValuesSortedAsc.length !== totalItemCount || factorMultipliersSortedDesc.length !== totalItemCount) {
        console.error("Mismatch: The number of elements in input arrays does not match the specified N.");
        return;
    }

    // Determine an initial upper bound for the binary search.
    // This is the maximum possible product (A[i] * F[i]) without any cost reductions.
    let searchUpperBoundary = 0;
    for (let currentElementIndex = 0; currentElementIndex < totalItemCount; ++currentElementIndex) {
        const currentProduct = itemValuesSortedAsc[currentElementIndex] * factorMultipliersSortedDesc[currentElementIndex];
        searchUpperBoundary = Math.max(searchUpperBoundary, currentProduct);
    }

    // Initialize the lower bound for the binary search. -1 is a safe starting point.
    let searchLowerBoundary = -1;

    // Define a predicate function to check if a given 'targetMaxProduct' is achievable.
    // A target is achievable if the total 'reduction cost' required to meet it
    // is less than or equal to `maxAllowedCostReduction`.
    const isTargetAchievable = (targetMaxProduct) => {
        let totalReductionNeeded = 0;
        for (let idx = 0; idx < totalItemCount; ++idx) {
            // Calculate the maximum value `itemValuesSortedAsc[idx]` can be reduced to
            // such that `(reduced_value) * factorMultipliersSortedDesc[idx]` <= `targetMaxProduct`.
            // If `factorMultipliersSortedDesc[idx]` is 0, division by zero results in Infinity.
            // `Math.floor(Infinity)` is Infinity, meaning essentially no cost for this item, which is correct.
            const maxPermittedValue = Math.floor(targetMaxProduct / factorMultipliersSortedDesc[idx]);

            // The cost for this item is the amount it needs to be reduced.
            // `Math.max(0, ...)` ensures we only count positive reductions (costs).
            totalReductionNeeded += Math.max(0, itemValuesSortedAsc[idx] - maxPermittedValue);
        }
        return totalReductionNeeded <= maxAllowedCostReduction;
    };

    // Perform the binary search to find the minimum `targetMaxProduct`.
    // The loop continues as long as there's a search range of at least 2.
    while (searchUpperBoundary - searchLowerBoundary > 1) {
        // Calculate the midpoint of the current search range.
        // Using `Math.floor` ensures the midpoint is always strictly less than `searchUpperBoundary`.
        const currentMidpointGuess = searchLowerBoundary + Math.floor((searchUpperBoundary - searchLowerBoundary) / 2);

        // Check if the current midpoint guess is a feasible maximum product.
        if (isTargetAchievable(currentMidpointGuess)) {
            // If achievable, this guess might be the answer, or a new tighter upper bound.
            searchUpperBoundary = currentMidpointGuess;
        } else {
            // If not achievable, this guess is too low, so it becomes the new lower bound.
            searchLowerBoundary = currentMidpointGuess;
        }
    }

    // After the binary search, `searchUpperBoundary` holds the smallest feasible maximum product.
    console.log(searchUpperBoundary);
}

// The following line handles standard input/output for competitive programming environments.
// It should typically remain untouched.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));