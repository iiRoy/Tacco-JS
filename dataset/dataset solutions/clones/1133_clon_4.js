// Global setup for Node.js input
if (typeof process !== "undefined") {
    let rawInputData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawInputData += chunk;
    });
    process.stdin.on('end', () => {
        const inputLines = rawInputData.split("\n");
        processInputData(inputLines);
    });
}

// Main processing function
function processInputData(sourceLines) {
    const parsedNumericalData = sourceLines.map(lineContent => {
        const parts = lineContent.split(" ");
        if (parts.length >= 2) {
            return parts.map(Number);
        } else {
            return Number(lineContent);
        }
    });

    // Extract configuration parameters from the first line
    const configurationParameters = parsedNumericalData.shift();
    const [totalItems, maxWeightCapacity] = configurationParameters;

    // Remaining data are the item details
    const itemSpecifications = parsedNumericalData;

    // Execute the core knapsack calculation
    determineOptimalValue(itemSpecifications, maxWeightCapacity);
}

// Core knapsack calculation function
function determineOptimalValue(availableItems, maximumCapacity) {
    // Initialize a dynamic programming array where dpArray[w] stores the maximum
    // value that can be obtained with a weight capacity of 'w'.
    // All values are initialized to 0.
    const dpArray = Array(maximumCapacity + 1).fill(0);

    // Iterate through each item in the provided list of available items
    availableItems.forEach(currentObject => {
        const [objectValue, objectWeight] = currentObject;

        // Skip items with invalid weight (e.g., from empty input lines)
        if (isNaN(objectWeight) || objectWeight <= 0) {
            return;
        }

        // For each item, iterate through the possible weights from maximumCapacity
        // down to the current item's weight. This reverse iteration ensures that
        // each item is considered only once (0/1 Knapsack problem).
        for (let currentWeightLimit = maximumCapacity; currentWeightLimit >= objectWeight; currentWeightLimit--) {
            // Update the dpArray:
            // dpArray[currentWeightLimit] (option 1: don't include the current item)
            // dpArray[currentWeightLimit - objectWeight] + objectValue (option 2: include the current item)
            // We take the maximum of these two options.
            dpArray[currentWeightLimit] = Math.max(
                dpArray[currentWeightLimit],
                dpArray[currentWeightLimit - objectWeight] + objectValue
            );
        }
    });

    // The problem asks for the maximum value that can be obtained for any weight
    // up to the maximumCapacity. This is equivalent to finding the maximum value
    // within the dpArray.
    const highestAchievableValue = Math.max(...dpArray);

    // Output the final result
    console.log(highestAchievableValue);
}
