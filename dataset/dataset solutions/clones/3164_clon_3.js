// Data structure for managing connected components (Disjoint Set Union - DSU).
// Each element stores its parent's index and the size of the component if it's a root.
// Indices represent individual nodes/elements in the graph.

/**
 * Initializes a Disjoint Set Union (DSU) structure for a given number of elements.
 * Each element starts as its own parent and its component initially has a size of 1.
 * @param {number} elementCount - The total number of elements (nodes).
 * @returns {Array<Object>} An array representing the DSU structure.
 */
function initializeDisjointSet(elementCount) {
    if (elementCount < 0 || !Number.isInteger(elementCount)) {
        throw new Error("Element count must be a non-negative integer.");
    }
    const componentData = new Array(elementCount);
    for (let i = 0; i < elementCount; i++) {
        componentData[i] = {
            parentIndex: i,     // Initially, each element is its own parent (root of its set)
            componentSize: 1,   // Each component starts with a single element
        };
    }
    return componentData;
}

/**
 * Finds the representative (root) index of the set containing the given element,
 * applying path compression to flatten the tree structure for efficiency.
 * @param {number} elementIdx - The 0-indexed identifier of the element to find the root for.
 * @param {Array<Object>} dsuStructure - The Disjoint Set Union data structure.
 * @returns {number} The index of the representative (root) element of the set.
 * @throws {Error} If an invalid element index is provided.
 */
function findSetRepresentative(elementIdx, dsuStructure) {
    // Validate the element index to prevent out-of-bounds access.
    if (elementIdx < 0 || elementIdx >= dsuStructure.length || !dsuStructure[elementIdx]) {
        throw new Error(`Invalid element index: ${elementIdx}. Must be within [0, ${dsuStructure.length - 1}].`);
    }

    // Traverse upwards to find the actual root of the component.
    let currentElement = elementIdx;
    while (dsuStructure[currentElement].parentIndex !== currentElement) {
        currentElement = dsuStructure[currentElement].parentIndex;
    }
    const rootIndex = currentElement;

    // Path compression: iterate again and make all nodes on the path point directly to the root.
    currentElement = elementIdx;
    while (dsuStructure[currentElement].parentIndex !== rootIndex) {
        let nextParent = dsuStructure[currentElement].parentIndex;
        dsuStructure[currentElement].parentIndex = rootIndex;
        currentElement = nextParent;
    }

    return rootIndex; // Return the index of the representative.
}

/**
 * Checks if two elements belong to the same connected component.
 * @param {number} idxA - The 0-indexed identifier of the first element.
 * @param {number} idxB - The 0-indexed identifier of the second element.
 * @param {Array<Object>} dsuStructure - The Disjoint Set Union data structure.
 * @returns {boolean} True if both elements are in the same component, false otherwise.
 */
function areConnected(idxA, idxB, dsuStructure) {
    const rootIdxA = findSetRepresentative(idxA, dsuStructure);
    const rootIdxB = findSetRepresentative(idxB, dsuStructure);
    return (rootIdxA === rootIdxB);
}

/**
 * Merges the sets containing two given elements.
 * This operation effectively connects two components by making one root a child of the other,
 * and updates the size of the new root component.
 * @param {number} idxA - The 0-indexed identifier of the first element.
 * @param {number} idxB - The 0-indexed identifier of the second element.
 * @param {Array<Object>} dsuStructure - The Disjoint Set Union data structure.
 * @returns {boolean} True if a merge operation occurred, false if elements were already in the same set.
 */
function uniteSets(idxA, idxB, dsuStructure) {
    // Find the root indices for both elements' components.
    const rootIdxA = findSetRepresentative(idxA, dsuStructure);
    const rootIdxB = findSetRepresentative(idxB, dsuStructure);

    // If they are already in the same set, no merge is needed.
    if (rootIdxA === rootIdxB) {
        return false;
    }

    // Merge rootIdxB's component into rootIdxA's component.
    // The component size of rootIdxA is increased by rootIdxB's component size.
    dsuStructure[rootIdxA].componentSize += dsuStructure[rootIdxB].componentSize;
    // Set the parent of rootIdxB to rootIdxA, effectively linking the two components.
    dsuStructure[rootIdxB].parentIndex = rootIdxA;

    return true; // A merge operation successfully occurred.
}

/**
 * Gets the size of the connected component containing the specified element.
 * @param {number} elementIdx - The 0-indexed identifier of the element.
 * @param {Array<Object>} dsuStructure - The Disjoint Set Union data structure.
 * @returns {number} The total number of elements in the component.
 */
function getComponentSize(elementIdx, dsuStructure) {
    const rootIdx = findSetRepresentative(elementIdx, dsuStructure);
    return dsuStructure[rootIdx].componentSize;
}

/**
 * Parses raw input string into a structured array of numbers.
 * @param {string} rawInput - The raw input string, typically from stdin.
 * @returns {Array<Array<number>>} Parsed input as a 2D array of numbers.
 * @throws {Error} If the input is invalid or empty.
 */
