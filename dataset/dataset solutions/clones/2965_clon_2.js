function ProcessInput(rawData) {
    // Clean up the raw input string and parse it into an array of arrays.
    rawData = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract the number of nodes (N) and edges (M) from the first line.
    let nodeCount = parseInt(rawData[0][0], 10);
    let edgeCount = parseInt(rawData[0][1], 10);

    // Initialize a DisjointSet data structure with 'nodeCount' elements.
    var disjointSet = new DisjointSet(nodeCount);
    let currentEdge; // Variable to hold parsed edge data.

    // Iterate through each edge provided in the input.
    for (let k = 0; k < edgeCount; k++) {
        // Parse the current edge's endpoints from string to integer.
        currentEdge = rawData[k + 1].map(e => parseInt(e, 10));

        // Perform a union operation on the two nodes of the current edge.
        // Adjusting for 0-based indexing.
        disjointSet.uniteSets(currentEdge[0] - 1, currentEdge[1] - 1);
    }

    let componentCount = 0; // Counter for the number of distinct connected components.

    // Iterate through all nodes to find the number of unique roots.
    for (let k = 0; k < nodeCount; k++) {
        // If a node is its own parent, it is a root of a component.
        if (disjointSet.locateRoot(k) === k) {
            componentCount++;
        }
    }
    // Output the final count of connected components.
    console.log(componentCount);
}

// DisjointSet (Union-Find) data structure implementation.
function DisjointSet(elementCount) {
    this.parentArray = []; // Stores parent of each element, or negative size if root.
    // Initialize each element as its own root with a size of 1 (represented as -1).
    for (let k = 0; k < elementCount; k++) {
        this.parentArray.push(-1);
    }
}

// Finds the representative (root) of the set containing elementA, with path compression.
DisjointSet.prototype.locateRoot = function(elementA) {
    // If elementA is a root (negative value indicates size of set), return it.
    if (this.parentArray[elementA] < 0) {
        return elementA;
    }
    // Otherwise, recursively find the root and compress the path.
    return this.parentArray[elementA] = this.locateRoot(this.parentArray[elementA]);
}

// Unites the sets containing elementA and elementB, using union by size.
DisjointSet.prototype.uniteSets = function(elementA, elementB) {
    // Find the roots of the sets containing elementA and elementB.
    elementA = this.locateRoot(elementA);
    elementB = this.locateRoot(elementB);

    // If they are already in the same set, do nothing.
    if (elementA === elementB) {
        return;
    }

    // Union by size: attach the smaller tree under the root of the larger tree.
    // If elementA's tree is smaller (more negative parentArray value means larger size), swap.
    if (this.parentArray[elementA] > this.parentArray[elementB]) {
        [elementA, elementB] = [elementB, elementA]; // Swap roots
    }

    // Update the size of the new root (elementA).
    this.parentArray[elementA] += this.parentArray[elementB];
    // Set elementB's root to elementA.
    this.parentArray[elementB] = elementA;
}

// Calculates the size of the component containing elementA.
DisjointSet.prototype.getComponentSize = function(elementA) {
    // Find the root of the component.
    elementA = this.locateRoot(elementA);
    // The size is stored as a negative value at the root.
    return this.parentArray[elementA] * -1;
}

// Execute the main processing function by reading input from stdin.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
