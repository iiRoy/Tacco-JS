var outputFunc = console.log;

if (typeof process !== "undefined") {
    let rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (dataSegment) {
        rawData += dataSegment;
    });
    process.stdin.on('end', function () {
        const inputLines = rawData.split("\n");
        processInputData(inputLines);
    });
}

function processInputData(dataRows) {
    // Process each line of input data.
    const parsedRows = dataRows.map(function (currentRow) {
        const parts = currentRow.split(" ");
        if (parts.length >= 2) {
            // If a line contains multiple space-separated values, parse them as numbers.
            return parts.map(function (itemValue) {
                return Number(itemValue);
            });
        } else {
            // Otherwise, parse the single value on the line as a number.
            return Number(currentRow);
        }
    });

    // Extract configuration parameters from the first processed line.
    let configLine = parsedRows.shift();
    let itemCount = configLine.shift();
    let capacityLimit = configLine.shift();
    let itemDetails = parsedRows; // The remaining lines represent the items.

    // This variable is declared but not used further, maintaining original structure.
    let loopCounter = itemCount;

    // This object is declared but not used, maintaining original structure.
    let unusedMap = {};

    // Call the core function to compute the maximum value.
    calculateMaxValue(itemDetails, capacityLimit);
}

function calculateMaxValue(availableItems, maxWeight) {
    let currentValues = {}; // Stores the maximum values for each weight for the current item being processed.
    let previousValues = {}; // Stores the maximum values for each weight from the previous item's processing.

    // Iterate through each item available to be put into the knapsack.
    for (let itemIndex = 0; itemIndex < availableItems.length; itemIndex++) {
        const itemValue = availableItems[itemIndex][0]; // The value of the current item.
        const itemWeight = availableItems[itemIndex][1]; // The weight of the current item.

        previousValues = currentValues; // Shift current state to previous state.
        currentValues = {}; // Initialize current state for the new item.

        // Iterate through all possible weights from the previous state.
        for (let currentWeight in previousValues) {
            currentWeight = Number(currentWeight); // Ensure the weight key is treated as a number.

            // If the value for 'currentWeight' in the previous state is better or new, update 'currentValues'.
            if (currentValues[currentWeight] <= previousValues[currentWeight] || !currentValues[currentWeight]) {
                currentValues[currentWeight] = previousValues[currentWeight];
            }

            // Check if adding the current item's weight to 'currentWeight' exceeds the 'maxWeight'.
            if (currentWeight + itemWeight <= maxWeight) {
                // If adding the current item yields a better value for the new total weight, update.
                // This comparison ensures we take the maximum value for the given weight.
                if ((previousValues[currentWeight + itemWeight] <= previousValues[currentWeight] + itemValue || !previousValues[currentWeight + itemWeight]) &&
                    (currentValues[currentWeight + itemWeight] <= previousValues[currentWeight] + itemValue || !currentValues[currentWeight + itemWeight])) {
                    currentValues[currentWeight + itemWeight] = previousValues[currentWeight] + itemValue;
                }
            } else {
                // If adding the current item exceeds the maximum weight,
                // further iterations for larger 'currentWeight' will also exceed it, so we can break.
                break;
            }
        }

        // Consider the case where the current item is added by itself (or replaces a less valuable item at its weight).
        if ((previousValues[itemWeight] <= itemValue || !previousValues[itemWeight]) &&
            (currentValues[itemWeight] <= itemValue || !currentValues[itemWeight])) {
            currentValues[itemWeight] = itemValue;
        }
    }

    // After processing all items, find the maximum value achievable within the 'maxWeight'.
    // Iterate downwards from 'maxWeight' to find the largest value associated with any weight.
    for (let weightIterator = maxWeight; weightIterator > 0; weightIterator--) {
        if (!!currentValues[weightIterator]) { // If a value exists for this specific weight.
            outputFunc(currentValues[weightIterator]); // Output the highest value found.
            break; // Exit the loop as we've found the optimal solution (highest value for highest possible weight).
        }
    }
}
