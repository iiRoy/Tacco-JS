'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// The original 'max' and 'min' utility functions were not utilized by the 'Main' logic,
// thus they have been removed as redundant code in this Type III clone.

const Main = (rawDataInput) => {
    const inputLines = rawDataInput.split("\n");

    const firstLineData = inputLines[0].split(" ");
    const numItems = parseInt(firstLineData[0], 10); // N
    const capacityWeight = parseInt(firstLineData[1], 10); // W

    const itemWeights = new Array(numItems);
    const itemValues = new Array(numItems);

    // Parse and store the weights and values for each item
    for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
        const currentItemLine = inputLines[itemIdx + 1].split(" ").map(Number);
        itemWeights[itemIdx] = currentItemLine[0];
        itemValues[itemIdx] = currentItemLine[1];
    }

    const maxPossibleValue = 100000; // This constant defines the upper bound for total value

    // Initialize a 2D DP table: minWeightForValue[i][j] stores the minimum weight
    // required to achieve a total value of 'j' using the first 'i' items.
    const minWeightForValue = new Array(numItems + 1);

    // Base case: For 0 items (row 0), value 0 requires 0 weight.
    // All other values are impossible (represented by Infinity weight).
    minWeightForValue[0] = new Array(maxPossibleValue + 1).fill(Infinity);
    minWeightForValue[0][0] = 0;

    // Populate the DP table iteratively
    // 'currentItemIndex' refers to the item being considered (from 0 to numItems-1)
    // 'minWeightForValue[currentItemIndex]' represents the state before considering this item.
    // 'minWeightForValue[currentItemIndex + 1]' represents the state after considering this item.
    for (let currentItemIndex = 0; currentItemIndex < numItems; currentItemIndex++) {
        // Start the next row (state after considering current item) as a copy of the previous row.
        // This handles the case where the current item is NOT taken.
        minWeightForValue[currentItemIndex + 1] = Array.from(minWeightForValue[currentItemIndex]);

        const weightOfCurrentItem = itemWeights[currentItemIndex];
        const valueOfCurrentItem = itemValues[currentItemIndex];

        // Iterate through all possible value sums to consider taking the current item
        for (let currentTotalValue = 0; currentTotalValue <= maxPossibleValue; currentTotalValue++) {
            // Check if it's possible to achieve 'currentTotalValue' by including the 'currentItemIndex' item.
            // This means we need to have achieved 'currentTotalValue - valueOfCurrentItem' using previous items.
            if (currentTotalValue >= valueOfCurrentItem) {
                const previousValueRequired = currentTotalValue - valueOfCurrentItem;
                const weightToAchievePreviousValue = minWeightForValue[currentItemIndex][previousValueRequired];

                // Only proceed if the 'previousValueRequired' was actually achievable with previous items.
                if (weightToAchievePreviousValue !== Infinity) {
                    const totalWeightIfTakingCurrentItem = weightToAchievePreviousValue + weightOfCurrentItem;
                    
                    // Update the minimum weight for 'currentTotalValue' in the current row (after considering item).
                    // Compare the weight if NOT taking the item (already in minWeightForValue[currentItemIndex + 1])
                    // with the weight if TAKING the item.
                    minWeightForValue[currentItemIndex + 1][currentTotalValue] = Math.min(
                        minWeightForValue[currentItemIndex + 1][currentTotalValue],
                        totalWeightIfTakingCurrentItem
                    );
                }
            }
        }
    }

    // Determine the maximum total value that can be achieved without exceeding the 'capacityWeight'.
    let maxAchievableValue = 0;
    // Iterate downwards from the maximum possible value to find the largest one that fits.
    for (let candidateValue = maxPossibleValue; candidateValue >= 0; candidateValue--) {
        // Check the final row of the DP table (after considering all 'numItems' items).
        if (minWeightForValue[numItems][candidateValue] <= capacityWeight) {
            maxAchievableValue = candidateValue;
            break; // Found the largest value that satisfies the weight constraint.
        }
    }
    console.log(maxAchievableValue);
};

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
