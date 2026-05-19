"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// This function processes the main input data to determine a count.
function ProcessMainData(dataInput) {
    // The initial lines of the input string are parsed to extract key parameters.
    const {
        numElements: N_val,
        numPairs: M_val,
        permutationArray: P_arr,
        connectionPairs: XY_coords
    } = ExtractInputDetails(dataInput);

    // A collection of disjoint sets is constructed based on the number of elements and connection pairs.
    const unionFindStructure = UnionFindCollection.createFromData(N_val, XY_coords);

    // The output is the count of elements in the permutation array that are in the same set as their index.
    return P_arr.filter((currentVal, idx) => {
        // Note: indices are 0-based, but problem often uses 1-based numbering for elements.
        return unionFindStructure.areConnected(currentVal, idx + 1);
    }).length.toString();
}
exports.Equals = ProcessMainData; // The original function 'Equals' is exported under its original name.

// Represents a collection of disjoint sets, often called a Union-Find data structure.
class UnionFindCollection {
    // Public field to hold the individual tree nodes.
    nodeList;

    constructor(treeNodes) {
        this.nodeList = treeNodes;
    }

    // Static factory method to build a UnionFindCollection from initial data.
    static createFromData(elementCount, linkPairs) {
        // Initialize an array of UFNode objects, one for each element (1-indexed).
        const nodeList = Array.from({ length: elementCount + 1 }, () => new UFNode());

        // Iterate through the provided pairs and unite the sets containing them.
        linkPairs.forEach(({ firstEl, secondEl }) => {
            nodeList[firstEl].uniteWith(nodeList[secondEl]);
        });

        return new UnionFindCollection(nodeList);
    }

    // Checks if two numerical values belong to the same set.
    areConnected(valA, valB) {
        return this.nodeList[valA].isLinkedTo(this.nodeList[valB]);
    }
}

// Represents a single node in a Disjoint Set Union (DSU) tree.
class UFNode {
    // Reference to the parent node in the tree. Initially, a node is its own parent.
    parentNode;
    // Rank of the tree, used for union-by-rank optimization.
    nodeRank;

    constructor() {
        this.parentNode = this; // Each node is initially its own root.
        this.nodeRank = 0;      // Initial rank is zero.
    }

    // Determines if this node is in the same set as another node.
    isLinkedTo(otherNode) {
        return this.findRoot() === otherNode.findRoot();
    }

    // Performs the union operation on two sets, using union-by-rank heuristic.
    uniteWith(otherNode) {
        let rootX = this.findRoot();
        let rootY = otherNode.findRoot();

        // If the roots are different, they belong to different sets, so unite them.
        if (rootX !== rootY) {
            // Attach the smaller rank tree under the root of the larger rank tree.
            if (rootX.nodeRank < rootY.nodeRank) {
                [rootX, rootY] = [rootY, rootX]; // Swap to ensure rootX has greater or equal rank.
            }
            rootY.parentNode = rootX; // Make rootX the parent of rootY.

            // If ranks were equal, increment the rank of the new root.
            if (rootY.nodeRank === rootX.nodeRank) {
                rootX.nodeRank = rootX.nodeRank + 1;
            }
        }
    }

    // Finds the root of the set to which this node belongs, with path compression.
    findRoot() {
        // If this node is not its own parent, it's not the root.
        if (this.parentNode !== this) {
            // Recursively find the root and perform path compression.
            this.parentNode = this.parentNode.findRoot();
        }
        return this.parentNode; // Return the root.
    }
}

// Parses the raw input string into structured data.
function ExtractInputDetails(rawData) {
    // Split the input string into lines.
    const [firstLineStr, secondLineStr, ...remainingLines] = rawData.split("\n");

    // Parse the first line for N and M values.
    const [countN, countM] = parseNumericStrings(firstLineStr);
    // Parse the second line for the permutation array.
    const permArray = parseNumericStrings(secondLineStr);

    // Map the remaining lines to an array of coordinate pairs.
    const coordPairs = remainingLines.map((currentLine) => {
        const [coordX, coordY] = parseNumericStrings(currentLine);
        return { firstEl: coordX, secondEl: coordY }; // Renamed x, y to firstEl, secondEl
    });

    return {
        numElements: countN,
        numPairs: countM,
        permutationArray: permArray,
        connectionPairs: coordPairs
    };
}

// Helper function to parse a space-separated string of numbers into an array of integers.
function parseNumericStrings(inputLine) {
    return inputLine.split(" ").map(Number);
}

// Main entry point for the AtCoder platform.
function atCoderChallenge(challengeInput) {
    console.log(ProcessMainData(challengeInput));
}

// Standard boilerplate for reading input in AtCoder environment.
try {
    atCoderChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (errorObject) {
    // Silently ignore errors, typically for local testing without stdin.
}