const parseInputLines = (rawInput) => {
    if (typeof rawInput !== 'string' || rawInput.trim() === '') {
        throw new Error("Input data must be a non-empty string.");
    }
    const lines = rawInput.trim().split('\n');
    return lines.map(line => line.split(' ').map(Number));
};

/**
 * Calculates the total inconvenience values after iteratively adding bridges back
 * to a set of initially disconnected nodes. The inconvenience is defined as the
 * number of pairs of nodes that are not yet connected.
 * @param {string} inputData - The raw input string containing N (nodes), M (bridges),
 *                             and M lines defining bridge connections.
 */
function processBridgeData(inputData) {
    const parsedInput = parseInputLines(inputData);

    // Validate overall input structure.
    if (!parsedInput || parsedInput.length < 1) {
        throw new Error("Malformed input: No data lines found.");
    }

    const initialParameters = parsedInput[0];
    if (initialParameters.length < 2) {
        throw new Error("Malformed input: The first line must specify N (number of nodes) and M (number of bridges).");
    }

    const numNodes = initialParameters[0]; // N
    const numBridges = initialParameters[1]; // M

    // Validate N and M values.
    if (numNodes < 0 || numBridges < 0 || !Number.isInteger(numNodes) || !Number.isInteger(numBridges)) {
        throw new Error(`Invalid parameters: N (${numNodes}) and M (${numBridges}) must be non-negative integers.`);
    }
    if (parsedInput.length < numBridges + 1) {
        throw new Error(`Malformed input: Expected ${numBridges + 1} lines (1 for N/M + M for bridges), but received ${parsedInput.length}.`);
    }

    // Extract bridge definitions and adjust to 0-indexed values.
    const bridgeConnections = [];
    for (let i = 1; i <= numBridges; i++) {
        const bridgeEntry = parsedInput[i];
        if (bridgeEntry.length < 2) {
            throw new Error(`Malformed input: Bridge entry on line ${i + 1} must specify two nodes.`);
        }
        bridgeConnections.push([bridgeEntry[0] - 1, bridgeEntry[1] - 1]);
    }

    // The problem requires calculating inconvenience as bridges are added one by one.
    // This is efficiently done by starting with all bridges removed and adding them back in reverse order.
    // The `reverse()` method modifies the array in place.
    const reversedBridgeOrder = bridgeConnections.reverse();

    // Initialize the Disjoint Set Union structure for all nodes.
    const dsu = initializeDisjointSet(numNodes);

    // Calculate the initial maximum inconvenience: total unique pairs of nodes.
    // This is (N * (N - 1)) / 2.
    let currentTotalInconvenience = (numNodes * (numNodes - 1)) / 2;
    // This array will store the inconvenience value after each bridge is processed (in reverse order).
    // The first element is the initial inconvenience before any bridges are "added".
    const inconvenienceSnapshots = [currentTotalInconvenience];

    // Iterate through bridges in reverse order (effectively adding them one by one).
    for (const currentBridge of reversedBridgeOrder) {
        const node1Idx = currentBridge[0];
        const node2Idx = currentBridge[1];

        // Check if the two nodes are already connected.
        if (!areConnected(node1Idx, node2Idx, dsu)) {
            // If not connected, merging them will reduce inconvenience.
            // The reduction amount is the product of the sizes of the two components being merged.
            const sizeOfComponent1 = getComponentSize(node1Idx, dsu);
            const sizeOfComponent2 = getComponentSize(node2Idx, dsu);
            const reductionAmount = sizeOfComponent1 * sizeOfComponent2;
            currentTotalInconvenience -= reductionAmount;
        }
        
        // Merge the components in the DSU structure.
        // This updates the DSU state for subsequent calculations.
        uniteSets(node1Idx, node2Idx, dsu);

        // Store the inconvenience after this bridge's effect has been calculated and applied.
        inconvenienceSnapshots.push(currentTotalInconvenience);
    }

    // The `inconvenienceSnapshots` array now contains values in this order:
    // [Initial_Inconvenience, Inconvenience_after_Mth_original_bridge, ..., Inconvenience_after_1st_original_bridge]
    // The problem output typically requires inconvenience after 1st, then 2nd, ..., up to Mth bridge.
    // To achieve this, we need to reverse the snapshots (excluding the initial value) and print.
    // The original code's printing logic is specific, so we will replicate it exactly.
    // Original: `reversed_result = [unconv_after_B1, ..., unconv_after_BM, initial]`
    // Then prints `reversed_result[1]` to `reversed_result[M]`.
    // This translates to printing `unconv_after_B2, ..., unconv_after_BM, initial`.
    // Let's ensure `finalOutputOrder` matches the original `reversed_result`.
    const finalOutputOrder = inconvenienceSnapshots.reverse();

    const outputLines = [];
    // Replicate the original output loop: print from index 1 up to M (inclusive).
    for (let i = 1; i <= numBridges; i++) {
        outputLines.push(finalOutputOrder[i]);
    }
    console.log(outputLines.join('\n'));
}

// Entry point for execution. Reads input from standard input and processes it.
processBridgeData(require('fs').readFileSync('/dev/stdin', 'utf8'));