const areBitwiseDisjoint = (firstValue, secondValue) => {
    // This condition (A & B) === 0 is mathematically equivalent to (A ^ B) === (A + B).
    // It indicates that 'firstValue' and 'secondValue' have no common set bits.
    return (firstValue & secondValue) === 0;
};

function calculateBitwiseSubarrayCount(inputDataString) {
    // --- Input Processing and Initial Validations ---
    if (!inputDataString || typeof inputDataString !== 'string' || inputDataString.trim() === '') {
        console.error("Input error: Provided data is empty or not a valid string.");
        return; // Early exit for invalid input
    }

    let rawLines = inputDataString.split("\n");

    // Clean up any trailing empty lines that might result from input formatting.
    while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === '') {
        rawLines.pop();
    }

    if (rawLines.length < 2) {
        console.error("Input error: Not enough lines provided. Expected at least two lines for size and array elements.");
        return;
    }

    // Parse the intended size of the array from the first line.
    let declaredArraySize = Number(rawLines[0].split(' ')[0]);
    if (isNaN(declaredArraySize) || declaredArraySize < 0) {
        console.error("Input error: Invalid or negative array size detected.");
        return;
    }

    // Parse the numeric elements of the array from the second line.
    const numericElementsArray = rawLines[1].split(' ').map(Number);

    // Validate if the actual number of elements matches the declared size.
    // Adjust declaredArraySize if there's a discrepancy to prevent out-of-bounds access.
    if (numericElementsArray.length < declaredArraySize) {
        console.warn(`Data warning: Declared array size (${declaredArraySize}) is larger than actual element count (${numericElementsArray.length}). Adjusting size.`);
        declaredArraySize = numericElementsArray.length;
    } else if (numericElementsArray.length > declaredArraySize) {
        console.warn(`Data warning: Actual element count (${numericElementsArray.length}) is larger than declared array size (${declaredArraySize}). Truncating to declared size.`);
        // Truncate the array if it's longer than declared, aligning with typical problem constraints.
        numericElementsArray.length = declaredArraySize;
    }

    // If the array is effectively empty after parsing and adjustments, there are no subarrays.
    if (declaredArraySize === 0) {
        console.log(0);
        return;
    }

    // --- Core Logic: Sliding Window for Bitwise Disjoint Subarrays ---
    let currentRightWindowBoundary = 0;
    let currentWindowCombinedSum = 0; // Represents both XOR sum and arithmetic sum due to disjoint property
    let rightmostValidIndices = []; // Stores the furthest valid right index for each starting point

    // Iterate through all possible starting positions for a subarray.
    for (let currentLeftWindowBoundary = 0; currentLeftWindowBoundary < declaredArraySize; ++currentLeftWindowBoundary) {
        // If this is not the first iteration, an element is moving out of the window from the left.
        if (currentLeftWindowBoundary > 0) {
            // Remove the element from the combined sum using XOR, which works because of the disjoint property.
            currentWindowCombinedSum ^= numericElementsArray[currentLeftWindowBoundary - 1];
        }

        // Ensure the right boundary never falls behind the current left boundary.
        // If it does, the window has effectively reset or become empty, so re-initialize.
        if (currentRightWindowBoundary < currentLeftWindowBoundary) {
            currentRightWindowBoundary = currentLeftWindowBoundary;
            currentWindowCombinedSum = 0; // Reset sum for an empty window starting at currentLeftWindowBoundary
        }

        // Expand the window to the right as long as the bitwise disjoint property holds.
        while (currentRightWindowBoundary < declaredArraySize &&
               areBitwiseDisjoint(currentWindowCombinedSum, numericElementsArray[currentRightWindowBoundary])) {
            // Add the new element to the combined sum arithmetically.
            currentWindowCombinedSum += numericElementsArray[currentRightWindowBoundary];
            currentRightWindowBoundary++; // Advance the right boundary (exclusive)
        }

        // Record the rightmost valid index (inclusive) for the subarray starting at currentLeftWindowBoundary.
        // currentRightWindowBoundary is exclusive, so we subtract 1.
        rightmostValidIndices.push(currentRightWindowBoundary - 1);
    }

    // --- Result Aggregation ---
    let totalValidSubarrayCount = 0;
    // Iterate through the stored rightmost indices to calculate the total count of subarrays.
    for (let currentStartingIndex = 0; currentStartingIndex < rightmostValidIndices.length; ++currentStartingIndex) {
        const correspondingEndIndex = rightmostValidIndices[currentStartingIndex];
        // The number of valid subarrays for a given starting index is (end_index - start_index + 1).
        const countForThisStartingPoint = correspondingEndIndex - currentStartingIndex + 1;

        // Add only positive counts (a count of 0 or less implies no valid subarray from this start).
        if (countForThisStartingPoint > 0) {
            totalValidSubarrayCount += countForThisStartingPoint;
        }
    }

    // Output the final computed total count of valid subarrays.
    console.log(totalValidSubarrayCount);
}

// --- Standard Input/Output Handling ---
// This section is typically used in competitive programming environments to read input
// from standard input and pass it to the main processing function.
// It should generally remain unchanged for problem submission.
calculateBitwiseSubarrayCount(require("fs").readFileSync("/dev/stdin", "utf8"));