let processInputData = (rawDataSet) => {
    // Process the raw input string: trim whitespace, split into lines,
    // then split each line by space.
    // Each line will become an array of strings.
    let parsedLines = rawDataSet.trim().split("\n").map((lineContent) => lineContent.split(" "));

    // `currentLineOffset` keeps track of our position in the `parsedLines` array
    // as we read through different test cases and their associated data.
    let currentLineOffset = 1; // Start from the second line, as the first line is usually metadata for the first test case or the problem itself

    // Main loop to process multiple test cases, if any.
    // The loop continues as long as there are lines remaining to be processed.
    while (currentLineOffset < parsedLines.length) {
        // If the current line is empty or doesn't exist, we've reached the end of input or an invalid state.
        if (!parsedLines[currentLineOffset] || parsedLines[currentLineOffset].length === 0) {
            break;
        }

        // Parse the number of items for the current test case.
        // It's expected to be the first element of the current line.
        const itemCount = parseInt(parsedLines[currentLineOffset][0], 10);

        // Basic validation for itemCount. If invalid, skip this test case.
        if (isNaN(itemCount) || itemCount <= 0) {
            console.error(`Invalid item count ${parsedLines[currentLineOffset][0]} at line ${currentLineOffset}. Skipping.`);
            currentLineOffset++; // Move past the problematic line
            continue; // Proceed to the next iteration of the while loop
        }

        // Arrays to store items categorized into two types based on their properties.
        // Each item is an array: [key, value1, value2]
        let categoryOneItems = [];
        let categoryTwoItems = [];

        // Lists to store unique 'key - 1' values for each category, used for indexing later.
        let uniqueKeysOne = [];
        let uniqueKeysTwo = [];

        // `initialAccumulatedSum` stores the sum of values that are fixed or contribute to the base total.
        let initialAccumulatedSum = 0;
        // `actualItemsToProcess` tracks the number of items that will undergo further processing (not fixed).
        let actualItemsToProcess = itemCount;

        // Loop through the 'itemCount' lines of data for the current test case.
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            // Calculate the actual line number in the input array.
            const dataLineIndex = currentLineOffset + itemIndex + 1;

            // Ensure the data line exists before parsing.
            if (!parsedLines[dataLineIndex]) {
                console.error(`Missing data line at index ${dataLineIndex}.`);
                break; // Exit the for loop if data is missing
            }

            // Parse the current data line into integers.
            const currentItemData = parsedLines[dataLineIndex].map((strVal) => parseInt(strVal, 10));

            // Destructure the parsed item for clarity.
            const [itemKey, itemVal1, itemVal2] = currentItemData;

            // Decision logic for categorizing items and updating sums.
            // Items where itemKey equals itemCount are "fixed" or "special".
            if (itemKey === itemCount) {
                initialAccumulatedSum += itemVal1;
                actualItemsToProcess--; // This item is handled, no further processing needed.
            }
            // Items where itemVal1 > itemVal2 are placed in category one.
            else if (itemVal1 > itemVal2) {
                categoryOneItems.push(currentItemData);
                initialAccumulatedSum += itemVal2; // Add the smaller value to the base sum.
                uniqueKeysOne.push(itemKey - 1); // Store the adjusted key.
            }
            // Items where itemVal1 < itemVal2 are transformed and placed in category two.
            else if (itemVal1 < itemVal2) {
                // Transform the item: key becomes (itemCount - itemKey), values are swapped.
                const transformedItem = [itemCount - itemKey, itemVal2, itemVal1];
                categoryTwoItems.push(transformedItem);
                initialAccumulatedSum += itemVal1; // Add the smaller original value to the base sum.
                uniqueKeysTwo.push(itemCount - itemKey - 1); // Store the adjusted transformed key.
            }
            // Items where itemVal1 === itemVal2 are also "fixed" like the first case.
            else {
                initialAccumulatedSum += itemVal1;
                actualItemsToProcess--;
            }
        }

        // Sort items within each category by their key for consistent processing.
        categoryOneItems.sort((a, b) => a[0] - b[0]);
        categoryTwoItems.sort((a, b) => a[0] - b[0]);

        // Sort unique keys and remove duplicates using a Set for efficiency.
        const processUniqueKeys = (keyList) => Array.from(new Set(keyList.sort((a, b) => a - b)));
        uniqueKeysOne = processUniqueKeys(uniqueKeysOne);
        uniqueKeysTwo = processUniqueKeys(uniqueKeysTwo);

        // Helper function to initialize allocation trackers and index maps.
        // `allocationTracker` stores [available_slots, used_slots] for each unique key interval.
        // `keyToIndexMap` maps a key value to its corresponding index in the `allocationTracker`.
        const initializeAllocationStructures = (keysList) => {
            let allocationTracker = [[], []]; // [available counts], [used counts]
            let keyToIndexMap = new Array(0); // Initialize as empty, will resize if keysList is not empty

            if (keysList.length > 0) {
                // Determine the maximum key to size the index map.
                const maxKeyValue = keysList[keysList.length - 1];
                keyToIndexMap = new Array(maxKeyValue + 1).fill(-1); // Use -1 to indicate no mapping initially
            }

            let previousKey = -1; // Sentinel value for the start of the first interval.
            for (let idx = 0; idx < keysList.length; idx++) {
                const currentKey = keysList[idx];
                // Calculate the number of available slots in this interval.
                allocationTracker[0].push(currentKey - previousKey);
                allocationTracker[1].push(0); // Initialize used slots to zero.
                keyToIndexMap[currentKey] = idx; // Map the key to its index in the tracker.
                previousKey = currentKey; // Update previousKey for the next iteration.
            }
            return { allocationTracker, keyToIndexMap };
        };

        const { allocationTracker: allocationSlotsOne, keyToIndexMap: keyMapOne } = initializeAllocationStructures(uniqueKeysOne);
        const { allocationTracker: allocationSlotsTwo, keyToIndexMap: keyMapTwo } = initializeAllocationStructures(uniqueKeysTwo);

        // `totalOptimizedSum` starts with the `initialAccumulatedSum` and will be incremented
        // by potential gains from category item processing.
        let totalOptimizedSum = initialAccumulatedSum;

        // Helper function to process items from a category and update the sum.
        // This abstracts the common logic for categoryOneItems and categoryTwoItems.
        const processCategoryAndAllocate = (items, keyMapping, allocations, currentTotal) => {
            let runningTotal = currentTotal;
            for (const item of items) {
                const [itemKey, itemVal1, itemVal2] = item;
                // Calculate the potential gain if this item is selected.
                const potentialGain = itemVal1 - itemVal2;

                // Optimization: if there's no gain, skip processing this item.
                if (potentialGain <= 0) {
                    continue;
                }

                // Find the allocation slot corresponding to the item's key.
                let currentSlotPointer = keyMapping[itemKey - 1]; // ItemKey is 1-based, our map is 0-based

                // Guard against invalid key mappings.
                if (currentSlotPointer === undefined || currentSlotPointer === -1) {
                    // This means the item's key was not in our uniqueKeys list.
                    // Depending on problem specifics, this might be an error or simply means no allocation can be made.
                    // For now, we'll just skip this item's potential gain.
                    continue;
                }

                // Traverse backward through allocation slots until an available slot is found.
                while (currentSlotPointer >= 0 && allocations[1][currentSlotPointer] >= allocations[0][currentSlotPointer]) {
                    currentSlotPointer--;
                }

                // If an available slot was found, allocate it and add the potential gain.
                if (currentSlotPointer >= 0) {
                    allocations[1][currentSlotPointer]++; // Increment used slots for this interval.
                    runningTotal += potentialGain; // Add the gain to the running total.
                }
            }
            return runningTotal;
        };

        // Process items from category one.
        totalOptimizedSum = processCategoryAndAllocate(categoryOneItems, keyMapOne, allocationSlotsOne, totalOptimizedSum);

        // Process items from category two.
        totalOptimizedSum = processCategoryAndAllocate(categoryTwoItems, keyMapTwo, allocationSlotsTwo, totalOptimizedSum);

        // Output the final calculated sum for the current test case.
        console.log(totalOptimizedSum);

        // Update `currentLineOffset` to point to the start of the next test case.
        // It moves past the 'N' line and the 'N' data lines.
        currentLineOffset += itemCount + 1;
    }
};

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));