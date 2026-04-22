function ProcessConnectivityData(inputPayload) {
    // New variable names and restructured input parsing
    const rawLines = inputPayload.trim().split('\n');

    // Guard clause for empty input string
    if (rawLines.length === 0 || rawLines[0].trim() === '') {
        process.stdout.write('0\n'); // No nodes, no components
        return;
    }

    // Parse initial configuration parameters from the first line
    const firstLineTokens = rawLines[0].split(' ');
    const totalNodes = parseInt(firstLineTokens[0], 10);
    const connectionCount = parseInt(firstLineTokens[1], 10);

    // Guard clauses for invalid or zero counts
    if (isNaN(totalNodes) || totalNodes < 0 || isNaN(connectionCount) || connectionCount < 0) {
        // Log an error or handle as per specific requirements, then exit
        process.stderr.write("Error: Invalid node or connection count provided.\n");
        process.stdout.write('0\n');
        return;
    }
    if (totalNodes === 0) {
        process.stdout.write('0\n'); // If no nodes, then 0 components
        return;
    }

    // Initialize the Disjoint Set Union (DSU) structure to manage connectivity
    const componentManager = new DisjointSet(totalNodes);

    // Process each connection line provided in the input
    // Iterating from the second line (index 1) up to 'connectionCount'
    for (let connectionIdx = 1; connectionIdx <= connectionCount; connectionIdx++) {
        const currentConnectionData = rawLines[connectionIdx];

        // Skip if a line is unexpectedly missing or empty
        if (!currentConnectionData || currentConnectionData.trim() === '') {
            process.stderr.write(`Warning: Skipping empty or missing connection data at line ${connectionIdx + 1}.\n`);
            continue;
        }

        // Parse the two node indices for the current connection
        const parsedConnection = currentConnectionData.split(' ').map(strVal => parseInt(strVal, 10));

        // Validate parsed integers to ensure they are valid numbers
        if (parsedConnection.length < 2 || isNaN(parsedConnection[0]) || isNaN(parsedConnection[1])) {
            process.stderr.write(`Warning: Skipping malformed connection data: "${currentConnectionData}" at line ${connectionIdx + 1}.\n`);
            continue;
        }

        // Adjust to 0-based indexing as DSU typically uses 0-based arrays
        const firstNode = parsedConnection[0] - 1;
        const secondNode = parsedConnection[1] - 1;

        // Perform basic bounds check for robustness against invalid node indices
        if (firstNode >= 0 && firstNode < totalNodes && secondNode >= 0 && secondNode < totalNodes) {
             componentManager.uniteComponents(firstNode, secondNode);
        } else {
            process.stderr.write(`Warning: Connection involves out-of-bounds nodes: (${firstNode + 1}, ${secondNode + 1}) for ${totalNodes} nodes. Skipping.\n`);
        }
    }

    // Calculate the number of distinct connected components
    let independentGroups = 0;
    // Iterate through all nodes to find roots, each root represents an independent component
    for (let nodeIterator = 0; nodeIterator < totalNodes; nodeIterator++) {
        // A component's root node is its own parent (indicated by a negative value in 'representativeNodes')
        if (componentManager.findRepresentative(nodeIterator) === nodeIterator) {
            independentGroups++;
        }
    }

    // Output the final count of distinct components to standard output
    process.stdout.write(String(independentGroups) + '\n');
}

/**
 * Represents a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * Manages a collection of disjoint sets, supporting 'find' and 'union' operations.
 * @param {number} initialSize - The initial number of elements, each in its own set.
 */
function DisjointSet(initialSize) {
    // Validate the input size for initialization
    if (initialSize < 0) {
        throw new Error("DisjointSet must be initialized with a non-negative size.");
    }
    // 'representativeNodes' array stores parent pointers. If `representativeNodes[i]` is negative,
    // 'i' is a root, and its absolute value is the size of the set.
    // Otherwise, `representativeNodes[i]` is the parent of 'i'.
    this.representativeNodes = Array(initialSize).fill(-1);
}

