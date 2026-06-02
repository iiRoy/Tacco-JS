function ProcessInput(rawData) {
    // Process raw input data: trim, split by newline, then split each line by space.
    rawData = rawData.trim().split("\n").map(function(lineStr) { return lineStr.split(" "); });

    // Initialize line offset for reading input blocks.
    let lineOffset = 1;

    // Helper function to find the lower bound (first element >= targetValue) in a sorted array.
    const findInsertionPoint = (sortedArray, targetValue) => {
        let startIndex = 0, endIndex = sortedArray.length - 1, midPoint;
        while (startIndex <= endIndex) {
            midPoint = 0 | (startIndex + endIndex) / 2; // Integer division
            if (sortedArray[midPoint] < targetValue) {
                startIndex = midPoint + 1;
            } else {
                endIndex = midPoint - 1;
            }
        }
        return startIndex;
    };

    // Main loop to process multiple test cases.
    while (true) {
        // Check if there's more input data.
        if (rawData[lineOffset] == null) {
            break;
        }

        // Parse the number of entries for the current test case.
        let numEntries = parseInt(rawData[lineOffset][0], 10);

        // Arrays to categorize entries based on conditions.
        let firstCategoryItems = [];
        let secondCategoryItems = [];

        // Variables for accumulating base sum and tracking remaining slots.
        let baseSum = 0;
        let remainingSlots = numEntries;

        // Loop through each entry of the current test case.
        for (let idx = 0; idx < numEntries; idx++) {
            // Parse the current line's values as integers.
            let currentEntry = rawData[lineOffset + idx + 1].map(elementVal => parseInt(elementVal, 10));
            console.log; // This line in the original code does nothing, preserving its behavior.

            // Categorize entries and update baseSum and remainingSlots.
            if (currentEntry[0] === numEntries) {
                baseSum += currentEntry[1];
                remainingSlots--;
            } else if (currentEntry[1] > currentEntry[2]) {
                firstCategoryItems.push(currentEntry);
                baseSum += currentEntry[2];
            } else if (currentEntry[1] < currentEntry[2]) {
                // Transform the entry for the second category.
                currentEntry = [numEntries - currentEntry[0], currentEntry[2], currentEntry[1]];
                secondCategoryItems.push(currentEntry);
                baseSum += currentEntry[2];
            } else {
                baseSum += currentEntry[1];
                remainingSlots--;
            }
        }

        // Sort the categorized arrays based on their first element.
        firstCategoryItems.sort((valA, valB) => valA[0] - valB[0]);
        secondCategoryItems.sort((valA, valB) => valA[0] - valB[0]);

        // Initialize the final result with the accumulated base sum.
        let finalResult = baseSum;

        // Process first category items to maximize the sum.
        let slotOccupancy = Array.from({length: remainingSlots}, () => false); // Initialize slot occupancy map.
        let optimalPosition;
        let valueBoost;

        for (let idx = 0; idx < firstCategoryItems.length; idx++) {
            optimalPosition = firstCategoryItems[idx][0] - 1;
            valueBoost = firstCategoryItems[idx][1] - firstCategoryItems[idx][2];

            // Find the first available slot backwards from the optimal position.
            while (slotOccupancy[optimalPosition] !== false) {
                optimalPosition--;
            }

            // If a valid slot is found, mark it as occupied and add the boost.
            if (optimalPosition >= 0) {
                slotOccupancy[optimalPosition] = true;
                finalResult += valueBoost;
            }
        }
        // console.log(slotOccupancy); // Original commented-out debug line.

        // Reset slot occupancy for processing the second category items.
        slotOccupancy = Array.from({length: remainingSlots}, () => false);

        // Process second category items to maximize the sum.
        for (let idx = 0; idx < secondCategoryItems.length; idx++) {
            optimalPosition = secondCategoryItems[idx][0] - 1;
            valueBoost = secondCategoryItems[idx][1] - secondCategoryItems[idx][2];

            // Find the first available slot backwards from the optimal position.
            while (slotOccupancy[optimalPosition] !== false) {
                optimalPosition--;
            }

            // If a valid slot is found, mark it as occupied and add the boost.
            if (optimalPosition >= 0) {
                slotOccupancy[optimalPosition] = true;
                finalResult += valueBoost;
            }
        }
        // console.log(slotOccupancy); // Original commented-out debug line.

        // Output the final calculated result for the current test case.
        console.log(finalResult);

        // Advance the line offset to the next test case.
        lineOffset += numEntries + 1;
    }
}

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
