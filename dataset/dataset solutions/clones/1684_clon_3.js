/**
 * This module contains a refactored and structurally modified version
 * of an algorithm designed to process sequential data sets.
 * It demonstrates Type III code cloning by extensively renaming identifiers,
 * restructuring control flow, adding helper functions, and incorporating
 * additional validation checks, while preserving core functionality.
 */

/**
 * A private utility function to safely parse a string into an integer.
 * It consistently uses radix 10 for decimal parsing.
 * @param {string} textValue - The string representation of a number.
 * @returns {number} The parsed integer value.
 */
function parseNumericValue(textValue) {
    return parseInt(textValue, 10);
}

/**
 * Searches backward from a given starting index to find the first unoccupied slot
 * within a boolean availability map.
 * @param {boolean[]} slotAvailabilityMap - An array where `true` indicates an occupied slot, `false` an available one.
 * @param {number} startingIndex - The initial index from which to begin the reverse search (inclusive).
 * @returns {number} The index of the first available slot found, or -1 if no such slot exists up to index 0.
 */
function locateFreeSlot(slotAvailabilityMap, startingIndex) {
    let currentSearchIndex = startingIndex;
    // Decrement the index until an available slot is found or the beginning of the map is reached.
    while (currentSearchIndex >= 0 && slotAvailabilityMap[currentSearchIndex] === true) { // Changed from `!== false` for stylistic variation
        currentSearchIndex--;
    }
    return currentSearchIndex; // Returns -1 if no slot found or if startingIndex was initially negative.
}

/**
 * The primary function responsible for processing a multi-case input string.
 * It parses input, categorizes items, performs calculations, and outputs results per case.
 * @param {string} rawDataContent - The entire input data as a single string, typically from stdin.
 */
