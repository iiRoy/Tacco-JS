function calculateMinimumSortCost(inputArray, arrayLength) {
    const globalMinimum = Math.min(...inputArray);
    const valueRankMap = new Map(); // Maps a value to its sorted index (rank)
    const visitedPositions = new Set(); // Tracks indices already part of a processed cycle
    let totalAccumulatedCost = 0;

    // Step 1: Create an array of objects with value and original index, then sort it.
    // This helps determine the "rank" or sorted position for each value.
    const indexedValues = inputArray.map((val, idx) => ({ val, originalIdx: idx }));
    indexedValues.sort((a, b) => a.val - b.val);

    // Step 2: Populate the valueRankMap.
    // This map is crucial for traversing the permutation cycles.
    // It maps a value to the index it would occupy if the array were sorted.
    // If duplicate values exist, the original code maps the value to the *last* index
    // where that value appears in the sorted array. This is replicated by iterating
    // through the sorted `indexedValues` and setting the map, as later occurrences
    // will overwrite earlier ones for duplicate keys.
    indexedValues.forEach((item, rank) => {
        valueRankMap.set(item.val, rank);
    });

    // Step 3: Iterate through each position to find and process cycles.
    for (let currentStartingIndex = 0; currentStartingIndex < arrayLength; currentStartingIndex++) {
        if (visitedPositions.has(currentStartingIndex)) {
            continue; // Skip if this position has already been part of a processed cycle
        }

        // Use an immediately invoked function expression (IIFE) to encapsulate cycle collection logic.
        // This replaces the imperative 'while(1)' loop and direct variable accumulation.
        const cycleStats = (function collectCycleData(startIdx) {
            const elementsInCycle = [];
            let currentTraversalIndex = startIdx;

            // Traverse the cycle, marking visited positions and collecting elements.
            while (!visitedPositions.has(currentTraversalIndex)) {
                visitedPositions.add(currentTraversalIndex);
                const elementValue = inputArray[currentTraversalIndex];
                elementsInCycle.push(elementValue);
                // Move to the next position in the permutation:
                // current_index -> value_at_current_index -> sorted_index_of_that_value
                currentTraversalIndex = valueRankMap.get(elementValue);
            }

            // Calculate cycle statistics using functional methods (reduce, Math.min).
            const cycleSum = elementsInCycle.reduce((sum, val) => sum + val, 0);
            const cycleMinimum = Math.min(...elementsInCycle);
            const cycleCount = elementsInCycle.length;

            return { cycleSum, cycleMinimum, cycleCount };
        })(currentStartingIndex); // Invoke the IIFE with the current starting index

        // Destructure the returned cycle statistics.
        const { cycleSum, cycleMinimum, cycleCount } = cycleStats;

        // Apply the cost calculation formula.
        // This formula is specific to the problem (e.g., minimum swaps to sort with specific costs).
        const costStrategyOne = cycleSum + (cycleCount - 2) * cycleMinimum;
        const costStrategyTwo = cycleMinimum + cycleSum + (cycleCount + 1) * globalMinimum;

        totalAccumulatedCost += Math.min(costStrategyOne, costStrategyTwo);
    }

    return totalAccumulatedCost;
}

function executeProgram(inputContent) {
    const inputLines = inputContent.split('\n');
    const arrayLength = Number.parseInt(inputLines.shift(), 10);
    const sequenceData = inputLines.shift().split(' ').map(Number.parseInt);

    const finalResult = calculateMinimumSortCost(sequenceData, arrayLength);
    process.stdout.write(String(finalResult) + '\n'); // Use process.stdout.write for output
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
