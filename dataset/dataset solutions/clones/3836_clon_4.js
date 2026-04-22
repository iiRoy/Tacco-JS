"use strict";

// Functional approach for Disjoint Set Union operations
function createDisjointSetSystem(initialCapacity) {
    // Each element is initially its own parent
    const ancestors = Array.from({ length: initialCapacity }, (_, idx) => idx);

    // Finds the representative (root) of the set containing the given element.
    // Employs iterative full path compression.
    function findRepresentative(elementIndex) {
        let currentRoot = elementIndex;
        // First, traverse up to find the absolute root of the set
        while (ancestors[currentRoot] !== currentRoot) {
            currentRoot = ancestors[currentRoot];
        }

        // Second, path compression: make all nodes on the path from elementIndex
        // to currentRoot point directly to currentRoot.
        let traversalNode = elementIndex;
        while (ancestors[traversalNode] !== currentRoot) {
            let nextNode = ancestors[traversalNode];
            ancestors[traversalNode] = currentRoot;
            traversalNode = nextNode;
        }
        return currentRoot;
    }

    // Merges the sets containing two given elements.
    function combineGroups(firstElement, secondElement) {
        const representativeA = findRepresentative(firstElement);
        const representativeB = findRepresentative(secondElement);

        // If they are not already in the same set, merge them by setting one root's parent to the other.
        if (representativeA !== representativeB) {
            ancestors[representativeA] = representativeB;
        }
    }

    // Checks if two elements are in the same set.
    function areInSameGroup(firstElement, secondElement) {
        return findRepresentative(firstElement) === findRepresentative(secondElement);
    }

    // Expose the DSU operations as an object.
    return {
        findRepresentative: findRepresentative,
        combineGroups: combineGroups,
        areInSameGroup: areInSameGroup
    };
}

// Main processing function for the problem
function ProcessInputAndCompute(rawData) {
    const dataLines = rawData.split("\n");

    // Parse the first line for configuration values: total number of items and merge operations count.
    const configValues = dataLines.shift().split(/\s/).map(Number);
    const totalItems = configValues[0];
    const mergeOperations = configValues[1];

    // Initialize the disjoint set system with the total number of items.
    const groupManager = createDisjointSetSystem(totalItems);

    // Parse the second line for the target mapping array.
    const targetMapping = dataLines.shift().split(/\s/).map(Number);

    // Perform the specified number of merge operations.
    for (let opIdx = 0; opIdx < mergeOperations; opIdx++) {
        const [itemA, itemB] = dataLines.shift().split(/\s/).map(Number);
        // Adjust to 0-indexed values before merging.
        groupManager.combineGroups(itemA - 1, itemB - 1);
    }

    let matchCount = 0;
    // Iterate through all items to check their connection to their mapped targets.
    for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
        // Check if the current item (itemIdx) and its mapped target (targetMapping[itemIdx]-1)
        // belong to the same group in the disjoint set system.
        if (groupManager.areInSameGroup(itemIdx, targetMapping[itemIdx] - 1)) {
            matchCount++;
        }
    }

    console.log(matchCount);
}

// Execute the main logic by reading input from standard input.
ProcessInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));