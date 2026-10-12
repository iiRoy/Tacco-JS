function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    var lineSegments = rawData.split("\n");

    // Parse the first line to get the number of nodes and queries
    var initialValues = lineSegments[0].split(" ");
    var nodeCount = parseInt(initialValues[0], 10); // Total number of elements
    var queryCount = parseInt(initialValues[1], 10); // Number of operations to perform

    // Initialize an array to hold individual DisjointSet instances for each node
    var nodeGroups = new Array();
    // Populate the array with new DisjointSet objects
    for (let idx = 0; idx < nodeCount; idx++) {
        nodeGroups.push(new DisjointSet());
    }

    // Create a single DisjointSet manager instance to handle union/find operations
    var disjointSetManager = new DisjointSet();

    // Process each query
    for (let idx = 0; idx < queryCount; idx++) {
        // Split the current query line into command parts
        var operationDetails = lineSegments[idx + 1].split(" ");
        // Parse the node indices involved in the operation
        var firstNodeIndex = parseInt(operationDetails[1], 10);
        var secondNodeIndex = parseInt(operationDetails[2], 10);

        // Check the type of operation
        if (operationDetails[0] === "0") { // If it's a union operation
            // Unite the sets containing the two nodes
            disjointSetManager.unionSets(nodeGroups[firstNodeIndex], nodeGroups[secondNodeIndex]);
        } else { // If it's a 'same set' query
            // Check if the two nodes belong to the same set and print the result
            console.log(disjointSetManager.areConnected(nodeGroups[firstNodeIndex], nodeGroups[secondNodeIndex]));
        }
    }
}

// Constructor function for a Disjoint Set (Union-Find) element
function DisjointSet() {
    // Each element initially points to itself as its representative
    this.representative = this;
    // Each element initially forms a set of size 1
    this.groupSize = 1;

    // Method to find the representative (root) of the set this element belongs to
    this.findRepresentative = function() {
        // If this element is its own representative, it's the root
        if (this.representative === this) {
            return this;
        } else {
            // Otherwise, recursively find the representative of its parent
            return this.representative.findRepresentative();
        }
    };

    // Method to unite two sets containing elements 'elementA' and 'elementB'
    this.unionSets = function(elementA, elementB) {
        // Find the representatives of the sets containing elementA and elementB
        var repA = elementA.findRepresentative();
        var repB = elementB.findRepresentative();

        // If they already have the same representative, they are in the same set
        if (repA === repB) {
            return false; // No union performed
        } else {
            // Otherwise, unite the two sets based on their sizes (union by size heuristic)
            if (repA.groupSize < repB.groupSize) {
                repA.representative = repB; // Make repB the parent of repA
                repB.groupSize += repA.groupSize; // Update the size of the new larger set
            } else {
                repB.representative = repA; // Make repA the parent of repB
                repA.groupSize += repB.groupSize; // Update the size of the new larger set
            }
            return true; // Union performed successfully
        }
    };

    // Method to check if two elements belong to the same set
    this.areConnected = function(elementA, elementB) {
        // Compare the representatives of the sets containing elementA and elementB
        if (elementA.findRepresentative() === elementB.findRepresentative()) {
            return 1; // They are in the same set
        } else {
            return 0; // They are in different sets
        }
    };
}

// Execute the main processing function by reading input from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
