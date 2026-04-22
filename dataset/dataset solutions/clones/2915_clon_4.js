function processTreasureHunt(entryData) {
    const { operationLimit, initialGemCollection } = (function(sourceMaterial) {
        const lineSegments = sourceMaterial.trim().split(/\r?\n/);
        const [metaInformation] = lineSegments;
        const [, operationCountString] = metaInformation.split(/\s+/);
        const gemValuesString = lineSegments[1];
        const gemValues = gemValuesString.split(/\s+/).map(x => +x);
        return { operationLimit: +operationCountString, initialGemCollection: gemValues };
    })(entryData);

    let maximumAcquiredValue = 0;

    const explorationPath = []; // Acts as a stack for DFS

    // Initial state: all gems in the collection, no gems held, 0 operations completed
    explorationPath.push([initialGemCollection.slice(), [], 0]);

    while (explorationPath.length > 0) {
        const [currentCollection, currentHeldItems, completedOperations] = explorationPath.pop();
        const operationsRemaining = operationLimit - completedOperations;

        const currentItemsSum = currentHeldItems.reduce((accumulator, itemValue) => accumulator + itemValue, 0);
        maximumAcquiredValue = Math.max(maximumAcquiredValue, currentItemsSum);

        if (operationsRemaining <= 0) {
            continue; // No more operations allowed for this path
        }

        // Action 1: Remove an item from the left end of the current collection and place it in held items
        if (currentCollection.length > 0) {
            const nextCollection = currentCollection.slice(1);
            const itemObtained = currentCollection[0];
            const nextHeldItems = currentHeldItems.concat([itemObtained]);
            explorationPath.push([nextCollection, nextHeldItems, completedOperations + 1]);
        }

        // Action 2: Remove an item from the right end of the current collection and place it in held items
        if (currentCollection.length > 0) {
            const nextCollection = currentCollection.slice(0, currentCollection.length - 1);
            const itemObtained = currentCollection[currentCollection.length - 1];
            const nextHeldItems = currentHeldItems.concat([itemObtained]);
            explorationPath.push([nextCollection, nextHeldItems, completedOperations + 1]);
        }

        // Action 3: Return an item from held items to the left end of the current collection
        for (let idx = 0; idx < currentHeldItems.length; idx++) {
            const itemReturned = currentHeldItems[idx];
            const nextHeldItems = currentHeldItems.filter((_, filterIdx) => filterIdx !== idx);
            const nextCollection = [itemReturned].concat(currentCollection);
            explorationPath.push([nextCollection, nextHeldItems, completedOperations + 1]);
        }

        // Action 4: Return an item from held items to the right end of the current collection
        for (let idx = 0; idx < currentHeldItems.length; idx++) {
            const itemReturned = currentHeldItems[idx];
            const nextHeldItems = currentHeldItems.filter((_, filterIdx) => filterIdx !== idx);
            const nextCollection = currentCollection.concat([itemReturned]);
            explorationPath.push([nextCollection, nextHeldItems, completedOperations + 1]);
        }
    }

    return maximumAcquiredValue;
}

console.log(processTreasureHunt(require("fs").readFileSync("/dev/stdin", "utf8")));