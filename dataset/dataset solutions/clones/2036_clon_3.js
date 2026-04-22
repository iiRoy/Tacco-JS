function ProcessInputData(rawDataString) {
    // This function processes raw input string to calculate a maximized sum
    // based on specific replacement rules.

    const inputLines = rawDataString.split("\n"); // Split the entire input into individual lines.

    // Helper function to parse a line of space-separated numbers, convert to integers,
    // sort them, and potentially filter to a specific count.
    const parseAndPrepareNumbers = (line, count = -1) => {
        const numbersAsStrings = line.split(" ");
        let numericArray = numbersAsStrings.map(str => parseInt(str.trim(), 10));

        // Ensure all elements are valid numbers; filter out any NaN values from parsing errors.
        numericArray = numericArray.filter(val => !isNaN(val));

        // Sort in descending order to easily access smallest elements later (at the end of the array).
        numericArray.sort((a, b) => b - a);

        // If a count is provided, trim the array to that length.
        if (count > 0 && numericArray.length > count) {
            numericArray = numericArray.slice(0, count);
        }
        return numericArray;
    };

    // --- Input Parsing Stage ---

    // Extract the initial counts for lists P and Q from the first line.
    const initialCountsLine = inputLines[0].split(" ");
    let numItemsP = parseInt(initialCountsLine[0], 10);
    let numItemsQ = parseInt(initialCountsLine[1], 10);

    // Basic validation for counts
    if (isNaN(numItemsP) || numItemsP < 0) numItemsP = 0;
    if (isNaN(numItemsQ) || numItemsQ < 0) numItemsQ = 0;

    // Parse and prepare the three lists of numbers.
    // listP will be truncated to numItemsP, sorted descending.
    let listP = parseAndPrepareNumbers(inputLines[1], numItemsP);

    // listQ will be truncated to numItemsQ, sorted descending.
    let listQ = parseAndPrepareNumbers(inputLines[2], numItemsQ);

    // replacementsList contains all potential replacement values, sorted descending.
    const replacementsList = parseAndPrepareNumbers(inputLines[3]);

    // --- Core Replacement Logic ---

    // Pointers to the current smallest elements in listP and listQ.
    // Since arrays are sorted descending, the smallest elements are at the end.
    let pSmallestIdx = listP.length - 1;
    let qSmallestIdx = listQ.length - 1;

    // Iterate through the replacement values, from largest to smallest.
    for (let currentReplacementIdx = 0; currentReplacementIdx < replacementsList.length; currentReplacementIdx++) {
        const currentReplacementValue = replacementsList[currentReplacementIdx];

        // Flags to check if elements are still available for replacement in P and Q.
        const pHasReplaceableElement = pSmallestIdx >= 0;
        const qHasReplaceableElement = qSmallestIdx >= 0;

        let potentialTargetValue = Infinity; // Initialize with a very large value
        let targetListIdentifier = null; // 'p' or 'q'

        // Determine which list (if any) has the overall smallest element that can be replaced.
        if (pHasReplaceableElement) {
            potentialTargetValue = listP[pSmallestIdx];
            targetListIdentifier = 'p';
        }

        if (qHasReplaceableElement) {
            // If Q's smallest is valid and smaller than P's (or P is not valid)
            if (!pHasReplaceableElement || listQ[qSmallestIdx] < potentialTargetValue) {
                potentialTargetValue = listQ[qSmallestIdx];
                targetListIdentifier = 'q';
            }
        }

        // Only perform a replacement if we found a valid target element
        // AND the current replacement value is strictly greater than the target.
        if (targetListIdentifier !== null && currentReplacementValue > potentialTargetValue) {
            if (targetListIdentifier === 'p') {
                listP[pSmallestIdx] = currentReplacementValue;
                pSmallestIdx--; // Move to the next smallest element in P
            } else { // targetListIdentifier === 'q'
                listQ[qSmallestIdx] = currentReplacementValue;
                qSmallestIdx--; // Move to the next smallest element in Q
            }
        } else {
            // Optimization: If the current replacement value is not greater than the smallest
            // available element in either list, then no subsequent smaller replacement
            // values will be greater either. We can exit early.
            // This is a subtle addition/optimization that wasn't explicit in the original.
            if (!pHasReplaceableElement && !qHasReplaceableElement) {
                // No more elements to replace in either list
                break;
            }
            // If currentReplacementValue is not greater than potentialTargetValue,
            // and replacementsList is sorted descending, then future values in replacementsList
            // will also not be greater.
            if (targetListIdentifier !== null) { // We had a target, but currentReplacementValue was not larger.
                break;
            }
        }
    }

    // --- Summation Stage ---

    // Calculate the total sum of elements in both modified lists.
    let totalSum = 0;

    // Use reduce for a more functional approach to summing.
    totalSum += listP.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    totalSum += listQ.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Output the final calculated sum.
    console.log(totalSum);
}

// Invoke the main processing function with input read from stdin.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));