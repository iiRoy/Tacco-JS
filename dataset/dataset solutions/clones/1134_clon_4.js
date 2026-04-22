const retrieveSourceData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputStructure = (rawDataText) => {
    const splitLines = rawDataText.trim().split("\n");
    const [totalObjects, maxCapacity] = splitLines.shift().split(" ").map(Number);
    const objectCollection = [];
    for (let currentItemPos = 0; currentItemPos < totalObjects; currentItemPos++) {
        const objectSpecs = splitLines.shift().split(" ").map(Number);
        objectCollection.push({ worthValue: objectSpecs[0], weightMass: objectSpecs[1] });
    }
    return { totalObjects, maxCapacity, objectCollection };
};

const computeMaximumAttainableValue = (objectCount, capacityLimit, availableObjects) => {
    // Memoization table: dimensions [objectCount][capacityLimit + 1]
    // Initialize with a sentinel value (-1) to indicate uncomputed states.
    const computedResults = Array(objectCount).fill(null).map(() => Array(capacityLimit + 1).fill(-1));

    // Recursive function with memoization
    const findOptimumRecursively = (currentObjectIndex, currentRemainingCapacity) => {
        // Base Cases:
        // If there are no more objects to consider or no capacity left, no more value can be added.
        if (currentObjectIndex < 0 || currentRemainingCapacity <= 0) {
            return 0;
        }

        // Check if this state has already been computed
        if (computedResults[currentObjectIndex][currentRemainingCapacity] !== -1) {
            return computedResults[currentObjectIndex][currentRemainingCapacity];
        }

        const currentObject = availableObjects[currentObjectIndex];
        const currentObjectWorth = currentObject.worthValue;
        const currentObjectWeight = currentObject.weightMass;

        // Option 1: Exclude the current object
        // Move to the next object (previous in 0-indexed array) without changing capacity.
        const valueIfNotIncluded = findOptimumRecursively(currentObjectIndex - 1, currentRemainingCapacity);

        // Option 2: Include the current object (if its weight allows)
        let valueIfIncluded = 0;
        if (currentObjectWeight <= currentRemainingCapacity) {
            // Add current object's worth and recursively find value for remaining capacity and objects.
            valueIfIncluded = currentObjectWorth + findOptimumRecursively(currentObjectIndex - 1, currentRemainingCapacity - currentObjectWeight);
        }

        // Store the maximum of the two options in the memoization table
        computedResults[currentObjectIndex][currentRemainingCapacity] = Math.max(valueIfNotIncluded, valueIfIncluded);
        return computedResults[currentObjectIndex][currentRemainingCapacity];
    };

    // Initiate the recursive computation starting from the last object (totalObjects - 1)
    // with the full capacity (capacityLimit).
    return findOptimumRecursively(objectCount - 1, capacityLimit);
};

// Main execution block
const rawContent = retrieveSourceData();
const { totalObjects, maxCapacity, objectCollection } = processInputStructure(rawContent);
const finalOptimalValue = computeMaximumAttainableValue(totalObjects, maxCapacity, objectCollection);
console.log(finalOptimalValue);