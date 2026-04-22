function processSequenceData(rawDataString) {
    // This function processes raw input string to determine the minimum
    // changes required to satisfy a specific pattern in a sequence of numbers.

    // Step 1: Input parsing and initial validation.
    // The input is expected to be two lines: first line for count, second for space-separated values.
    const dataLines = rawDataString.split("\n");
    if (dataLines.length < 2) {
        // Guard clause for malformed input.
        console.error("Input malformed: Expected at least two lines.");
        return -1; // Or throw an error, depending on desired error handling.
    }

    const arrayLengthStr = dataLines[0];
    const elementValuesStr = dataLines[1];

    const totalItems = parseInt(arrayLengthStr, 10);

    // Basic validation for the total number of items
    if (isNaN(totalItems) || totalItems <= 0) {
        console.error("Invalid total item count provided.");
        return -1;
    }
    if (totalItems % 2 !== 0) {
        // The problem often implies an even number of elements for pairwise operations.
        // This is an additional validation/assumption based on the original code's n/2 loop.
        console.warn("Total item count is odd, which might lead to unexpected behavior with pairwise processing.");
    }

    const valueList = elementValuesStr.split(" ");
    if (valueList.length < totalItems) {
        console.error("Number of values in sequence does not match declared total items.");
        return -1;
    }

    // Step 2: Initialize frequency maps for two distinct groups (even and odd indices).
    // Using Map objects for better key handling and performance compared to plain objects.
    const firstGroupFrequencies = new Map(); // Stores counts for elements at 0, 2, 4... indices
    const secondGroupFrequencies = new Map(); // Stores counts for elements at 1, 3, 5... indices

    // Flag to check if all adjacent pairs are identical.
    // e.g., v[0] == v[1], v[2] == v[3], etc.
    let areAllPairsMatching = true;

    // The number of elements in each group (even-indexed and odd-indexed).
    // This will be used in subsequent calculations.
    const groupHalfSize = totalItems / 2;

    // Step 3: Iterate through the sequence to populate frequency maps and check pair identity.
    // The loop runs for half the total number of items, processing two elements per iteration.
    for (let currentIdx = 0; currentIdx < groupHalfSize; currentIdx++) {
        const leftElement = valueList[currentIdx * 2];
        const rightElement = valueList[currentIdx * 2 + 1];

        // Increment frequency for the element at the even position (first group).
        firstGroupFrequencies.set(leftElement, (firstGroupFrequencies.get(leftElement) || 0) + 1);

        // Increment frequency for the element at the odd position (second group).
        secondGroupFrequencies.set(rightElement, (secondGroupFrequencies.get(rightElement) || 0) + 1);

        // If at any point a pair of adjacent elements is not identical, set the flag to false.
        if (areAllPairsMatching && (leftElement !== rightElement)) {
            areAllPairsMatching = false;
        }
    }

    // Step 4: Handle the special case where all adjacent pairs are identical.
    // This implies a specific problem constraint where the two groups (even and odd)
    // must end up with different values. If they start identical, one whole group
    // must be changed to a new value.
    if (areAllPairsMatching) {
        // If all v[2i] == v[2i+1], then both frequency maps are identical.
        // To satisfy the "different values for even/odd groups" constraint,
        // we must change all elements in one of the groups.
        return groupHalfSize;
    }

    // Step 5: If the special case doesn't apply, calculate changes for each group independently.
    // This involves finding the most frequent element in each group and
    // counting how many elements are different from it.
    const replacementsForFirstGroup = tallyMismatchedElements(firstGroupFrequencies, groupHalfSize);
    const replacementsForSecondGroup = tallyMismatchedElements(secondGroupFrequencies, groupHalfSize);

    return replacementsForFirstGroup + replacementsForSecondGroup;
}

/**
 * Calculates the number of elements that need to be changed in a group
 * to make all elements in that group equal to its most frequent element.
 * @param {Map<string, number>} frequencyRegistry - A map of element values to their frequencies.
 * @param {number} groupItemCount - The total number of items in this group (e.g., totalItems / 2).
 * @returns {number} The minimum number of changes required for this group.
 */
function tallyMismatchedElements(frequencyRegistry, groupItemCount) {
    // Find the element that occurs most frequently in the current group.
    const dominantValue = identifyPeakOccurrence(frequencyRegistry);

    // If the map is empty or no dominant value found, something is wrong, or all elements are unique.
    // In this context, it implies all elements would need to be changed if the group has items.
    if (dominantValue === null) {
        return groupItemCount; // All elements are unique or map is empty, need to change all.
    }

    // The number of elements that are already the dominant value.
    const dominantValueCount = frequencyRegistry.get(dominantValue);

    // The number of changes needed is the total items in the group minus
    // the count of the most frequent element.
    const changesRequired = groupItemCount - dominantValueCount;

    return changesRequired;
}

/**
 * Identifies the key (element value) with the highest frequency in a given map.
 * @param {Map<string, number>} valueOccurrences - A map where keys are values and values are their frequencies.
 * @returns {string|null} The key associated with the highest frequency, or null if the map is empty.
 */
function identifyPeakOccurrence(valueOccurrences) {
    let peakCount = 0;
    let mostCommonKey = null;

    // Iterate through all key-value pairs (element and its count) in the map.
    for (const [itemKey, currentCount] of valueOccurrences.entries()) {
        // If the current element's count is greater than the highest seen so far,
        // update the peak count and the most common key.
        if (currentCount > peakCount) {
            peakCount = currentCount;
            mostCommonKey = itemKey;
        }
    }

    return mostCommonKey;
}

// Entry point for executing the solution with standard input.
// This part remains similar as it's typically environment-specific.
console.log(processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8")));