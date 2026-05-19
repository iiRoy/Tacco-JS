"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This function processes the entire input string to determine a specific count.
function ProcessData(rawData) {
    // The initial lines of the input are parsed into structured variables.
    var parsedData = processRawData(rawData);
    var nodeCount = parsedData.nodeCount, permutationArray = parsedData.permutationArray, edgeList = parsedData.edgeList;
    // A Union-Find data structure is initialized based on the graph's nodes and edges.
    var connectedComponents = UnionFindStructure.createFromGraph(nodeCount, edgeList);
    // We count how many elements in the permutation array are in the same connected component
    // as their corresponding index (1-based).
    var matchingElements = permutationArray.filter(function (elementValue, currentIndex) {
        // Check if the value at `elementValue` is in the same set as `currentIndex + 1`.
        return connectedComponents.checkSameComponent(elementValue, currentIndex + 1);
    }).length;
    // The final count is printed to the console.
    console.log(matchingElements);
    // The calculated count is also returned.
    return matchingElements;
}
exports.ProcessData = ProcessData;
// Represents a collection of disjoint sets, implemented using a Union-Find algorithm.
var UnionFindStructure = /** @class */ (function () {
    // Constructor takes an array of UnionFindNode instances.
    function UnionFindStructure(componentRoots) {
        this.componentRoots = componentRoots;
    }
    // Static method to construct a UnionFindStructure from graph data.
    UnionFindStructure.createFromGraph = function (totalNodes, connections) {
        var rootNodes = [];
        // Initialize each node with its own disjoint set.
        for (var idx = 0; idx <= totalNodes; ++idx) {
            rootNodes.push(new UnionFindNode());
        }
        // Iterate through connections and merge their respective sets.
        connections.forEach(function (connectionPair) {
            var firstNode = connectionPair.coordX, secondNode = connectionPair.coordY;
            return rootNodes[firstNode].mergeComponents(rootNodes[secondNode]);
        });
        return new UnionFindStructure(rootNodes);
    };
    // Checks if two given numbers (representing nodes) belong to the same set.
    UnionFindStructure.prototype.checkSameComponent = function (valA, valB) {
        return this.componentRoots[valA].isLinkedTo(this.componentRoots[valB]);
    };
    return UnionFindStructure;
}());
// Represents a single node within a Disjoint Set (Union-Find) data structure.
var UnionFindNode = /** @class */ (function () {
    // Initializes a new node, setting itself as its own parent and rank to 0.
    function UnionFindNode() {
        this.representative = this;
        this.depth = 0;
    }
    // Determines if this node is in the same set as another node.
    UnionFindNode.prototype.isLinkedTo = function (anotherNode) {
        return this.findRepresentative() === anotherNode.findRepresentative();
    };
    // Merges the set containing this node with the set containing the target node.
    // Uses union by rank heuristic.
    UnionFindNode.prototype.mergeComponents = function (targetNode) {
        var tempSwap;
        var rootA = this.findRepresentative();
        var rootB = targetNode.findRepresentative();
        // Only merge if they are in different sets.
        if (rootA !== rootB) {
            // Attach the smaller rank tree under the root of the larger rank tree.
            if (rootA.depth < rootB.depth) {
                tempSwap = [rootB, rootA], rootA = tempSwap[0], rootB = tempSwap[1];
            }
            rootB.representative = rootA;
            // If ranks were equal, increment the rank of the new root.
            if (rootB.depth === rootA.depth) {
                rootA.depth = rootA.depth + 1;
            }
        }
    };
    // Finds the representative (root) of the set this node belongs to.
    // Implements path compression.
    UnionFindNode.prototype.findRepresentative = function () {
        try {
            // If this node is not its own parent, recursively find the root and compress the path.
            if (this.representative !== this) {
                this.representative = this.representative.findRepresentative();
            }
        }
        catch (errorDetails) {
            // Error handling, though typically not expected in a well-formed structure.
        }
        return this.representative;
    };
    return UnionFindNode;
}());
// Parses the raw input string into structured data.
function processRawData(sourceText) {
    var lineSegments = sourceText.split("\n"), firstLine = lineSegments[0], secondLine = lineSegments[1], remainingLines = lineSegments.slice(2);
    var parsedCounts = extractNumbersFromString(firstLine), nodeCount = parsedCounts[0], edgeCount = parsedCounts[1];
    var permutationArray = extractNumbersFromString(secondLine);
    var edgeList = remainingLines.map(function (currentLine) {
        var coords = extractNumbersFromString(currentLine), coordX = coords[0], coordY = coords[1];
        return { coordX: coordX, coordY: coordY };
    });
    return { nodeCount: nodeCount, edgeCount: edgeCount, permutationArray: permutationArray, edgeList: edgeList };
}
// Helper function to parse a space-separated string of numbers into an array of numbers.
function extractNumbersFromString(textLine) {
    return textLine.split(" ").map(Number);
}
// Do not modify this section! It handles input from standard input.
try {
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
    // Any errors during input reading are ignored.
}