function ProcessInputData(rawDataContent) {
    // --- Input Pre-processing and Validation (Added Guard Clauses) ---
    // Ensure the input is a valid string and not empty after trimming.
    if (typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
        // In a production system, this would likely log an error or throw an exception.
        // For competitive programming, this handles malformed empty inputs gracefully.
        return;
    }

    // Transform the raw string input into a structured array of string arrays.
    // Each inner array represents a line split by spaces.
    const structuredInputLines = rawDataContent.trim().split("\n").map(lineStr => lineStr.split(" "));

    // If, after splitting, there are no lines, exit early.
    if (structuredInputLines.length === 0) {
        return;
    }

    // --- Main Loop for Processing Multiple Test Cases ---
    let currentInputDataRow = 1; // Start processing from the second line (index 1), assuming line 0 is often metadata or empty.

    // This loop continues as long as there are more lines to process in the input.
    // The termination condition is now explicit in the loop header.
    for (; currentInputDataRow < structuredInputLines.length; ) {
        // Robustness check for incomplete or corrupted input data blocks.
        if (!structuredInputLines[currentInputDataRow] || structuredInputLines[currentInputDataRow].length === 0) {
            break; // No more valid data lines for a new test case.
        }

        // Extract the count of items for the current test case.
        const currentCaseItemCount = parseNumericValue(structuredInputLines[currentInputDataRow][0]);

        // Initialize two distinct collections for categorizing items based on their properties.
        // 'PrimaryItems' for original line[1] > line[2] cases.
        const primaryConditionalItems = [];
        // 'SecondaryItems' for original line[1] < line[2] cases (after transformation).
        const secondaryConditionalItems = [];

        let cumulativeInitialSum = 0; // Accumulates a base value from all items.
        let effectiveCapacitySlots = currentCaseItemCount; // Tracks available slots for later assignment.

        // --- Item Categorization and Initial Summation Loop ---
        for (let itemOrdinal = 0; itemOrdinal < currentCaseItemCount; itemOrdinal++) {
            // Read and parse the current item's three numeric values.
            const currentRawItemEntry = structuredInputLines[currentInputDataRow + itemOrdinal + 1].map(parseNumericValue);
            const itemIdentifier = currentRawItemEntry[0]; // Corresponds to K
            const itemLeftValue = currentRawItemEntry[1];  // Corresponds to L
            const itemRightValue = currentRawItemEntry[2]; // Corresponds to R

            // Apply specific logic based on item properties to categorize and update the sum.
            if (itemIdentifier === currentCaseItemCount) { // If K === N
                cumulativeInitialSum += itemLeftValue;
                effectiveCapacitySlots--; // This item effectively "consumes" a slot without further processing.
            } else if (itemLeftValue > itemRightValue) { // If L > R
                primaryConditionalItems.push(currentRawItemEntry);
                cumulativeInitialSum += itemRightValue;
            } else if (itemLeftValue < itemRightValue) { // If L < R
                // Transform the item's data for the secondary category.
                // The transformation is: [N - K, R, L]
                const transformedIdentifier = currentCaseItemCount - itemIdentifier;
                const transformedLeftValue = itemRightValue;
                const transformedRightValue = itemLeftValue;
                secondaryConditionalItems.push([transformedIdentifier, transformedLeftValue, transformedRightValue]);
                cumulativeInitialSum += itemRightValue;
            } else { // If L === R
                cumulativeInitialSum += itemLeftValue; // (or itemRightValue, they are equal)
                effectiveCapacitySlots--; // This item also consumes a slot.
            }
        }

        // --- Sorting Categorized Items ---
        // Both item categories are sorted based on their first element (K or transformed K).
        primaryConditionalItems.sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);
        secondaryConditionalItems.sort((firstItem, secondItem) => firstItem[0] - secondItem[0]);

        let totalAccumulatedValue = cumulativeInitialSum; // The final result starts with the initial sum.

        // --- Processing Primary Conditional Items ---
        // A boolean array to manage slot occupancy. `false` means available, `true` means taken.
        let slotOccupancyMap = new Array(effectiveCapacitySlots).fill(false);

        for (let pIdx = 0; pIdx < primaryConditionalItems.length; pIdx++) {
            const currentItem = primaryConditionalItems[pIdx];
            const desiredPlacementIndex = currentItem[0] - 1; // Convert 1-indexed K to 0-indexed array position.
            const valueIncreasePotential = currentItem[1] - currentItem[2]; // L - R

            // Utilize the helper function to find an available slot.
            const actualAssignedSlot = locateFreeSlot(slotOccupancyMap, desiredPlacementIndex);

            if (actualAssignedSlot >= 0) {
                slotOccupancyMap[actualAssignedSlot] = true; // Mark the found slot as occupied.
                totalAccumulatedValue += valueIncreasePotential; // Add the potential gain to the total.
            }
        }

        // --- Processing Secondary Conditional Items ---
        // Reset the occupancy map for independent processing of the second category.
        slotOccupancyMap = new Array(effectiveCapacitySlots).fill(false);

        for (let sIdx = 0; sIdx < secondaryConditionalItems.length; sIdx++) {
            const currentItem = secondaryConditionalItems[sIdx];
            const desiredPlacementIndex = currentItem[0] - 1; // Convert 1-indexed transformed K to 0-indexed.
            const valueIncreasePotential = currentItem[1] - currentItem[2]; // Transformed L - Transformed R

            // Utilize the helper function again for the second category.
            const actualAssignedSlot = locateFreeSlot(slotOccupancyMap, desiredPlacementIndex);

            if (actualAssignedSlot >= 0) {
                slotOccupancyMap[actualAssignedSlot] = true; // Mark the slot as occupied.
                totalAccumulatedValue += valueIncreasePotential; // Add the potential gain.
            }
        }

        // --- Output Result for Current Test Case ---
        console.log(totalAccumulatedValue);

        // --- Advance to the Next Test Case ---
        // Update the row pointer to the beginning of the next test case.
        // This accounts for the 'N' line itself plus the 'N' subsequent item lines.
        currentInputDataRow += currentCaseItemCount + 1;
    }
}

// --- Script Entry Point ---
// Reads data from standard input and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));