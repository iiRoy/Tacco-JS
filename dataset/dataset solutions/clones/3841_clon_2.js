"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// This function processes the entire input string to find a specific count.
function ProcessData(rawData) {
    // Deconstructs the parsed input into relevant variables: node count, permutation array, and connection pairs.
    const { nodeCount, permutationArray, connectionPairs } = parseRawInput(rawData);

    // Initializes a Disjoint Set Union (DSU) structure based on the given nodes and connections.
    const disjointSetCollection = UnionFindStructure.createFrom(nodeCount, connectionPairs);

    // Calculates the number of elements in the permutation array that are in the same set as their 1-indexed position.
    let matchingCount = permutationArray.filter((currentNumber, currentIndex) => {
        // Checks if the current number from the permutation array is in the same set as its 1-based index.
        return disjointSetCollection.checkSameSet(currentNumber, currentIndex + 1);
    }).length;

    // Outputs the final calculated count to the console.
    console.log(matchingCount);

    // Returns the computed count.
    return matchingCount;
}
exports.ProcessData = ProcessData;

var UnionFindStructure = /** @class */ (function () {
    // Constructor for the UnionFindStructure, taking an array of UnionFindNode instances.
    function UnionFindStructure(setTrees) {
        this.internalSetTrees = setTrees; // Stores the array of individual set nodes.
    }

    // Static method to construct a UnionFindStructure from initial node count and connection pairs.
    UnionFindStructure.createFrom = function (nodeCount, connectionPairs) {
        // Creates an array of `nodeCount + 1` UnionFindNode instances, indexed from 1.
        const setTrees = Array.apply(this, Array(nodeCount + 1)).map(() => new UnionFindNode());

        // Iterates through each connection pair to perform union operations.
        connectionPairs.forEach((pair) => {
            const { coordX, coordY } = pair; // Destructures the x and y coordinates from the pair.
            setTrees[coordX].uniteSets(setTrees[coordY]); // Unites the sets containing coordX and coordY.
        });

        // Returns a new UnionFindStructure instance initialized with the constructed set trees.
        return new UnionFindStructure(setTrees);
    };

    // Checks if two given numbers (nodes) belong to the same disjoint set.
    UnionFindStructure.prototype.checkSameSet = function (valA, valB) {
        // Finds the root of the set for valA and valB and compares them.
        return this.internalSetTrees[valA].isIdenticalSet(this.internalSetTrees[valB]);
    };

    return UnionFindStructure;
}());

var UnionFindNode = /** @class */ (function () {
    // Initializes a new UnionFindNode. Each node is initially its own parent and has a rank of 0.
    function UnionFindNode() {
        this.parentNode = this; // The parent of this node, initially itself.
        this.nodeRank = 0;     // The rank of this node, used for union by rank optimization.
    }

    // Determines if this node belongs to the same set as another node.
    UnionFindNode.prototype.isIdenticalSet = function (anotherNode) {
        // Compares the roots of the sets to which both nodes belong.
        return this.findRoot() === anotherNode.findRoot();
    };

    // Performs a union operation on the sets containing this node and another node, using union by rank heuristic.
    UnionFindNode.prototype.uniteSets = function (anotherNode) {
        let tempSwap; // Temporary variable for swapping roots if needed.

        let rootX = this.findRoot();       // Finds the root of the set containing 'this' node.
        let rootY = anotherNode.findRoot(); // Finds the root of the set containing 'anotherNode'.

        // If the roots are different, the nodes are in different sets, so perform a union.
        if (rootX !== rootY) {
            // Attach the smaller rank tree under the root of the larger rank tree.
            if (rootX.nodeRank < rootY.nodeRank) {
                tempSwap = rootX; // Store rootX temporarily.
                rootX = rootY;    // Assign rootY to rootX.
                rootY = tempSwap; // Assign stored rootX (original rootX) to rootY.
            }
            // Make rootX the parent of rootY.
            rootY.parentNode = rootX;
            // If ranks were equal, increment the rank of the new root.
            if (rootY.nodeRank === rootX.nodeRank) {
                rootX.nodeRank = rootX.nodeRank + 1;
            }
        }
    };

    // Finds the root of the set to which this node belongs, with path compression.
    UnionFindNode.prototype.findRoot = function () {
        // If this node is not its own parent, recursively find the root and apply path compression.
        if (this.parentNode !== this) {
            this.parentNode = this.parentNode.findRoot();
        }
        return this.parentNode; // Returns the ultimate parent (root) of the set.
    };

    return UnionFindNode;
}());

// Parses the raw input string into structured data.
function parseRawInput(rawData) {
    // Splits the input string by newline characters.
    const [firstLine, secondLine, ...remainingLines] = rawData.split("\n");

    // Parses the first line to get the node count (N) and edge count (M).
    const [nodeCount, edgeCount] = parseNumericString(firstLine);

    // Parses the second line to get the permutation array.
    const permutationArray = parseNumericString(secondLine);

    // Maps the remaining lines to an array of connection objects {x, y}.
    const connectionPairs = remainingLines.map((currentLine) => {
        const [coordX, coordY] = parseNumericString(currentLine); // Parses x and y coordinates from the line.
        return { coordX: coordX, coordY: coordY }; // Returns an object with renamed properties.
    });

    // Returns an object containing all parsed data.
    return { nodeCount: nodeCount, edgeCount: edgeCount, permutationArray: permutationArray, connectionPairs: connectionPairs };
}

// Helper function to parse a space-separated string of integers into an array of numbers.
function parseNumericString(inputString) {
    return inputString.split(" ").map(Number);
}

// Entry point for execution: Reads input from stdin and processes it using the main function.
// This line should not be modified as it's an external contract/API call.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
