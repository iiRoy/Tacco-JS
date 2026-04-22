const orchestrateSolution = (entireInputString) => {
    const individualInputRecords = entireInputString.split('\n').filter(Boolean); // Discard empty lines

    // Parse configuration parameters from the initial record
    // Original: `tpl = lines.shift(); N = tpl.shift(); W = tpl.shift();`
    // New: Direct destructuring and numeric conversion
    const [firstRecord, ...subsequentRecords] = individualInputRecords;
    const [objectCount, maximumCapacity] = firstRecord.split(' ').map(numStr => +numStr);

    // Prepare the list of available objects (value-weight pairs)
    // Original: `lines.map(...)` then `goods = lines;`
    // New: Use reduce to build the array, ensuring each entry is a pair of numbers
    const availableObjects = subsequentRecords.reduce((collection, currentRecord) => {
        const parts = currentRecord.split(' ');
        // Assuming object details are always two space-separated numbers (value and weight)
        if (parts.length === 2) {
            collection.push([+parts[0], +parts[1]]);
        }
        return collection;
    }, []);

    // Invoke the core algorithm to find the optimal value
    const finalOptimalValue = determineBestAllocation(availableObjects, maximumCapacity);

    // Return the computed result
    return finalOptimalValue;
};

// Core Knapsack Algorithm - Dynamic Programming with Map-based state management
// Original `V` function uses imperative loops and object properties for DP.
// New: Functional approach using Map objects for state, iterating through items.
const determineBestAllocation = (itemsCollection, capacityConstraint) => {
    // currentAllocationMap: Stores the maximum value achievable for a given weight
    // Initialize with {0: 0} indicating 0 value for 0 weight
    let currentAllocationMap = new Map([[0, 0]]);

    // Iterate through each item available
    for (const [objectValue, objectWeight] of itemsCollection) {
        // Create a new map for the next state, initially copying all previous states.
        // This implicitly handles the case where the current item is NOT taken.
        const nextAllocationMap = new Map(currentAllocationMap);

        // Iterate over all previously achievable (weight, value) pairs
        for (const [existingLoad, existingWorth] of currentAllocationMap.entries()) {
            const potentialNewLoad = existingLoad + objectWeight;

            // If adding the current item does not exceed the overall capacity
            if (potentialNewLoad <= capacityConstraint) {
                const potentialNewWorth = existingWorth + objectValue;

                // Update the next state map:
                // If 'potentialNewLoad' already has an entry, take the maximum value.
                // Otherwise, set it to 'potentialNewWorth'.
                nextAllocationMap.set(
                    potentialNewLoad,
                    Math.max(nextAllocationMap.get(potentialNewLoad) || 0, potentialNewWorth)
                );
            }
        }
        // Transition to the new state for the next item
        currentAllocationMap = nextAllocationMap;
    }

    // After processing all items, find the highest value among all achievable loads
    // within the capacity constraint.
    let overallHighestWorth = 0;
    for (const worthEntry of currentAllocationMap.values()) {
        overallHighestWorth = Math.max(overallHighestWorth, worthEntry);
    }

    return overallHighestWorth;
};

// This section simulates the original's input/output mechanism
// but with Type IV divergence by using `process.stdin` directly
// without the `var log = console.log;` alias and with a different event structure.
// This part is included to match the original's full script structure.
if (typeof process !== "undefined" && process.stdin && process.stdin.resume) {
    let rawDataAccumulator = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (dataChunk) => {
        rawDataAccumulator += dataChunk;
    });

    process.stdin.on('end', () => {
        const finalResult = orchestrateSolution(rawDataAccumulator);
        console.log(finalResult); // Using console.log directly
    });
}