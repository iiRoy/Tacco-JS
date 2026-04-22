const fileSystem = require('fs');

// Reads all input from /dev/stdin and processes it.
// This function handles reading lines sequentially from the input buffer.
const processInput = () => {
    // Read the entire standard input as a UTF-8 string.
    const rawInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Trim leading/trailing whitespace and split into an array of lines.
    const allInputLines = rawInputBuffer.trim().split('\n');

    // Maintain an index to track the current line being read.
    let currentLineIndex = 0;

    // Helper function to retrieve the next line from the input array.
    const fetchNextLine = () => {
        if (currentLineIndex >= allInputLines.length) {
            throw new Error("Attempted to read past end of input.");
        }
        return allInputLines[currentLineIndex++];
    };

    // --- Input Parsing ---

    // The first line contains two space-separated integers: N and M.
    const dimensionsLine = fetchNextLine();
    const dimensionTokens = dimensionsLine.split(' ');

    // Basic validation for the dimensions line.
    if (dimensionTokens.length !== 2) {
        throw new Error("Dimension line must contain exactly two numbers.");
    }

    // Parse N and M. N is the number of 'weights' (items_a), M is the number of 'costs' (items_b).
    const numItemsA = Number.parseInt(dimensionTokens[0], 10);
    const numItemsB = Number.parseInt(dimensionTokens[1], 10);

    // Validate parsed dimensions.
    if (isNaN(numItemsA) || isNaN(numItemsB) || numItemsA < 0 || numItemsB < 0) {
        throw new Error("N and M must be non-negative integers.");
    }

    // --- Populate item weights array ---
    // The next N lines each contain a single integer, representing an item's weight.
    const itemWeights = [];
    for (let weightCounter = 0; weightCounter < numItemsA; ++weightCounter) {
        const currentWeightString = fetchNextLine();
        const parsedWeight = Number.parseInt(currentWeightString, 10);

        if (isNaN(parsedWeight)) {
            throw new Error(`Invalid weight value encountered: ${currentWeightString}`);
        }
        itemWeights.push(parsedWeight);
    }

    // --- Populate item costs array ---
    // The next M lines each contain a single integer, representing an item's cost.
    const itemCosts = [];
    for (let costCounter = 0; costCounter < numItemsB; ++costCounter) {
        const currentCostString = fetchNextLine();
        const parsedCost = Number.parseInt(currentCostString, 10);

        if (isNaN(parsedCost)) {
            throw new Error(`Invalid cost value encountered: ${currentCostString}`);
        }
        itemCosts.push(parsedCost);
    }

    // --- Dynamic Programming Table Initialization ---
    // `memoizationTable[i][j]` will store the minimum cost to match `j` weights using the first `i` cost items.
    // The table dimensions are (numItemsB + 1) rows by (numItemsA + 1) columns.
    const memoizationTable = [];
    const unreachableCost = Number.POSITIVE_INFINITY; // Represents an unreachable state or infinite cost.

    for (let rowIndex = 0; rowIndex <= numItemsB; ++rowIndex) {
        // Initialize each row with `unreachableCost`.
        const currentRow = new Array(numItemsA + 1).fill(unreachableCost);
        memoizationTable.push(currentRow);
    }

    // The cost to match 0 weights with 0 cost items is 0.
    memoizationTable[0][0] = 0;

    // --- DP Table Calculation ---
    // Iterate through cost items (outer loop) and weight items (inner loop).
    for (let currentCostItemIdx = 0; currentCostItemIdx < numItemsB; ++currentCostItemIdx) {
        const nextCostItemRow = currentCostItemIdx + 1; // Represents using up to `nextCostItemRow` cost items.
        const valueOfCurrentCostItem = itemCosts[currentCostItemIdx];

        for (let currentWeightItemIdx = 0; currentWeightItemIdx < numItemsA; ++currentWeightItemIdx) {
            const nextWeightItemCol = currentWeightItemIdx + 1; // Represents matching up to `nextWeightItemCol` weight items.
            const valueOfCurrentWeightItem = itemWeights[currentWeightItemIdx];

            // Retrieve the minimum cost from the previous state (before considering current cost item).
            const costFromPreviousState = memoizationTable[currentCostItemIdx][currentWeightItemIdx];

            // If the previous state was reachable (not infinite cost):
            if (costFromPreviousState < unreachableCost) {
                // Option 1: Do NOT use the current cost item (valueOfCurrentCostItem).
                // The cost for `nextCostItemRow` items and `currentWeightItemIdx` weights is at least `costFromPreviousState`.
                // Update `memoizationTable[nextCostItemRow][currentWeightItemIdx]` if `costFromPreviousState` is smaller.
                if (costFromPreviousState < memoizationTable[nextCostItemRow][currentWeightItemIdx]) {
                    memoizationTable[nextCostItemRow][currentWeightItemIdx] = costFromPreviousState;
                }

                // Option 2: USE the current cost item (valueOfCurrentCostItem) and match it with the current weight item (valueOfCurrentWeightItem).
                // The cost for `nextCostItemRow` items and `nextWeightItemCol` weights is at least
                // `costFromPreviousState` + (cost of matching current cost and weight items).
                const matchingCostContribution = valueOfCurrentCostItem * valueOfCurrentWeightItem;
                const potentialNewCost = costFromPreviousState + matchingCostContribution;

                // Update `memoizationTable[nextCostItemRow][nextWeightItemCol]` if `potentialNewCost` is smaller.
                if (potentialNewCost < memoizationTable[nextCostItemRow][nextWeightItemCol]) {
                    memoizationTable[nextCostItemRow][nextWeightItemCol] = potentialNewCost;
                }
            }
        }
    }

    // --- Determine Final Minimum Cost ---
    // The problem asks for the minimum cost to match ALL `numItemsA` weights.
    // This means we need to look at the last column of the DP table (`numItemsA` column)
    // across all possible numbers of cost items used (from 0 to `numItemsB`).
    let overallMinimumCost = unreachableCost;

    for (let finalCostRow = 0; finalCostRow <= numItemsB; ++finalCostRow) {
        const costForMatchingAllWeights = memoizationTable[finalCostRow][numItemsA];

        // Update the overall minimum if a smaller cost is found.
        if (costForMatchingAllWeights < overallMinimumCost) {
            overallMinimumCost = costForMatchingAllWeights;
        }
    }

    // --- Output the Result ---
    // Use process.stdout.write for direct output, similar to console.log but
    // can be more performant for large outputs (though not critical here).
    process.stdout.write(overallMinimumCost.toString() + '\n');
};

// Execute the main processing function.
processInput();