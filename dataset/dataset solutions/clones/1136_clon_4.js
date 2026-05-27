function processInputAndSolve(inputString) {
    const inputLines = inputString.split('\n').filter(lineContent => lineContent.length > 0);
    const [itemCount, maximumCapacity] = inputLines.shift().split(' ').map(Number);
    const itemData = inputLines.map(lineContent => lineContent.split(' ').map(Number));

    const finalResult = calculateOptimalValue(itemData, maximumCapacity);
    console.log(finalResult[0]);
}

function calculateOptimalValue(availableItems, capacityLimit) {
    const totalItems = availableItems.length;
    // dpGrid[i][j] stores [total_value, total_weight_used] for the first 'i' items with capacity 'j'.
    // This explicitly uses a 2D array for dynamic programming states.
    const dpGrid = Array.from({ length: totalItems + 1 }, () =>
        Array.from({ length: capacityLimit + 1 }, () => [0, 0])
    );

    // Iterate through each item, starting from the first (index 1 in dpGrid corresponds to the first item)
    for (let itemIndex = 1; itemIndex <= totalItems; itemIndex++) {
        const currentItemDetails = availableItems[itemIndex - 1]; // Adjust for 0-indexed input array
        const currentItemVal = currentItemDetails[0];
        const currentItemWt = currentItemDetails[1];

        // Iterate through each possible capacity from 0 up to the capacity limit
        for (let currentCapacity = 0; currentCapacity <= capacityLimit; currentCapacity++) {
            // Base case: A capacity of 0 always yields [0, 0] (no value, no weight used)
            if (currentCapacity === 0) {
                dpGrid[itemIndex][currentCapacity] = [0, 0];
                continue;
            }

            // Initialize the best option for the current state (itemIndex, currentCapacity)
            // This initially takes the value from not including the current item,
            // which is the optimal solution for the previous item at the same capacity.
            let bestOptionForCurrentState = dpGrid[itemIndex - 1][currentCapacity];

            // Scenario 1: Consider taking only the current item if it fits and offers a better value
            // than the current `bestOptionForCurrentState` (which is from the previous item's row).
            if (currentCapacity >= currentItemWt && bestOptionForCurrentState[0] < currentItemVal) {
                bestOptionForCurrentState = currentItemDetails.slice();
            }

            // Scenario 2: Consider combining the current item with an optimal solution from a previous state.
            // This involves looking at the previous item's row with a reduced capacity.
            if (currentCapacity >= currentItemWt) { // Ensure there's enough capacity for the current item
                const previousStateResult = dpGrid[itemIndex - 1][currentCapacity - currentItemWt];
                
                // Check if the combined weight of the previous solution and the current item fits within currentCapacity.
                if (currentCapacity >= previousStateResult[1] + currentItemWt) {
                    const combinedResult = [
                        previousStateResult[0] + currentItemVal,
                        previousStateResult[1] + currentItemWt
                    ];
                    // If this combined result offers a higher value, update `bestOptionForCurrentState`.
                    if (bestOptionForCurrentState[0] < combinedResult[0]) {
                        bestOptionForCurrentState = combinedResult.slice();
                    }
                }
            }
            // Assign the determined best option to the current cell in the DP grid.
            dpGrid[itemIndex][currentCapacity] = bestOptionForCurrentState;
        }
    }

    // The final result is the optimal value and weight for all items and the maximum capacity.
    return dpGrid[totalItems][capacityLimit];
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
