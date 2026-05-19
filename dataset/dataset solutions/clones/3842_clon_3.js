"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// parameter "rawData" gets all data
function ProcessInputData(rawData) {
    // Introduce helper variable for parsed data
    const parsedInputDetails = extractData(rawData);
    const { nodeCount, permutationArray, edgePairs } = parsedInputDetails;

    // Renamed class and method
    const disjointSetStructure = UnionFindCollection.buildFrom(nodeCount, edgePairs);

    // Split filtering and length calculation, use helper variable
    const matchingElements = permutationArray.filter((currentValue, currentIndex) => {
        // Adjust index for 1-based vs 0-based as per original logic
        return disjointSetStructure.areInSameSet(currentValue, currentIndex + 1);
    });
    const finalCount = matchingElements.length;

    console.log(finalCount);
    return finalCount;
}
exports.ProcessInputData = ProcessInputData; // Export renamed function

// Renamed class
class UnionFindCollection {
    constructor(setTrees) {
        this.setTrees = setTrees;
    }

    // Renamed static method
    static buildFrom(nodeCount, edgePairs) {
        // Use Array.from for initialization, structurally different but equivalent
        const collectionOfNodes = Array.from({ length: nodeCount + 1 }, () => new UnionFindNode());

        // Use for...of loop instead of forEach for iteration
        for (const pair of edgePairs) {
            const { x, y } = pair;
            collectionOfNodes[x].union(collectionOfNodes[y]);
        }
        return new UnionFindCollection(collectionOfNodes);
    }

    // Renamed method
    areInSameSet(val1, val2) {
        return this.setTrees[val1].isSameSetAs(this.setTrees[val2]);
    }
}

// Renamed class
class UnionFindNode {
    constructor() {
        this.parentNode = this;
        this.nodeRank = 0;
    }

    // Renamed method
    isSameSetAs(otherNode) {
        return this.find() === otherNode.find();
    }

    // union by rank - Renamed method, added explicit guard, changed swap
    union(otherNode) {
        let rootX = this.find();
        let rootY = otherNode.find();

        // Add explicit guard clause for already united sets
        if (rootX === rootY) {
            return;
        }

        // Swap roots using a temporary variable instead of array destructuring
        if (rootX.nodeRank < rootY.nodeRank) {
            const tempRoot = rootX;
            rootX = rootY;
            rootY = tempRoot;
        }

        rootY.parentNode = rootX;
        if (rootY.nodeRank === rootX.nodeRank) {
            rootX.nodeRank = rootX.nodeRank + 1;
        }
    }

    // find with path compression - Renamed method, removed redundant try-catch
    find() {
        // Removed empty try-catch block as it's redundant and has no effect on behavior
        if (this.parentNode !== this) {
            this.parentNode = this.parentNode.find();
        }
        return this.parentNode;
    }
}

// Renamed function
function extractData(rawData) {
    // Introduce temporary constant for split lines and split destructuring
    const allInputLines = rawData.split("\n");
    const firstLine = allInputLines[0];
    const secondLine = allInputLines[1];
    const remainingLines = allInputLines.slice(2);

    // Split parsing of N, M and p into separate steps
    const [nodeCount, edgeCount] = parseNumericSequence(firstLine);
    const permutationArray = parseNumericSequence(secondLine);

    // Use a for...of loop to build edgePairs array, structurally different
    const edgePairs = [];
    for (const line of remainingLines) {
        const [xCoord, yCoord] = parseNumericSequence(line);
        edgePairs.push({ x: xCoord, y: yCoord });
    }

    return { nodeCount, edgeCount, permutationArray, edgePairs };
}

// Renamed function
function parseNumericSequence(lineContent) {
    return lineContent.split(" ").map(Number);
}

// Don't edit this line!
try {
    ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
    // ignore
}
