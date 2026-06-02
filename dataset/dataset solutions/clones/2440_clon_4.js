function Main(input) {
    const allLines = input.trim().split('\n');
    const [firstLineData, ...itemLinesData] = allLines;
    const [totalItemsCount, maxTimeCapacity] = firstLineData.split(' ').map(Number);

    const itemsData = itemLinesData.map(line => line.split(' ').map(Number));

    itemsData.sort((a, b) => a[1] - b[1]);

    // memoCache[itemIndex][capacity] stores the maximum value
    // itemIndex refers to the index in itemsData (0 to totalItemsCount - 2)
    // capacity refers to the current time capacity (0 to maxTimeCapacity)
    // The memoization table is sized for items from 0 to N-2, and capacities from 0 to T.
    const memoCache = Array.from({ length: totalItemsCount - 1 }, () => Array(maxTimeCapacity + 1).fill(undefined));

    function computeKnapsackValue(currentIdx, remainingCapacity, allItemsArr, cache) {
        // If capacity is negative, it's an invalid state.
        // Returning undefined will propagate NaN in subsequent calculations,
        // mimicking the original code's behavior of accessing dp[-1] which results in undefined + value = NaN.
        if (remainingCapacity < 0) {
            return undefined;
        }
        // Base case: No items left to consider (currentIdx < 0) or no capacity (remainingCapacity === 0).
        // In these cases, the maximum value is 0.
        if (currentIdx < 0 || remainingCapacity === 0) {
            return 0;
        }

        // Check memoization cache to avoid redundant computations.
        // `cache[currentIdx]` will be an array if `currentIdx` is valid (>=0).
        if (cache[currentIdx][remainingCapacity] !== undefined) {
            return cache[currentIdx][remainingCapacity];
        }

        const currentItem = allItemsArr[currentIdx];
        const itemWeight = currentItem[0];
        const itemValue = currentItem[1];

        // Scenario 1: Exclude the current item.
        // Recursively find the maximum value using previous items with the same capacity.
        const valueExcludingCurrent = computeKnapsackValue(currentIdx - 1, remainingCapacity, allItemsArr, cache);

        // Scenario 2: Include the current item.
        // Initialize to NaN. This will correctly propagate if the previous calculation results in NaN.
        let valueIncludingCurrent = NaN;
        if (itemWeight <= remainingCapacity) {
            // If the current item's weight fits, recursively find the max value
            // using previous items with reduced capacity, then add the current item's value.
            const prevValue = computeKnapsackValue(currentIdx - 1, remainingCapacity - itemWeight, allItemsArr, cache);
            if (prevValue !== undefined) {
                valueIncludingCurrent = prevValue + itemValue;
            }
            // If prevValue is undefined (due to negative capacity), valueIncludingCurrent remains NaN.
        }

        // The result for the current state is the maximum of excluding or including the current item.
        // Math.max(number, NaN) results in NaN, preserving the original behavior.
        const result = Math.max(valueExcludingCurrent, valueIncludingCurrent);

        // Store the computed result in the cache before returning.
        cache[currentIdx][remainingCapacity] = result;
        return result;
    }

    // Calculate the two scenarios as per the original code's logic:
    // Scenario A: Maximum value from the first N-1 items (indices 0 to N-2) with the full capacity T.
    const maxValWithoutLastSpecial = computeKnapsackValue(totalItemsCount - 2, maxTimeCapacity, itemsData, memoCache);

    // Scenario B: Maximum value from the first N-1 items (indices 0 to N-2) with capacity T-1,
    //             then add the value of the last item (itemsData[N-1][1]).
    const lastItemValue = itemsData[totalItemsCount - 1][1];
    const maxValWithLastSpecialBase = computeKnapsackValue(totalItemsCount - 2, maxTimeCapacity - 1, itemsData, memoCache);

    let maxValWithLastSpecial;
    if (maxValWithLastSpecialBase !== undefined) {
        maxValWithLastSpecial = maxValWithLastSpecialBase + lastItemValue;
    } else {
        // If the base calculation for T-1 capacity resulted in undefined (e.g., if T-1 < 0),
        // then adding lastItemValue would result in NaN.
        maxValWithLastSpecial = NaN;
    }

    // Output the maximum of the two scenarios.
    console.log(Math.max(maxValWithoutLastSpecial, maxValWithLastSpecial));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
