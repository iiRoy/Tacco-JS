const fileSystemModule = require('node:fs');

// Global variables to match the original's external contract
let totalItemCount;
let capacityLimit;
let inventoryItems;

function calculateOptimalKnapsackValue() {
    // Initialize a memoization table with null to distinguish uncomputed states from 0 values
    const memoizationTable = Array.from({ length: totalItemCount + 1 }, () =>
        Array(capacityLimit + 1).fill(null)
    );

    // Recursive helper function to determine the maximum worth
    const findMaxWorth = (itemIndex, currentCapacity) => {
        // Base case: If capacity becomes negative, it implies an invalid state.
        // In the original DP, accessing C[...][negative_index] results in `undefined`.
        // Adding a number to `undefined` yields `NaN`. We replicate this behavior.
        if (currentCapacity < 0) {
            return NaN;
        }

        // Base case: If no items are considered or no capacity is available, the value is 0.
        // This corresponds to the initialization of C[0][j] = 0 and C[i][0] = 0 in the original.
        if (itemIndex === 0 || currentCapacity === 0) {
            return 0;
        }

        // Memoization: If this state has already been computed, return the cached value.
        if (memoizationTable[itemIndex][currentCapacity] !== null) {
            return memoizationTable[itemIndex][currentCapacity];
        }

        const currentItem = inventoryItems[itemIndex];
        const itemWeight = currentItem.weightValue;
        const itemWorth = currentItem.valueAmount;

        // Option 1: Exclude the current item. Value comes from the previous item's state.
        const optionToExclude = findMaxWorth(itemIndex - 1, currentCapacity);

        let optionToIncludeOnce = NaN;       // Corresponds to items[i].v + C[i-1][j-items[i].w]
        let optionToIncludeMultiple = NaN;   // Corresponds to items[i].v + C[i][j-items[i].w]

        // Replicate the original's specific condition: `if (items[i].w <= W)`
        // This condition checks against the global maximum capacity, not the current sub-capacity.
        if (itemWeight <= capacityLimit) {
            // Calculate the 0/1 knapsack style option (using previous item's state)
            const valueFromPreviousRow = findMaxWorth(itemIndex - 1, currentCapacity - itemWeight);
            if (!isNaN(valueFromPreviousRow)) {
                optionToIncludeOnce = itemWorth + valueFromPreviousRow;
            }

            // Calculate the unbounded knapsack style option (using current item's state)
            const valueFromCurrentRow = findMaxWorth(itemIndex, currentCapacity - itemWeight);
            if (!isNaN(valueFromCurrentRow)) {
                optionToIncludeMultiple = itemWorth + valueFromCurrentRow;
            }
        }

        // The original code uses Math.max. If any argument to Math.max is NaN, the result is NaN.
        // This correctly replicates the NaN propagation from the original's undefined arithmetic.
        // Also, the original's `else { C[i][j]=C[i-1][j]; }` (when `items[i].w > W`)
        // is implicitly handled here: if `itemWeight > capacityLimit`,
        // `optionToIncludeOnce` and `optionToIncludeMultiple` remain `NaN`,
        // so `Math.max` will effectively choose `optionToExclude` (if it's a number).
        const finalResult = Math.max(optionToExclude, optionToIncludeOnce, optionToIncludeMultiple);

        // Store the computed result in the memoization table before returning
        memoizationTable[itemIndex][currentCapacity] = finalResult;
        return finalResult;
    };

    // Initiate the recursive calculation for the full problem
    return findMaxWorth(totalItemCount, capacityLimit);
}

// --- Input Processing ---
const rawInputContent = fileSystemModule.readFileSync(0, 'utf8'); // Read from stdin (fd 0)

const processedLines = rawInputContent.trim().split('\n');

const firstDataLine = processedLines.shift().split(' ');
totalItemCount = parseInt(firstDataLine[0], 10); // Assign to global N equivalent
capacityLimit = parseInt(firstDataLine[1], 10);   // Assign to global W equivalent

inventoryItems = [null]; // Use 1-based indexing to match original's `items[i]`

for (let k = 1; k <= totalItemCount; k++) {
    const currentItemLine = processedLines.shift();
    const itemDetails = currentItemLine.split(' ');
    const itemVal = parseInt(itemDetails[0], 10);
    const itemWt = parseInt(itemDetails[1], 10);
    inventoryItems[k] = { valueAmount: itemVal, weightValue: itemWt }; // Different object key names
}

// --- Execution and Output ---
const finalOptimalValue = calculateOptimalKnapsackValue();
console.log(finalOptimalValue);
