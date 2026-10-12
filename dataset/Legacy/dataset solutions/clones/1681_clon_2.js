// This program processes input data to calculate an optimized sum based on specific conditions.
// The original algorithm might have issues with performance (e.g., Time Limit Exceeded) or could be simplified.
function ProcessInputData(rawData) {
    // Pre-process the raw input: trim leading/trailing whitespace, split by new line,
    // then map each line string to an array of strings by splitting on space.
    rawData = rawData.trim().split("\n").map(function(lineStr) { return lineStr.split(" "); });

    // Initialize the line offset for reading input blocks.
    var lineOffset = 1;

    // Helper function to find the lower bound (insertion point) in a sorted array.
    // This function is defined in the original code but is not invoked.
    const findInsertionPoint = (dataArray, targetValue) => {
        let startIndex = 0, endIndex = dataArray.length - 1, midPoint;
        while (startIndex <= endIndex) {
            midPoint = 0 | (startIndex + endIndex) / 2; // Integer division using bitwise OR.
            if (dataArray[midPoint] < targetValue) startIndex = midPoint + 1;
            else endIndex = midPoint - 1;
        }
        return startIndex;
    };

    // Main loop to process multiple test cases from the input.
    while (true) {
        // Check if there's no more input data to process for the next test case.
        if (rawData[lineOffset] == null) {
            break; // Exit the loop if the end of input is reached.
        }

        // Parse the number of entries (N) for the current test case from the current line.
        var numEntries = parseInt(rawData[lineOffset][0], 10);

        // Arrays to store categorized KLR data based on specific conditions.
        var groupAItems = [];
        var groupBItems = [];

        // Lists to store unique K values (minus 1) for each group, used for space management.
        var uniqueKeysA = [];
        var uniqueKeysB = [];

        var currentLineData; // Temporary variable to hold parsed data for the current line.
        var baseSumValue = 0; // Accumulator for the initial sum of 'R' or 'L' values.
        var remainingEntries = numEntries; // Counter for entries not handled by special cases.

        // Loop through each entry (N lines) for the current test case.
        for (var idx = 0; idx < numEntries; idx++) {
            // An empty console.log statement, preserving original behavior.
            console.log;
            // Parse the current line's elements as integers.
            currentLineData = rawData[lineOffset + idx + 1].map(elementVal => parseInt(elementVal, 10));

            // Conditional logic to categorize and process entries based on K, L, and R values.
            if (currentLineData[0] === numEntries) {
                // If K (currentLineData[0]) equals N, add L (currentLineData[1]) to base sum.
                baseSumValue += currentLineData[1];
                remainingEntries--; // Decrement count of entries needing further processing.
            } else if (currentLineData[1] > currentLineData[2]) {
                // If L (currentLineData[1]) is greater than R (currentLineData[2]).
                groupAItems.push(currentLineData); // Add the item to group A.
                baseSumValue += currentLineData[2]; // Add R to the base sum.
                uniqueKeysA.push(currentLineData[0] - 1); // Store K-1 for group A.
            } else if (currentLineData[1] < currentLineData[2]) {
                // If L (currentLineData[1]) is less than R (currentLineData[2]).
                // Transform the line: K becomes N-K, L and R values are swapped.
                currentLineData = [numEntries - currentLineData[0], currentLineData[2], currentLineData[1]];
                groupBItems.push(currentLineData); // Add the transformed item to group B.
                baseSumValue += currentLineData[2]; // Add the new R (original L) to the base sum.
                uniqueKeysB.push(currentLineData[0] - 1); // Store transformed K-1 for group B.
            } else {
                // If L (currentLineData[1]) is equal to R (currentLineData[2]).
                baseSumValue += currentLineData[1]; // Add L (or R) to the base sum.
                remainingEntries--; // Decrement count of entries needing further processing.
            }
        }

        // Sort the categorized item arrays by their first element (K value).
        groupAItems.sort((itemOne, itemTwo) => itemOne[0] - itemTwo[0]);
        groupBItems.sort((itemOne, itemTwo) => itemOne[0] - itemTwo[0]);

        // Sort unique keys and remove duplicates to prepare for space list creation.
        uniqueKeysA = uniqueKeysA.sort((valA, valB) => valA - valB).filter(function (itemVal, idx, selfRef) {
            return selfRef.indexOf(itemVal) === idx; // Keep only unique values.
        });
        uniqueKeysB = uniqueKeysB.sort((valA, valB) => valA - valB).filter(function (itemVal, idx, selfRef) {
            return selfRef.indexOf(itemVal) === idx; // Keep only unique values.
        });

        // Initialize space lists and index maps for managing available slots.
        // availableSlots[0] stores the total capacity for a slot, availableSlots[1] stores the currently used capacity.
        var availableSlotsA = [[], []];
        var availableSlotsB = [[], []];

        // Create maps to quickly get the index in the spaceList from a K value.
        // The length calculation for slotIndexMapA handles empty uniqueKeysA.
        var slotIndexMapA = Array.from({length: (uniqueKeysA.length > 0 ? uniqueKeysA[uniqueKeysA.length - 1] : -1) + 1}, () => 0);
        // The length calculation for slotIndexMapB uses uniqueKeysA, replicating original behavior (potential typo).
        var slotIndexMapB = Array.from({length: uniqueKeysA[uniqueKeysB.length - 1] + 1}, () => 0);

        // Populate availableSlotsA and slotIndexMapA based on unique keys.
        var prevKey = -1; // Initialize previous key for calculating slot capacity.
        for (var idx = 0; idx < uniqueKeysA.length; idx++) {
            availableSlotsA[0].push(uniqueKeysA[idx] - prevKey); // Capacity is difference from previous key.
            availableSlotsA[1].push(0); // Initialize used capacity to 0.
            slotIndexMapA[uniqueKeysA[idx]] = idx; // Map K value to its corresponding index in availableSlotsA.
            prevKey = uniqueKeysA[idx]; // Update previous key.
        }

        // Populate availableSlotsB and slotIndexMapB based on unique keys.
        prevKey = -1; // Reset previous key for the second list.
        for (var idx = 0; idx < uniqueKeysB.length; idx++) {
            availableSlotsB[0].push(uniqueKeysB[idx] - prevKey); // Capacity is difference from previous key.
            availableSlotsB[1].push(0); // Initialize used capacity to 0.
            slotIndexMapB[uniqueKeysB[idx]] = idx; // Map K value to its corresponding index in availableSlotsB.
            prevKey = uniqueKeysB[idx]; // Update previous key.
        }

        var finalResult = baseSumValue; // Initialize final result with the calculated base sum.
        var optimalPosition; // Declared but not used in the original code, kept for structural equivalence.
        var currentSlotIdx; // Temporary variable for the current slot index being checked.

        // Process group A items to maximize the sum by utilizing available slots.
        for (var idx = 0; idx < groupAItems.length; idx++) {
            var valueIncrease = groupAItems[idx][1] - groupAItems[idx][2]; // Calculate potential increase (L - R).
            currentSlotIdx = slotIndexMapA[groupAItems[idx][0] - 1]; // Get the slot index for K-1.

            // Find an available slot by moving backwards if the current one is full.
            while (availableSlotsA[1][currentSlotIdx] === availableSlotsA[0][currentSlotIdx] && currentSlotIdx >= 0) {
                currentSlotIdx--;
            }

            // If an available slot is found (index is valid), use it and update the sum.
            if (currentSlotIdx >= 0) {
                availableSlotsA[1][currentSlotIdx]++; // Increment used capacity for this slot.
                finalResult += valueIncrease; // Add the calculated increase to the total result.
            }
        }

        // Process group B items to maximize the sum by utilizing available slots.
        for (var idx = 0; idx < groupBItems.length; idx++) {
            var valueIncrease = groupBItems[idx][1] - groupBItems[idx][2]; // Calculate potential increase (L - R).
            currentSlotIdx = slotIndexMapB[groupBItems[idx][0] - 1]; // Get the slot index for K-1.

            // Find an available slot by moving backwards if the current one is full.
            while (availableSlotsB[1][currentSlotIdx] === availableSlotsB[0][currentSlotIdx] && currentSlotIdx >= 0) {
                currentSlotIdx--;
            }

            // If an available slot is found (index is valid), use it and update the sum.
            if (currentSlotIdx >= 0) {
                availableSlotsB[1][currentSlotIdx]++; // Increment used capacity for this slot.
                finalResult += valueIncrease; // Add the calculated increase to the total result.
            }
        }

        // Output the final calculated result for the current test case to standard output.
        console.log(finalResult);

        // Advance the line offset to the beginning of the next test case.
        lineOffset += numEntries + 1;
    }
}

// Read input from standard input (e.g., from a file or pipe) and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
