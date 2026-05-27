'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to find the maximum value in an array.
// This function is present in the original code but not utilized by the main logic.
const findMaximum = (inputArray) => {
    let currentIdx = inputArray.length;
    let highestValue = -Infinity; // Initialize with the smallest possible number
    while (currentIdx--) { // Iterate backwards through the array
        if (inputArray[currentIdx] > highestValue) {
            highestValue = inputArray[currentIdx]; // Update if a larger element is found
        }
    }
    return highestValue;
};

// Helper function to find the minimum value in an array.
// This function is also present in the original code but not utilized by the main logic.
const findMinimum = (inputArray) => {
    let currentIdx = inputArray.length;
    let lowestValue = Infinity; // Initialize with the largest possible number
    while (currentIdx--) { // Loop from the end to the beginning
        if (inputArray[currentIdx] < lowestValue) {
            lowestValue = inputArray[currentIdx]; // Update if a smaller element is found
        }
    }
    return lowestValue;
};

// Main function to process the input and solve the knapsack-like problem.
const ProcessInputData = (rawData) => {
    // Split the entire input string by newline characters to get individual lines.
    rawData = rawData.split("\n");

    // Parse the first line to extract the number of items (N) and the weight capacity (W).
    const firstLineParts = rawData[0].split(" ");
    const itemCount = parseInt(firstLineParts[0], 10); // N: total number of items
    const capacityLimit = parseInt(firstLineParts[1], 10); // W: maximum weight capacity

    // Initialize arrays to store weights and values for each item.
    let weightsArray = new Array(itemCount);
    let valuesArray = new Array(itemCount);

    // Populate the weights and values arrays from the subsequent input lines.
    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        const currentItemLine = rawData[itemIndex + 1].split(" ").map(Number);
        weightsArray[itemIndex] = currentItemLine[0]; // Weight of the current item
        valuesArray[itemIndex] = currentItemLine[1]; // Value of the current item
    }

    // Define the maximum possible sum of values, used for DP table dimensions.
    // This constant is typically derived from problem constraints (e.g., max N * max V_i).
    const maxValueSum = 100000;

    // Initialize the dynamic programming table.
    // dpTable[i][j] will store the minimum weight to achieve a value sum of 'j' using the first 'i' items.
    // The table size is (itemCount + 1) rows by (maxValueSum + 1) columns.
    let dpTable = new Array(itemCount + 1);

    // Initialize the first row of the DP table (representing 0 items).
    // dpTable[0][0] = 0 (0 weight for 0 value sum with no items).
    // All other dpTable[0][j] = Infinity (impossible to get value sum 'j' with no items).
    dpTable[0] = new Array(maxValueSum + 1).fill(Infinity);
    dpTable[0][0] = 0;

    // Fill the DP table using a bottom-up approach.
    // Iterate through each item, from 0 up to itemCount (inclusive, to match original loop structure).
    // When itemIdx == itemCount, valuesArray[itemIdx] and weightsArray[itemIdx] will be undefined.
    // The conditional check inside the inner loop handles this gracefully, preventing errors.
    for (let itemIdx = 0; itemIdx <= itemCount; itemIdx++) {
        // Create a new row for the current item, initially copying the previous row.
        // This represents the option of NOT taking the current item.
        // For itemIdx = itemCount, this creates dpTable[itemCount + 1] as a copy of dpTable[itemCount],
        // which is consistent with the original code's behavior.
        dpTable[itemIdx + 1] = dpTable[itemIdx].concat();

        // Iterate through all possible value sums.
        for (let currentValSum = 0; currentValSum <= maxValueSum; currentValSum++) {
            // Check if the current item's value can be subtracted from the current value sum.
            // This condition also implicitly handles the case where itemIdx == itemCount,
            // as valuesArray[itemIdx] would be undefined, making `currentValSum - undefined` result in NaN,
            // and `NaN >= 0` evaluates to false, thus skipping the update for the "undefined item".
            if (currentValSum - valuesArray[itemIdx] >= 0) {
                // Calculate the weight if we choose to TAKE the current item:
                // (minimum weight to achieve `currentValSum - valuesArray[itemIdx]` using items up to `itemIdx-1`)
                // + (weight of the current item).
                const weightIfTaken = dpTable[itemIdx][currentValSum - valuesArray[itemIdx]] + weightsArray[itemIdx];

                // Update dpTable[itemIdx + 1][currentValSum] with the minimum of:
                // 1. The value already present (representing NOT taking the current item, copied from dpTable[itemIdx]).
                // 2. The weight calculated if we TAKE the current item.
                dpTable[itemIdx + 1][currentValSum] = Math.min(dpTable[itemIdx + 1][currentValSum], weightIfTaken);
            }
        }
    }

    // After filling the DP table, find the maximum value sum that can be achieved
    // without exceeding the `capacityLimit`.
    let resultValueSum = maxValueSum;
    // Iterate backwards from the maximum possible value sum.
    // The loop condition `dpTable[itemCount][resultValueSum--] > capacityLimit`
    // checks if the minimum weight required for `resultValueSum` exceeds `capacityLimit`.
    // `resultValueSum--` decrements `resultValueSum` AFTER each check.
    // The loop continues as long as the weight for the current `resultValueSum` is too high.
    while (dpTable[itemCount][resultValueSum--] > capacityLimit);

    // When the loop terminates, `resultValueSum` has been decremented one extra time.
    // So, `resultValueSum + 1` gives the highest value sum whose minimum required weight
    // is less than or equal to `capacityLimit`.
    console.log(resultValueSum + 1);
};

// Read input from standard input, trim any leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
