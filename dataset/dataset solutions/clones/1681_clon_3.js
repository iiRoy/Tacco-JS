function ProcessInputData(rawDataLines) {
    // Extensive input preprocessing to prepare data chunks
    const parsedData = rawDataLines.trim().split("\n").map(entryLine => entryLine.split(" "));

    // Helper to process a specific category of items
    const manageCategorySlots = (itemsArray, keyMap, capacityData) => {
        let cumulativeGain = 0;
        for (const currentItem of itemsArray) {
            // Calculate the potential value increase from this item
            const itemValueA = currentItem[1];
            const itemValueB = currentItem[2];
            const potentialGain = itemValueA - itemValueB;

            // Only consider items that offer a positive gain
            if (potentialGain <= 0) {
                continue; // Skip if no gain or a loss
            }

            // Determine the initial index for slot allocation
            const adjustedKey = currentItem[0] - 1;
            let allocationIndex = keyMap[adjustedKey];

            // Traverse backward to find an available slot
            const capacityArray = capacityData[0];
            const currentFillArray = capacityData[1];

            // Ensure index is valid and slot is not full
            while (allocationIndex >= 0 && currentFillArray[allocationIndex] >= capacityArray[allocationIndex]) {
                allocationIndex--;
            }

            // If an available slot is found, utilize it
            if (allocationIndex >= 0) {
                currentFillArray[allocationIndex]++; // Mark slot as used
                cumulativeGain += potentialGain;      // Add to total gain
            }
        }
        return cumulativeGain;
    };

    let currentLineOffset = 1; // Index for the current test case's N value

    // Main processing loop for multiple data sets
    while (currentLineOffset < parsedData.length) {
        // Guard clause for unexpected end of data or malformed input
        if (!parsedData[currentLineOffset] || parsedData[currentLineOffset].length === 0) {
            break;
        }

        // Parse the number of entries for the current data set
        const entryCount = Number(parsedData[currentLineOffset][0]);
        if (isNaN(entryCount) || entryCount <= 0) {
            // Invalid entry count, skip or terminate
            console.error("Invalid entry count encountered. Terminating or skipping block.");
            currentLineOffset++; // Attempt to move past the problematic line
            continue;
        }

        // Initialize structures for categorizing and accumulating values
        const primaryItems = [];
        const secondaryItems = [];
        const primaryKeys = [];
        const secondaryKeys = [];
        let baseValueSum = 0; // The sum of minimum required values

        // Iterate through each entry line for the current data set
        for (let i = 0; i < entryCount; i++) {
            const entryIndex = currentLineOffset + i + 1;
            if (entryIndex >= parsedData.length || !parsedData[entryIndex]) {
                console.error(`Missing data line at index ${entryIndex}.`);
                break; // Break if data is unexpectedly short
            }
            const processedEntry = parsedData[entryIndex].map(val => Number(val));

            // Validate parsed entry for expected number of elements
            if (processedEntry.length < 3 || processedEntry.some(isNaN)) {
                console.warn(`Skipping malformed entry at line ${entryIndex}.`);
                continue;
            }

            const key = processedEntry[0];
            const valA = processedEntry[1];
            const valB = processedEntry[2];

            // Classify entries based on their properties
            if (key === entryCount) {
                baseValueSum += valA; // Direct contribution to base sum
            } else if (valA > valB) {
                primaryItems.push(processedEntry);
                baseValueSum += valB;
                primaryKeys.push(key - 1); // Store adjusted key
            } else if (valA < valB) {
                // Transform and store in secondary category
                const transformedEntry = [entryCount - key, valB, valA];
                secondaryItems.push(transformedEntry);
                baseValueSum += valA;
                secondaryKeys.push(transformedEntry[0] - 1); // Store adjusted key
            } else {
                baseValueSum += valA; // valA === valB, direct contribution
            }
        }

        // Sort and deduplicate keys for both categories
        const getUniqueSortedKeys = (keyList) => {
            return Array.from(new Set(keyList)).sort((a, b) => a - b);
        };
        const uniquePrimaryKeys = getUniqueSortedKeys(primaryKeys);
        const uniqueSecondaryKeys = getUniqueSortedKeys(secondaryKeys);

        // Sort the item arrays based on their first element (key)
        primaryItems.sort((a, b) => a[0] - b[0]);
        secondaryItems.sort((a, b) => a[0] - b[0]);

        // Initialize structures for tracking slot capacities and current fills
        const primaryCategoryCapacities = [[], []]; // [capacity, current_fill]
        const secondaryCategoryCapacities = [[], []];

        // Create mappings from key values to their indices in the capacity arrays
        const primaryKeyToIndexMap = Array.from({ length: (uniquePrimaryKeys.length > 0 ? uniquePrimaryKeys[uniquePrimaryKeys.length - 1] : -1) + 2 }, () => -1);
        const secondaryKeyToIndexMap = Array.from({ length: (uniqueSecondaryKeys.length > 0 ? uniqueSecondaryKeys[uniqueSecondaryKeys.length - 1] : -1) + 2 }, () => -1);

        // Populate capacity structures and key-to-index maps
        const buildCapacityAndMap = (keys, capacityData, keyMap) => {
            let lastKey = -1;
            for (let k = 0; k < keys.length; k++) {
                const currentKey = keys[k];
                capacityData[0].push(currentKey - lastKey); // Calculate capacity
                capacityData[1].push(0);                      // Initialize fill count
                keyMap[currentKey] = k;                       // Store index mapping
                lastKey = currentKey;
            }
        };

        buildCapacityAndMap(uniquePrimaryKeys, primaryCategoryCapacities, primaryKeyToIndexMap);
        buildCapacityAndMap(uniqueSecondaryKeys, secondaryCategoryCapacities, secondaryKeyToIndexMap);

        let finalOptimizedValue = baseValueSum;

        // Process primary items to maximize gain
        finalOptimizedValue += manageCategorySlots(
            primaryItems,
            primaryKeyToIndexMap,
            primaryCategoryCapacities
        );

        // Process secondary items to maximize gain
        finalOptimizedValue += manageCategorySlots(
            secondaryItems,
            secondaryKeyToIndexMap,
            secondaryCategoryCapacities
        );

        // Display the calculated result for the current data set
        console.log(finalOptimizedValue);

        // Advance the offset to the next data set's N value
        currentLineOffset += entryCount + 1;
    }
}

// Entry point for execution, reads input from stdin
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));