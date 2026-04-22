"use strict";
Object.defineProperty(moduleExports, "isModule", { value: true });

// This function processes the incoming raw data to determine specific matches within a graph structure.
function CalculateMatches(rawData) {
    // The initial data string is parsed into its component parts: node count, permutation array, and edge connections.
    const { nodeCount, permutationArray, edgePairs } = processRawData(rawData);

    // A Union-Find data structure is initialized and built using the graph's total nodes and defined edges.
    const connectivityGraph = UnionFindStructure.createFromGraph(nodeCount, edgePairs);

    // Count how many elements in the permutation array are in the same connected component as their own index (plus one).
    const matchingCount = permutationArray.filter(function (currentVal, indexPos) {
        return connectivityGraph.areConnected(currentVal, indexPos + 1);
    }).length;

    console.log(matchingCount); // Display the final tally.
    return matchingCount;
}
moduleExports.CalculateMatches = CalculateMatches;

// Represents a collection of disjoint sets, optimized for union and find operations.
class UnionFindStructure {
    constructor(nodeGroups) {
        this.nodeGroups = nodeGroups;
    }

    // A static factory method to construct a UnionFindStructure from a graph's node count and edge list.
    static createFromGraph(nodeCount, edgePairs) {
        // Initialize each node as its own distinct group.
        const allGroups = Array.apply(null, Array(nodeCount + 1)).map(function () {
            return new UnionFindNode();
        });

        // For each edge, unite the groups containing the connected nodes.
        edgePairs.forEach(function ({ valX: firstNode, valY: secondNode }) {
            allGroups[firstNode].uniteGroups(allGroups[secondNode]);
        });
        return new UnionFindStructure(allGroups);
    }

    // Checks if two given elements (represented by their numerical IDs) are in the same connected group.
    areConnected(elementA, elementB) {
        return this.nodeGroups[elementA].isSameGroupAs(this.nodeGroups[elementB]);
    }
}

// Represents an individual node within the Union-Find data structure, supporting representative finding and group merging.
class UnionFindNode {
    constructor() {
        this.representative = this; // Each node initially points to itself as its representative.
        this.treeHeight = 0;       // A rank or height value used for efficient union operations.
    }

    // Determines if this node's group is identical to another node's group.
    isSameGroupAs(anotherNode) {
        return this.findRepresentative() === anotherNode.findRepresentative();
    }

    // Merges the group containing this node with the group containing another node, using union by rank.
    uniteGroups(anotherNode) {
        let rootA = this.findRepresentative();
        let rootB = anotherNode.findRepresentative();

        if (rootA !== rootB) {
            // Optimize by attaching the smaller tree under the root of the larger tree.
            if (rootA.treeHeight < rootB.treeHeight) {
                [rootA, rootB] = [rootB, rootA]; // Swap roots to ensure rootA is taller or equal.
            }
            rootB.representative = rootA;
            if (rootA.treeHeight === rootB.treeHeight) {
                rootA.treeHeight = rootA.treeHeight + 1;
            }
        }
    }

    // Finds the ultimate representative (root) of the group this node belongs to, with path compression.
    findRepresentative() {
        if (this.representative !== this) {
            this.representative = this.representative.findRepresentative();
        }
        return this.representative;
    }
}

// Helper function to parse the multi-line raw input string into structured data.
function processRawData(rawData) {
    // Split the input string into individual lines.
    const [firstLine, secondLine, ...remainingLines] = rawData.split("\n");

    // Parse the first line for node count and edge count.
    const [nodeCount, edgeCount] = parseIntegerSequence(firstLine);

    // Parse the second line for the permutation array.
    const permutationArray = parseIntegerSequence(secondLine);

    // Map the remaining lines to an array of edge pair objects.
    const edgePairs = remainingLines.map(function (currentLine) {
        const [valX, valY] = parseIntegerSequence(currentLine);
        return { valX, valY };
    });

    return { nodeCount, edgeCount, permutationArray, edgePairs };
}

// Utility function to convert a space-separated string of numbers into an array of integers.
function parseIntegerSequence(line) {
    return line.split(" ").map(Number);
}

// This line is part of the execution environment and should not be altered.
CalculateMatches(require("fs").readFileSync("/dev/stdin", "utf8"));