function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const parseNumbersFromString = (lineString) => lineString.split(" ").map(Number);

    const [initialTotalElements, initialWindowSize] = parseNumbersFromString(inputLines[0]);
    let numericValues = parseNumbersFromString(inputLines[1]);

    // The 'minus' variable in the original code counts negatives in the initial array.
    // This count is used for specific index checks later, even after array modifications.
    const initialNegativeCount = numericValues.filter(val => val < 0).length;

    let adjustedTotalElements = initialTotalElements;
    let adjustedWindowSize = initialWindowSize;

    // Define a constant for the maximum possible distance, as used for initialization
    const MAX_POSSIBLE_DISTANCE = Math.pow(10, 9) + 7;
    let minTravelDistance = MAX_POSSIBLE_DISTANCE;

    // Check for and handle the presence of zero in the array
    const zeroPosition = numericValues.indexOf(0);
    if (zeroPosition !== -1) {
        // If zero is present, remove it and adjust counts
        numericValues = numericValues.filter(value => value !== 0);
        adjustedTotalElements--;
        adjustedWindowSize--;
    }

    // Helper function to calculate the cost when a window spans across zero
    const calculateCrossZeroPathCost = (startPoint, endPoint) => {
        const absStart = Math.abs(startPoint);
        const absEnd = Math.abs(endPoint);
        // Two options: go to start, then end, then back to origin (if start is further)
        // or go to end, then start, then back to origin (if end is further)
        return Math.min(absStart * 2 + absEnd, absStart + absEnd * 2);
    };

    // Handle edge case: no elements left after zero removal
    if (numericValues.length === 0) {
        minTravelDistance = 0;
    }
    // Handle specific case where adjusted total elements is 2
    // This corresponds to the 'else' branch in the original code's main conditional.
    else if (adjustedTotalElements === 2) {
        // Replicating the exact original behavior for this specific 'n=2' case.
        minTravelDistance = Math.min(Math.abs(numericValues[0]), numericValues[1]);
    }
    // Main logic for all other scenarios
    else {
        // Iterate through all possible starting indices for a window of 'adjustedWindowSize'
        for (let currentIdx = 0; currentIdx <= adjustedTotalElements - adjustedWindowSize; currentIdx++) {
            const windowStartValue = numericValues[currentIdx];
            const windowEndValue = numericValues[currentIdx + adjustedWindowSize - 1];

            // Condition 1: The current window spans across zero (contains both negative and positive numbers)
            if (windowStartValue < 0 && windowEndValue > 0) {
                minTravelDistance = Math.min(minTravelDistance, calculateCrossZeroPathCost(windowStartValue, windowEndValue));
            }
            // Condition 2: The window is entirely negative (or ends at the last negative number)
            // This relies on 'initialNegativeCount' from the original array for its index logic.
            else if (currentIdx === initialNegativeCount - adjustedWindowSize) {
                minTravelDistance = Math.min(minTravelDistance, Math.abs(windowEndValue));
            }
            // Condition 3: The window is entirely positive (or starts at the first positive number)
            // Similar to Condition 2, relies on 'initialNegativeCount' for its index logic.
            else if (currentIdx === initialNegativeCount) {
                minTravelDistance = Math.min(minTravelDistance, windowEndValue);
            }
        }
    }

    console.log(minTravelDistance.toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
