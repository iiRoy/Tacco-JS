"use strict";Object.defineProperty(exports,"__esModule",{value:true});
// This function processes input data to determine connection counts.
function ProcessConnections(rawData) {
    // Initial parsing of the input string to extract core parameters.
    let { nodeCount, edgeCount, valueArray, connectionPairs } = interpretRawData(rawData);

    // Build a Union-Find data structure from the given connections.
    const unionFindStructure = UnionFind.constructFrom(nodeCount, connectionPairs);
    
    // Calculate the number of values that are in the same set as their index.
    let matchCount = valueArray.filter((currentVal, idx) => {
        // Indices are 1-based in the problem, so add 1 to `idx`.
        return unionFindStructure.areConnected(currentVal, idx + 1);
    }).length;

    // Output the final computed count.
    console.info(matchCount);
    
    // Return the calculated count.
    return matchCount;
}
exports.ProcessConnections = ProcessConnections;

// Represents a collection of disjoint sets, often called Union-Find.
class UnionFind {
    // Constructor for the UnionFind structure.
    constructor(nodeCollection) {
        this.nodeCollection = nodeCollection;
    }

    // Static method to create a UnionFind instance from initial parameters.
    static constructFrom(nodeCount, connectionPairs) {
        let nodeList = [];
        // Initialize each node as its own set.
        for (let k = 0; k <= nodeCount; ++k) {
            nodeList.push(new UnionFindNode());
        }

        // Apply all given connections to merge sets.
        connectionPairs.forEach(pair => {
            let { firstNode, secondNode } = pair;
            nodeList[firstNode].mergeSets(nodeList[secondNode]);
        });
        
        return new UnionFind(nodeList);
    }

    // Checks if two elements belong to the same set.
    areConnected(elementA, elementB) {
        return this.nodeCollection[elementA].isLinkedTo(this.nodeCollection[elementB]);
    }
}

// Represents an individual node within a Disjoint Set Tree (Union-Find).
class UnionFindNode {
    // Initializes a new node.
    constructor() {
        this.parentNode = this; // Each node initially points to itself as its parent.
        this.depthLevel = 0;    // Rank/depth for union by rank optimization.
    }

    // Determines if this node is in the same set as another node.
    isLinkedTo(anotherNode) {
        return this.locateRoot() === anotherNode.locateRoot();
    }

    // Merges the set containing this node with the set containing another node. (Union by rank)
    mergeSets(anotherNode) {
        let rootA = this.locateRoot();
        let rootB = anotherNode.locateRoot();

        // If they are not already in the same set, merge them.
        if (rootA !== rootB) {
            // Attach the smaller rank tree under the root of the larger rank tree.
            if (rootA.depthLevel < rootB.depthLevel) {
                [rootA, rootB] = [rootB, rootA]; // Swap roots to ensure rootA has greater or equal rank.
            }
            rootB.parentNode = rootA; // Make rootA the parent of rootB.
            // If ranks were equal, increment rank of the new root.
            if (rootB.depthLevel === rootA.depthLevel) {
                rootA.depthLevel++;
            }
        }
    }

    // Finds the representative (root) of the set this node belongs to. (Path compression)
    locateRoot() {
        try {
            // Recursively find the root, compressing the path along the way.
            if (this.parentNode !== this) {
                this.parentNode = this.parentNode.locateRoot();
            }
        } catch (err) {
            // Error handling, though unlikely in typical Union-Find usage.
        }
        return this.parentNode;
    }
}

// Parses the raw string input into structured data.
function interpretRawData(rawData) {
    const [firstLine, secondLine, ...remainingLines] = rawData.split("\n");
    const [nodeCount, edgeCount] = parseNumericSequence(firstLine);
    const valueArray = parseNumericSequence(secondLine);
    
    // Map remaining lines to connection pairs.
    const connectionPairs = remainingLines.map(currentLine => {
        const [firstNode, secondNode] = parseNumericSequence(currentLine);
        return { firstNode, secondNode };
    });
    
    return { nodeCount, edgeCount, valueArray, connectionPairs };
}

// Converts a space-separated string of numbers into an array of integers.
function parseNumericSequence(line) {
    return line.split(" ").map(Number);
}

// Standard execution block for competitive programming environments.
try {
    const fileSystem = getModule("fs");
    ProcessConnections(fileSystem.readTextFileSync("/std/input", "utf_8"));
} catch (err) {
    // Silently ignore errors during local execution or missing file.
}

// Simple alias for require for slight renaming.
function getModule(moduleName) {
    return require(moduleName);
}
//# sourceMappingURL=Equals.js.map