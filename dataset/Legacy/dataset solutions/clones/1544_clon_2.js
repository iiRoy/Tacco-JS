var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/), tokenIndex = 0;

// Helper function to get the next numeric token from the input stream
function retrieveNextValue() {
    return +tokenizedInput[tokenIndex++];
}

/*
 * This class implements a Disjoint Set Union (DSU) data structure,
 * also known as Union-Find. It supports efficient operations for
 * merging sets and finding the representative of a set.
 */
var DisjointSet = /** @class */ (function () {
    function DisjointSet(elementCount) {
        this.parentArray = [];
        this.groupSizes = [];
        // Initialize each element as its own parent and set its group size to 1.
        for (var idx = 0; idx < elementCount; idx++) {
            this.parentArray.push(idx);
            this.groupSizes.push(1);
        }
        // Keep track of the total number of distinct sets.
        this.distinctSetsCount = elementCount;
    }

    // Finds the representative (root) of the set containing nodeVal.
    // Implements path compression for optimization.
    DisjointSet.prototype.find = function (nodeVal) {
        if (this.parentArray[nodeVal] === nodeVal) {
            return nodeVal;
        } else {
            // Recursively find the root and compress the path.
            var rootNode = this.find(this.parentArray[nodeVal]);
            this.parentArray[nodeVal] = rootNode; // Path compression
            return rootNode;
        }
    };

    // Merges the sets containing valA and valB.
    // Implements union by size for optimization.
    DisjointSet.prototype.unite = function (valA, valB) {
        var rootA = this.find(valA);
        var rootB = this.find(valB);

        // If they are already in the same set, do nothing.
        if (rootA === rootB) return;

        // Determine which root has the larger set to attach the smaller one to.
        var partition = this.groupSizes[rootA] >= this.groupSizes[rootB] ? [rootA, rootB] : [rootB, rootA];
        var largerRoot = partition[0];
        var smallerRoot = partition[1];

        // Attach the smaller tree under the root of the larger tree.
        this.parentArray[smallerRoot] = largerRoot;
        // Update the size of the larger tree.
        this.groupSizes[largerRoot] += this.groupSizes[smallerRoot];
        // One less distinct set after merging.
        this.distinctSetsCount--;
    };

    // Checks if itemA and itemB belong to the same set.
    DisjointSet.prototype.areInSameSet = function (itemA, itemB) {
        return this.find(itemA) === this.find(itemB);
    };

    return DisjointSet;
}());

// Main execution function
function executeProgram() {
    var totalElements = retrieveNextValue();
    var queryCount = retrieveNextValue();

    // Initialize the DisjointSet structure with the given number of elements.
    var ds = new DisjointSet(totalElements);

    // Process each query.
    while (queryCount--) {
        var operationType = retrieveNextValue();
        var firstOperand = retrieveNextValue();
        var secondOperand = retrieveNextValue();

        if (operationType === 0) {
            // Operation 0: Unite (merge) two sets.
            ds.unite(firstOperand, secondOperand);
        } else {
            // Operation 1: Check if two elements are in the same set.
            if (ds.areInSameSet(firstOperand, secondOperand)) {
                console.log(1); // Output 1 if they are in the same set.
            } else {
                console.log(0); // Output 0 if they are in different sets.
            }
        }
    }
    return;
}

// Start the program execution.
executeProgram();
