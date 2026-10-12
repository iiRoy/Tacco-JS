// This script processes input data to calculate a specific sum based on item properties.
function processInputData(rawData) {
    // Parse the raw input string into an array of arrays, splitting by newlines and spaces.
    let parsedLines = rawData.trim().split("\n").map(function(lineStr) { return lineStr.split(" "); });

    // Initialize the starting line index for processing each test case.
    let currentLineIndex = 1;

    // Helper function to find the lower bound index in a sorted array.
    // This is equivalent to `std::lower_bound` in C++.
    const findInsertionPoint = (sortedArray, targetValue) => {
        let startIndex = 0;
        let endIndex = sortedArray.length - 1;
        let midPoint;

        // Binary search loop.
        while (startIndex <= endIndex) {
            midPoint = Math.floor((startIndex + endIndex) / 2); // Using Math.floor for integer division.
            if (sortedArray[midPoint] < targetValue) {
                startIndex = midPoint + 1;
            } else {
                endIndex = midPoint - 1;
            }
        }
        return startIndex; // Returns the index where targetValue would be inserted to maintain order.
    };

    // Main loop to process multiple test cases from the input.
    while (true) {
        // Check if there are more lines to process for a new test case.
        if (parsedLines[currentLineIndex] === undefined) {
            break; // Exit loop if no more data.
        }

        // Read the number of elements for the current test case.
        let numElements = parseInt(parsedLines[currentLineIndex][0], 10);

        // Arrays to store categorized items based on their properties.
        let itemsGroupA = [];
        let itemsGroupB = [];

        // Lists to store K-values (minus 1) for each group, before sorting and filtering.
        let uniqueKeysA = [];
        let uniqueKeysB = [];

        // Variables for accumulating the base sum and tracking effective item count.
        let baseSumValue = 0;
        let effectiveItemCount = numElements; // This variable is declared but not used after initialization in the original.

        // Loop through each item's data for the current test case.
        for (let itemIdx = 0; itemIdx < numElements; itemIdx++) {
            // Parse the current line into an array of integers.
            let currentEntry = parsedLines[currentLineIndex + itemIdx + 1].map(val => parseInt(val, 10));

            // Categorize items based on their K, L, R values (currentEntry[0], currentEntry[1], currentEntry[2]).
            if (currentEntry[0] === numElements) {
                // Special case: K equals N. Add L to base sum and decrement effective count.
                baseSumValue += currentEntry[1];
                effectiveItemCount--;
            } else if (currentEntry[1] > currentEntry[2]) {
                // Case 1: L > R. Add to Group A.
                itemsGroupA.push(currentEntry);
                baseSumValue += currentEntry[2]; // Add R to base sum.
                uniqueKeysA.push(currentEntry[0] - 1); // Store K-1.
            } else if (currentEntry[1] < currentEntry[2]) {
                // Case 2: L < R. Transform and add to Group B.
                // Transformation: K becomes N-K, L becomes R, R becomes L.
                let transformedEntry = [numElements - currentEntry[0], currentEntry[2], currentEntry[1]];
                itemsGroupB.push(transformedEntry);
                baseSumValue += transformedEntry[2]; // Add the new R (original L) to base sum.
                uniqueKeysB.push(transformedEntry[0] - 1); // Store transformed K-1.
            } else {
                // Case 3: L == R. Add L (or R) to base sum and decrement effective count.
                baseSumValue += currentEntry[1];
                effectiveItemCount--;
            }
        }

        // Sort the item groups by their first element (K-value).
        itemsGroupA.sort((a, b) => a[0] - b[0]);
        itemsGroupB.sort((a, b) => a[0] - b[0]);

        // Sort unique keys and remove duplicates to get distinct, sorted keys.
        let distinctKeysA = uniqueKeysA.sort((a, b) => a - b).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
        let distinctKeysB = uniqueKeysB.sort((a, b) => a - b).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        // Initialize capacity tracking structures for each group.
        // capacityData[0] stores available slots, capacityData[1] stores used slots.
        let capacityDataA = [[], []];
        let capacityDataB = [[], []];

        // Maps K-values to their corresponding index in the distinctKeys list.
        // Handle empty distinctKeys list to avoid accessing index -1.
        let keyToIndexMapA = Array.from({length: (distinctKeysA.length > 0 ? distinctKeysA[distinctKeysA.length - 1] + 1 : 0)}, () => 0);
        let keyToIndexMapB = Array.from({length: (distinctKeysB.length > 0 ? distinctKeysB[distinctKeysB.length - 1] + 1 : 0)}, () => 0);

        // Populate capacity data and index maps for Group A.
        let lastProcessedKeyA = -1;
        for (let kIndexA = 0; kIndexA < distinctKeysA.length; kIndexA++) {
            capacityDataA[0].push(distinctKeysA[kIndexA] - lastProcessedKeyA); // Available slots based on key difference
            capacityDataA[1].push(0); // Used slots, initialized to 0
            keyToIndexMapA[distinctKeysA[kIndexA]] = kIndexA;
            lastProcessedKeyA = distinctKeysA[kIndexA];
        }

        // Populate capacity data and index maps for Group B.
        let lastProcessedKeyB = -1;
        for (let kIndexB = 0; kIndexB < distinctKeysB.length; kIndexB++) {
            capacityDataB[0].push(distinctKeysB[kIndexB] - lastProcessedKeyB); // Available slots based on key difference
            capacityDataB[1].push(0); // Used slots, initialized to 0
            keyToIndexMapB[distinctKeysB[kIndexB]] = kIndexB;
            lastProcessedKeyB = distinctKeysB[kIndexB];
        }

        // Initialize the final answer with the base sum.
        let finalResult = baseSumValue;
        let currentCapacityIndex; // Variable to hold the index in capacityData.

        // Process items in Group A to maximize the sum.
        for (let itemIndexA = 0; itemIndexA < itemsGroupA.length; itemIndexA++) {
            let gainAmount = itemsGroupA[itemIndexA][1] - itemsGroupA[itemIndexA][2]; // L - R
            currentCapacityIndex = keyToIndexMapA[itemsGroupA[itemIndexA][0] - 1]; // Get index for K-1

            // Find the first available slot by moving backwards if current slot is full.
            while (capacityDataA[1][currentCapacityIndex] === capacityDataA[0][currentCapacityIndex] && currentCapacityIndex >= 0) {
                currentCapacityIndex--;
            }

            // If an available slot is found, use it and add the gain to the total.
            if (currentCapacityIndex >= 0) {
                capacityDataA[1][currentCapacityIndex]++;
                finalResult += gainAmount;
            }
        }

        // Process items in Group B to maximize the sum.
        for (let itemIndexB = 0; itemIndexB < itemsGroupB.length; itemIndexB++) {
            let gainAmount = itemsGroupB[itemIndexB][1] - itemsGroupB[itemIndexB][2]; // Transformed L - Transformed R
            currentCapacityIndex = keyToIndexMapB[itemsGroupB[itemIndexB][0] - 1]; // Get index for transformed K-1

            // Find the first available slot by moving backwards if current slot is full.
            while (capacityDataB[1][currentCapacityIndex] === capacityDataB[0][currentCapacityIndex] && currentCapacityIndex >= 0) {
                currentCapacityIndex--;
            }

            // If an available slot is found, use it and add the gain to the total.
            if (currentCapacityIndex >= 0) {
                capacityDataB[1][currentCapacityIndex]++;
                finalResult += gainAmount;
            }
        }

        // Output the calculated final result for the current test case.
        console.log(finalResult);

        // Move to the start of the next test case in the input.
        currentLineIndex += numElements + 1;
    }
}

// Read input from stdin and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
