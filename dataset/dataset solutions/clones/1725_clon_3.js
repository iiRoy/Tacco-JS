// Helper function to parse space-separated numbers from a string
function parseNumbersFromString(rawStrValue) {
    // Validate input: ensure it's a non-empty string
    if (typeof rawStrValue !== 'string' || rawStrValue.trim() === '') {
        return []; // Return an empty array for invalid or empty input
    }
    // Split the string by spaces, then convert each part to a number
    return rawStrValue.split(' ').map(Number);
}

// Helper function to compute prefix sums for a given array of numbers
function computePrefixSums(dataNumericalValues) {
    // Guard clause for non-array or empty array input
    if (!Array.isArray(dataNumericalValues) || dataNumericalValues.length === 0) {
        return [];
    }

    const accumulatedSumList = []; // This will store the prefix sums
    let runningCumulativeTotal = 0; // Tracks the sum up to the current element

    // Iterate through each value in the input array
    for (const singleValue of dataNumericalValues) {
        runningCumulativeTotal += singleValue; // Add current value to the running total
        accumulatedSumList.push(runningCumulativeTotal); // Store the new cumulative total
    }
    return accumulatedSumList;
}

// Binary search function to find the count of elements less than or equal to a target value
// in a sorted array. It returns the index where the target would be inserted to maintain order,
// which effectively represents the count of elements <= target.
function findUpperLimitIndex(orderedNumericalArray, targetComparisonValue) {
    // Handle edge case: an empty or invalid array
    if (!Array.isArray(orderedNumericalArray) || orderedNumericalArray.length === 0) {
        return 0; // No elements, so 0 elements satisfy the condition
    }

    let searchStartIndex = 0; // Lower bound of the search range
    let searchEndIndex = orderedNumericalArray.length; // Exclusive upper bound of the search range

    // Perform binary search to locate the split point
    while (searchStartIndex < searchEndIndex) {
        // Calculate the middle index, ensuring it's an integer
        const middleLookupIndex = Math.floor((searchStartIndex + searchEndIndex) / 2);

        // Compare the target value with the element at the middle index
        if (targetComparisonValue < orderedNumericalArray[middleLookupIndex]) {
            // If the target is smaller, the element at middleLookupIndex (and elements to its right)
            // are too large. We need to search in the left half.
            searchEndIndex = middleLookupIndex;
        } else {
            // If the target is greater than or equal, the element at middleLookupIndex
            // could be part of our count, so we search in the right half.
            searchStartIndex = middleLookupIndex + 1;
        }
    }
    // At this point, searchStartIndex holds the count of elements in
    // orderedNumericalArray that are less than or equal to targetComparisonValue.
    return searchStartIndex;
}

// Main processing function for the problem logic
function processData(rawInputContentString) {
    // Input validation: ensure the content is a string
    if (typeof rawInputContentString !== 'string') {
        console.error("Error: Input must be a string.");
        return;
    }

    // Split the raw input into individual lines and trim whitespace from each
    const parsedInputLines = rawInputContentString.trim().split('\n');

    // Input validation: ensure there are enough lines for parameters and data arrays
    if (parsedInputLines.length < 3) {
        console.error("Error: Insufficient input data. Expected at least 3 lines.");
        return;
    }

    // Parse the first line to extract problem parameters (n, m, k)
    const problemParameters = parseNumbersFromString(parsedInputLines[0]);
    // The original problem defines n, m, k. Only 'k' (budgetLimit) is used in the core logic.
    // Validate that 'k' is present and a valid number.
    if (problemParameters.length < 3 || !Number.isFinite(problemParameters[2])) {
        console.error("Error: Invalid or missing budget limit parameter in the first line.");
        return;
    }
    const totalBudgetLimit = problemParameters[2]; // Renamed 'k' for clarity

    // Parse the second line for values belonging to the first set (array 'a')
    const itemValuesSetA = parseNumbersFromString(parsedInputLines[1]);
    // Parse the third line for values belonging to the second set (array 'b')
    const itemValuesSetB = parseNumbersFromString(parsedInputLines[2]);

    // Compute prefix sums for both sets of item values.
    // This allows for O(1) lookup of the cost of taking 'X' items.
    const cumulativeCostsSetA = computePrefixSums(itemValuesSetA);
    const cumulativeCostsSetB = computePrefixSums(itemValuesSetB);

    // Initialize a variable to keep track of the maximum total items found
    let maximumTotalItemsRead = 0;

    // Early exit condition: if the budget is non-positive, no items can be taken
    if (totalBudgetLimit <= 0) {
        console.log(0);
        return;
    }

    // Determine the absolute maximum number of items that could possibly be taken from Set A
    // if the entire budget was spent solely on Set A. This helps optimize the loop range.
    const maxPossibleItemsFromA = findUpperLimitIndex(cumulativeCostsSetA, totalBudgetLimit);

    // Iterate through all possible counts of items that can be taken from Set A.
    // The loop runs from 0 (taking no items from A) up to `maxPossibleItemsFromA`.
    for (let currentCountA = 0; currentCountA <= maxPossibleItemsFromA; currentCountA++) {
        // Calculate the total cost incurred by taking `currentCountA` items from Set A.
        // If `currentCountA` is 0, the cost is 0. Otherwise, it's the prefix sum at index `currentCountA - 1`.
        const costFromSetA = (currentCountA === 0) ? 0 : cumulativeCostsSetA[currentCountA - 1];

        // Optimization: If the cost from Set A alone already exceeds the budget,
        // we can stop iterating for Set A. Since costs are non-decreasing,
        // any further `currentCountA` will also exceed the budget.
        if (costFromSetA > totalBudgetLimit) {
            break;
        }

        // Calculate the remaining budget available for items from Set B
        const remainingBudgetForSetB = totalBudgetLimit - costFromSetA;

        // Use binary search to find the maximum number of items that can be taken from Set B
        // with the `remainingBudgetForSetB`.
        const currentCountB = findUpperLimitIndex(cumulativeCostsSetB, remainingBudgetForSetB);

        // Calculate the total number of items for the current combination of `currentCountA` and `currentCountB`
        const combinedItemsCount = currentCountA + currentCountB;

        // Update the overall maximum if this combination yields a higher total count
        if (combinedItemsCount > maximumTotalItemsRead) {
            maximumTotalItemsRead = combinedItemsCount;
        }
    }

    // Output the final computed maximum total number of items
    console.log(maximumTotalItemsRead);
}

// Entry point for execution:
// Reads the entire content of standard input, decodes it as UTF-8,
// trims any leading/trailing whitespace, and then passes it to the `processData` function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());