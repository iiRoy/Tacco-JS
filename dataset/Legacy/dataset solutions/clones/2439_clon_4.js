function Main(rawInput) {
    const lines = rawInput.trim().split('\n');
    const [paramLine, ...itemLines] = lines;
    const [itemCount, capacityLimit] = paramLine.split(' ').map(Number);

    // itemPairs will be modified later, so use 'let'
    let itemPairs = itemLines.map(line => line.split(' ').map(Number));
    // Preserve original sort order by item value (B)
    itemPairs.sort((a, b) => a[1] - b[1]);

    // Create a copy of itemPairs for DP calculation to avoid side effects during DP table construction.
    // The original itemPairs will be modified later for the 'lastOrder' logic.
    const dpItems = itemPairs.map(pair => [...pair]);

    // DP table construction using reduce (functional style).
    // dpGrid[i][j] will store the maximum value using the first 'i' items with capacity 'j'.
    const initialDpRow = Array(capacityLimit + 1).fill(0);
    const dpGrid = dpItems.reduce((accumulatorDpGrid, currentItem, itemIndex) => {
        const [currentWeight, currentValue] = currentItem;
        const previousDpRow = accumulatorDpGrid[itemIndex]; // Corresponds to dp[i] in original
        const nextDpRow = Array(capacityLimit + 1).fill(0); // Corresponds to dp[i+1] in original

        for (let capIdx = 0; capIdx <= capacityLimit; capIdx++) {
            if (currentWeight <= capIdx) {
                nextDpRow[capIdx] = Math.max(
                    previousDpRow[capIdx],
                    previousDpRow[capIdx - currentWeight] + currentValue
                );
            } else {
                nextDpRow[capIdx] = previousDpRow[capIdx];
            }
        }
        accumulatorDpGrid.push(nextDpRow);
        return accumulatorDpGrid;
    }, [initialDpRow]); // Start with dp[0]

    // Backtracking to find items chosen for dpGrid[itemCount][capacityLimit - 1].
    // Using a generator for a different control flow structure.
    function* generateChosenIndices(currentIdx, currentCap) {
        if (currentIdx === 0 || currentCap <= 0) {
            return;
        }

        const itemWeight = dpItems[currentIdx - 1][0];

        // If the value at the current state (with item currentIdx-1 considered)
        // is the same as the value without considering item currentIdx-1,
        // then item currentIdx-1 was not taken.
        if (dpGrid[currentIdx][currentCap] === dpGrid[currentIdx - 1][currentCap]) {
            yield* generateChosenIndices(currentIdx - 1, currentCap);
        } else {
            // Otherwise, item currentIdx-1 was taken.
            yield currentIdx - 1; // Yield the index of the chosen item
            yield* generateChosenIndices(currentIdx - 1, currentCap - itemWeight);
        }
    }

    const selectedIndicesForTMinus1 = [];
    for (const idx of generateChosenIndices(itemCount, capacityLimit - 1)) {
        selectedIndicesForTMinus1.push(idx);
    }

    // Sort indices in descending order to safely remove elements using splice.
    // Removing higher indices first prevents index shifts for subsequent removals.
    selectedIndicesForTMinus1.sort((a, b) => b - a);

    // Modify the original itemPairs array by removing the selected items.
    for (const indexToRemove of selectedIndicesForTMinus1) {
        itemPairs.splice(indexToRemove, 1);
    }

    // Calculate the final result.
    let finalAdditionalValue = 0;
    if (itemPairs.length > 0) {
        // The original code takes the LAST element of the MODIFIED itemPairs array
        // and adds its value to dp[N][T-1].
        finalAdditionalValue = dpGrid[itemCount][capacityLimit - 1] + itemPairs[itemPairs.length - 1][1];
    }

    // Compare the maximum value achievable with capacity T,
    // and the special 'lastOrder' value.
    console.log(Math.max(dpGrid[itemCount][capacityLimit], finalAdditionalValue));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