/**
 * Finds the representative (root) of the set containing 'elementIndex' with path compression.
 * @param {number} elementIndex - The index of the element to find the representative for.
 * @returns {number} The index of the representative of the set.
 * @throws {Error} If the elementIndex is out of bounds.
 */
DisjointSet.prototype.findRepresentative = function (elementIndex) {
    // Input validation for the element index
    if (elementIndex < 0 || elementIndex >= this.representativeNodes.length) {
        throw new Error(`Element index ${elementIndex} is out of bounds for DisjointSet of size ${this.representativeNodes.length}.`);
    }

    // If the element is a root (its value is negative), it is its own representative
    if (this.representativeNodes[elementIndex] < 0) {
        return elementIndex;
    }

    // Path compression: iteratively find the root and update parents along the way
    let currentElement = elementIndex;
    const pathNodes = []; // To store nodes on the path for compression

    // Traverse upwards until the root (a node with a negative value) is found
    while (this.representativeNodes[currentElement] >= 0) {
        pathNodes.push(currentElement); // Add node to path
        currentElement = this.representativeNodes[currentElement];
    }
    // 'currentElement' is now the root of the set

    // Path compression: update all nodes on the 'pathNodes' to point directly to the identified root
    for (const nodeOnPath of pathNodes) {
        this.representativeNodes[nodeOnPath] = currentElement;
    }

    return currentElement; // Return the identified root
};

/**
 * Merges the sets containing 'nodeOne' and 'nodeTwo' using union by size heuristic.
 * @param {number} nodeOne - The index of the first node.
 * @param {number} nodeTwo - The index of the second node.
 * @throws {Error} If either node index is out of bounds.
 */
DisjointSet.prototype.uniteComponents = function (nodeOne, nodeTwo) {
    // Input validation for node indices
    if (nodeOne < 0 || nodeOne >= this.representativeNodes.length ||
        nodeTwo < 0 || nodeTwo >= this.representativeNodes.length) {
        throw new Error(`Nodes (${nodeOne}, ${nodeTwo}) are out of bounds for DisjointSet of size ${this.representativeNodes.length}.`);
    }

    // Find the representatives (roots) of the sets for both nodes
    let rootOne = this.findRepresentative(nodeOne);
    let rootTwo = this.findRepresentative(nodeTwo);

    // If they are already in the same set, no union operation is needed
    if (rootOne === rootTwo) {
        return;
    }

    // Union by size heuristic: attach the smaller tree to the root of the larger tree.
    // The value at a root index (e.g., representativeNodes[rootOne]) is negative and
    // represents the negative of the set's size. A larger negative number (e.g., -5 is less than -2)
    // indicates a larger set.
    if (this.representativeNodes[rootOne] > this.representativeNodes[rootTwo]) {
        // If rootOne's set is smaller (less negative, e.g., -2 vs -5), swap to ensure rootOne is the root of the larger set
        let temporaryRoot = rootOne;
        rootOne = rootTwo;
        rootTwo = temporaryRoot;
    }

    // Merge the sets: add the size of rootTwo's set to rootOne's set
    // This effectively updates the size of the new combined set at rootOne.
    this.representativeNodes[rootOne] += this.representativeNodes[rootTwo];
    // Make rootTwo's representative point to rootOne, thereby merging the sets
    this.representativeNodes[rootTwo] = rootOne;
};

// The 'size' method for DisjointSet was not utilized in the main processing logic,
// and has been intentionally removed as a Type III modification (deletion of unused code).


// Entry point for execution: reads input from standard input and passes it to the main processing function
const fileSystem = require("fs");
try {
    const inputDataBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessConnectivityData(inputDataBuffer);
} catch (error) {
    process.stderr.write(`Failed to read input or process data: ${error.message}\n`);
    process.stdout.write('0\n'); // Output 0 in case of critical error
}