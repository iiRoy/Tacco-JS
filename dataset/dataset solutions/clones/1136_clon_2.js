function processInput(rawInputData) {
    // Split the raw input string into individual lines and remove any empty lines.
    const parsedLines = rawInputData.split('\n').filter(lineContent => lineContent.length > 0);

    // Extract the first line, which contains the total number of items and the knapsack's maximum weight capacity.
    const [itemCount, capacityLimit] = parsedLines.shift().split(' ').map(Number);

    // Process the remaining lines to create an array of available items.
    // Each item is represented as an array: `[value, weight]`.
    const availableItems = parsedLines.map(lineStr => {
        return lineStr.split(' ').map(Number);
    });

    // Compute the maximum possible value that can be achieved within the given capacity limit.
    const finalValueResult = calculateOptimalValue(availableItems, capacityLimit);

    // Output the maximum value found to the console.
    console.log(finalValueResult[0]);
}



function calculateOptimalValue(availableItems, capacityLimit) {
    // Initialize a dynamic programming table. `currentKnapsackStates[w]` will store
    // `[total_value, total_weight]` for a knapsack with a maximum weight capacity of `w`.
    // Using `fill([0, 0])` creates references to the same array, but this is acceptable
    // because subsequent assignments to `currentKnapsackStates[currentWeightCapacity]`
    // always replace the reference with a new array or a slice.
    const currentKnapsackStates = new Array(capacityLimit + 1).fill([0, 0]);
    let previousKnapsackStates = []; // This array will hold the states from the previous item's iteration.

    // Iterate through each item in the `availableItems` list.
    for (let itemIndex = 0, totalItems = availableItems.length; itemIndex < totalItems; ++itemIndex) {
        // Before processing the current item, create a copy of the `currentKnapsackStates`.
        // This `previousKnapsackStates` ensures that when we consider `availableItems[itemIndex]`,
        // we are combining it with states that *do not* yet include `availableItems[itemIndex]`.
        previousKnapsackStates = currentKnapsackStates.slice();

        // Extract the value and weight of the current item for clarity and repeated use.
        const currentItemValue = availableItems[itemIndex][0];
        const currentItemWeight = availableItems[itemIndex][1];

        // Iterate through all possible knapsack weight capacities, from 0 up to the `capacityLimit`.
        for (let currentWeightCapacity = 0; currentWeightCapacity <= capacityLimit; currentWeightCapacity++) {
            // If the current capacity is zero, the knapsack can hold nothing, so its value and weight are both zero.
            if (currentWeightCapacity === 0) {
                currentKnapsackStates[currentWeightCapacity] = [0, 0];
            } else {
                // Option 1: Consider taking only the current item.
                // If the `currentItemWeight` fits within the `currentWeightCapacity`
                // AND the `currentItemValue` is greater than the current best value already stored
                // for this `currentWeightCapacity`, then update the state to include just this item.
                if (currentWeightCapacity >= currentItemWeight && currentKnapsackStates[currentWeightCapacity][0] < currentItemValue) {
                    currentKnapsackStates[currentWeightCapacity] = availableItems[itemIndex].slice();
                }

                // Option 2: Consider combining the current item with an optimal state from a smaller knapsack.
                // `referencedState` refers to the optimal `[value, weight]` for a knapsack with capacity
                // `currentWeightCapacity - currentItemWeight` *before* considering the current item.
                const referencedState = previousKnapsackStates[currentWeightCapacity - currentItemWeight];

                // Check if a valid `referencedState` exists (i.e., `currentWeightCapacity - currentItemWeight` was a non-negative capacity)
                // AND if the combined weight of `referencedState` plus the `currentItemWeight` does not exceed
                // the `currentWeightCapacity`.
                if (referencedState !== undefined && currentWeightCapacity >= referencedState[1] + currentItemWeight) {
                    // Calculate the new total value and total weight if we include the current item
                    // with the `referencedState`.
                    const combinedValueWeight = [referencedState[0] + currentItemValue, referencedState[1] + currentItemWeight];

                    // If this new combination yields a higher value than what's currently stored
                    // for `currentKnapsackStates[currentWeightCapacity]`, then update the state.
                    if (currentKnapsackStates[currentWeightCapacity][0] < combinedValueWeight[0]) {
                        currentKnapsackStates[currentWeightCapacity] = combinedValueWeight.slice();
                    }
                }
            }
        }
    }
    // After iterating through all items and all capacities, the entry at `capacityLimit`
    // in `currentKnapsackStates` will contain the maximum value and corresponding weight
    // for the knapsack with the given capacity.
    return currentKnapsackStates[capacityLimit];
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
