// Simulates reading lines from standard input in a Node.js-like environment.
// For actual execution in a browser or different Node.js setup,
// this input simulation mechanism would need to be replaced.
const getNextInputLine = (() => {
    // This array holds the simulated input data.
    // In a real application, this might be populated by `fs.readFileSync`
    // or by a `readline` interface.
    const simulatedInputData = `5 3
1 2 3 4 5
1 2
3 4
2 5`.split('\n');
    let currentInputLineIndex = 0;
    return () => {
        if (currentInputLineIndex < simulatedInputData.length) {
            return simulatedInputData[currentInputLineIndex++];
        }
        return null; // Signals no more input lines
    };
})();

/**
 * Transforms a space-separated string of numbers into an array of integers.
 * Includes basic error handling for invalid input.
 * @param {string} rawLine The input string to parse.
 * @returns {number[]} An array of parsed numbers, or an empty array if parsing fails.
 */
const convertLineToNumbers = (rawLine) => {
    if (typeof rawLine !== 'string' || rawLine.trim() === '') {
        console.error("Input line for number conversion is empty or invalid.");
        return [];
    }
    return rawLine.trim().split(' ').map(Number);
};

// Main function that encapsulates the entire problem-solving logic.
function calculateDisjointSetInclusionCount() {
    // Read the first line containing the total number of elements and merge operations.
    let configurationLine = getNextInputLine();
    if (configurationLine === null) {
        console.error("Critical Error: Initial problem configuration line is missing.");
        return 0; // Exit early on critical input error
    }

    const parsedConfiguration = convertLineToNumbers(configurationLine);
    const totalItemCount = parsedConfiguration[0];
    const totalMergeOperations = parsedConfiguration[1];

    // Perform initial validation on the core problem parameters.
    if (isNaN(totalItemCount) || totalItemCount <= 0 || isNaN(totalMergeOperations) || totalMergeOperations < 0) {
        console.error(`Error: Invalid item count (${totalItemCount}) or merge operations (${totalMergeOperations}).`);
        return 0;
    }

    // Read the line containing the desired target values for each item.
    const targetValuesForItems = convertLineToNumbers(getNextInputLine());
    // Ensure the target values array matches the expected number of items.
    if (targetValuesForItems.length !== totalItemCount) {
        console.error(`Error: Mismatch in target values array length. Expected ${totalItemCount}, received ${targetValuesForItems.length}.`);
        return 0;
    }

    // Collect all merge instructions from subsequent input lines.
    const mergeInstructionSet = [];
    for (let mergeOpIndex = 0; mergeOpIndex < totalMergeOperations; mergeOpIndex++) {
        const currentMergePairLine = getNextInputLine();
        if (currentMergePairLine === null) {
            console.error(`Error: Missing merge instruction line for operation #${mergeOpIndex + 1}.`);
            return 0;
        }
        const currentMergePair = convertLineToNumbers(currentMergePairLine);
        // Validate each merge instruction pair.
        if (currentMergePair.length !== 2 || isNaN(currentMergePair[0]) || isNaN(currentMergePair[1])) {
            console.error(`Error: Malformed merge instruction at line ${mergeOpIndex + 1}: '${currentMergePairLine}'.`);
            return 0;
        }
        mergeInstructionSet.push(currentMergePair);
    }

    // Initialize the disjoint sets structure.
    // An array `itemClusters` is used where `itemClusters[i]` stores the Set object
    // representing the cluster (group) that item `i` belongs to.
    // Using 1-based indexing for items, so the array size is `totalItemCount + 1`.
    const itemClusters = new Array(totalItemCount + 1).fill(null);
    for (let itemId = 1; itemId <= totalItemCount; itemId++) {
        itemClusters[itemId] = new Set([itemId]); // Each item initially forms its own cluster.
    }

    // Process each merge operation to unify item clusters.
    // This loop effectively performs "union" operations in a Disjoint Set Union (DSU) context,
    // where `Set` objects are directly managed.
    for (const [firstItemId, secondItemId] of mergeInstructionSet) {
        // Validate item IDs to prevent out-of-bounds access.
        if (firstItemId < 1 || firstItemId > totalItemCount || secondItemId < 1 || secondItemId > totalItemCount) {
            console.warn(`Warning: Skipping merge for invalid item IDs: [${firstItemId}, ${secondItemId}].`);
            continue; // Skip this invalid operation
        }

        const clusterOfFirst = itemClusters[firstItemId];
        const clusterOfSecond = itemClusters[secondItemId];

        // If both items are already part of the same cluster, no merge is needed.
        if (clusterOfFirst === clusterOfSecond) {
            continue;
        }

        let unifiedCluster;
        // Optimize the merge by iterating over the smaller set and adding its elements
        // to the larger set. This minimizes reallocations/additions.
        if (clusterOfFirst.size >= clusterOfSecond.size) {
            unifiedCluster = clusterOfFirst;
            for (const memberId of clusterOfSecond) {
                unifiedCluster.add(memberId);
            }
        } else {
            unifiedCluster = clusterOfSecond;
            for (const memberId of clusterOfFirst) {
                unifiedCluster.add(memberId);
            }
        }

        // After merging, all individual items that were part of the original two clusters
        // must now point to this single, unified `Set` object. This is analogous to
        // path compression in a traditional DSU, ensuring all elements in the same
        // cluster reference the same representative set.
        for (const memberIdentifier of unifiedCluster) {
            // Additional check for memberIdentifier validity during update.
            if (memberIdentifier >= 1 && memberIdentifier <= totalItemCount) {
                itemClusters[memberIdentifier] = unifiedCluster;
            } else {
                console.warn(`Warning: Encountered out-of-bounds member ID (${memberIdentifier}) during cluster update. This might indicate corrupted data.`);
            }
        }
    }

    // Final calculation: Count how many items have their desired target value
    // present within their final assigned cluster.
    let successfulMatchCount = 0; // A direct counter replaces an intermediate array and sum.

    // Iterate through each item, using 1-based indexing.
    for (let currentProcessingItem = 1; currentProcessingItem <= totalItemCount; currentProcessingItem++) {
        const finalClusterForCurrentItem = itemClusters[currentProcessingItem];
        // Adjust index for `targetValuesForItems` as it's 0-based.
        const desiredTargetValue = targetValuesForItems[currentProcessingItem - 1];

        // Check if the desired value is a member of the item's final cluster.
        if (finalClusterForCurrentItem.has(desiredTargetValue)) {
            successfulMatchCount++; // Increment the counter if a match is found.
        }
    }

    // Return the total count of successful matches.
    return successfulMatchCount;
}

// Execute the main logic and output the final result to the console.
(function entryPoint() {
    const finalOutcome = calculateDisjointSetInclusionCount();
    console.log(finalOutcome);
})();