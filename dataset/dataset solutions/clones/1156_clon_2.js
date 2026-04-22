function ProcessInput(dataSource) {
    // This function acts as the primary orchestrator, handling input parsing
    // and delegating operations to the DisjointSet data structure.
    var lineFragments = dataSource.split("\n");

    // The initial line contains global configuration values, parsed numerically.
    var numericValues = lineFragments[0].split(" ");

    // The first parameter indicates the total count of distinct elements.
    var entityCount = parseInt(numericValues[0], 10);

    // The second parameter specifies the number of operations or inquiries.
    var queryCount = parseInt(numericValues[1], 10);

    // Create a collection to hold individual DisjointSet instances,
    // where each instance represents a unique element initially.
    const entityCollection = [];

    // Initialize each element with its own DisjointSet instance.
    for (let idx = 0; idx < entityCount; idx++) {
        entityCollection.push(new DisjointSet());
    }

    // A central DisjointSet object is used to perform the actual union/find operations.
    const disjointSetManager = new DisjointSet();

    // Iterate through each subsequent line, which represents an operation.
    for (let idx = 0; idx < queryCount; idx++) {
        // Parse the current operation line into its component parts.
        const instructionParts = lineFragments[idx + 1].split(" ");

        // Extract the two indices involved in the current operation.
        const firstIndex = parseInt(instructionParts[1], 10);
        const secondIndex = parseInt(instructionParts[2], 10);

        // Based on the operation code, decide whether to merge sets or check connectivity.
        if (instructionParts[0] === "0") {
            // Operation code "0" signifies a union (merge) command.
            disjointSetManager.mergeSets(entityCollection[firstIndex], entityCollection[secondIndex]);
        } else {
            // Any other operation code implies a connectivity check.
            console.log(disjointSetManager.areConnected(entityCollection[firstIndex], entityCollection[secondIndex]));
        }
    }
}


// The DisjointSet constructor defines the structure and methods
// for individual elements within the Disjoint Set data structure.
function DisjointSet() {
    // Each element initially points to itself, signifying it's the root of its own set.
    this.linkNode = this;

    // Each set begins with a single element.
    this.elementCount = 1;


    // Method to recursively find the representative (root) of the set
    // to which this element belongs.
    this.locateRoot = function() {
        // If this element is its own parent, it is the root.
        if (this.linkNode === this) {
            return this;
        } else {
            // Otherwise, traverse up the parent chain to find the root.
            return this.linkNode.locateRoot();
        }
    };


    // Method to combine the sets containing two given elements, 'nodeA' and 'nodeB'.
    this.mergeSets = function(nodeA, nodeB) {
        // First, find the roots of the sets for both elements.
        const rootA = nodeA.locateRoot();
        const rootB = nodeB.locateRoot();

        // If both elements already share the same root, they are in the same set,
        // so no merging is necessary.
        if (rootA === rootB) {
            return false; // Indicate that no merge occurred.
        } else {
            // Implement union by size: attach the smaller tree under the root of the larger tree.
            if (rootA.elementCount < rootB.elementCount) {
                rootA.linkNode = rootB; // Make rootB the parent of rootA.
                rootB.elementCount += rootA.elementCount; // Update the size of the combined set.
            } else {
                rootB.linkNode = rootA; // Make rootA the parent of rootB.
                rootA.elementCount += rootB.elementCount; // Update the size of the combined set.
            }
            return true; // Indicate a successful merge.
        }
    };


    // Method to determine if two elements, 'nodeA' and 'nodeB', are part of the same set.
    this.areConnected = function(nodeA, nodeB) {
        // Elements are connected if their respective roots are identical.
        if (nodeA.locateRoot() === nodeB.locateRoot()) {
            return true; // True if they belong to the same set.
        } else {
            return false; // False if they are in different sets.
        }
    };
}


// Initiate the processing by reading input from standard input and passing it
// to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));