const fileSystem = require('fs');

function calculateOptimalValue(itemDetails, totalItemCount, maxCapacity) {
    // Using a nested Map for memoization: Map<itemIndex, Map<currentCapacity, value>>
    const valueCache = new Map();

    // Recursive helper function with memoization
    function retrieveMax(itemIndex, currentCapacity) {
        // Base cases
        if (currentCapacity < 0) {
            // If capacity becomes negative, this path is invalid, return a very small number
            return -Infinity;
        }
        if (itemIndex > totalItemCount) {
            // If no more items to consider, no more value can be added
            return 0;
        }

        // Check memoization cache
        if (valueCache.has(itemIndex) && valueCache.get(itemIndex).has(currentCapacity)) {
            return valueCache.get(itemIndex).get(currentCapacity);
        }

        const currentItem = itemDetails[itemIndex];

        // Option 1: Do not include the current item (or any copies of it)
        // Move to the next item with the same capacity
        const valueExcludingCurrent = retrieveMax(itemIndex + 1, currentCapacity);

        // Option 2: Include 'k' copies of the current item
        let valueIncludingCurrent = -Infinity;
        const possibleCopies = Math.floor(currentCapacity / currentItem.wt);

        // Only proceed if at least one copy of the current item can fit
        if (possibleCopies > 0) {
            const totalWeightForCopies = possibleCopies * currentItem.wt;
            const totalValueForCopies = possibleCopies * currentItem.val;

            // Add the value of 'k' copies and then find the max value for the remaining items
            // (from itemIndex + 1) with the reduced capacity.
            valueIncludingCurrent = totalValueForCopies + retrieveMax(itemIndex + 1, currentCapacity - totalWeightForCopies);
        }

        // The maximum value for the current state is the greater of the two options
        const result = Math.max(valueExcludingCurrent, valueIncludingCurrent);

        // Store the result in the cache before returning
        if (!valueCache.has(itemIndex)) {
            valueCache.set(itemIndex, new Map());
        }
        valueCache.get(itemIndex).set(currentCapacity, result);

        return result;
    }

    // Start the recursive process from the first item (index 1) and the full capacity
    return retrieveMax(1, maxCapacity);
}

// --- Input Parsing ---
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');

// Extract totalItemCount and maxCapacity from the first line
const [totalItemCount, maxCapacity] = inputLines[0].split(' ').map(Number);

// Prepare itemDetails array (1-indexed, so the first element at index 0 is null)
// Use slice to get only the item lines, then map to transform them into objects
const itemDetails = [
    null, // Placeholder for 0-index to keep item indices 1-based
    ...inputLines.slice(1, totalItemCount + 1).map(line => {
        const [val, wt] = line.split(' ').map(Number);
        return { val, wt }; // Renamed 'v' to 'val' and 'w' to 'wt'
    })
];

// Calculate the final optimal value using the cloned knapsack function
const finalOptimalValue = calculateOptimalValue(itemDetails, totalItemCount, maxCapacity);

// Output the result
console.log(finalOptimalValue);
