"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// parameter "rawInput" gets all data
function SolveProblem(rawInput) {
    const { nodeCount, edgeCount, permutation, connections } = processInputData(rawInput);
    const partitions = SetPartitions.constructFrom(nodeCount, connections);

    // Count elements where permutation[i] is in the same set as (i + 1)
    const equivalentCount = permutation.reduce((count, currentVal, index) => {
        if (partitions.checkEquivalence(currentVal, index + 1)) {
            return count + 1;
        }
        return count;
    }, 0);

    // Output the count as a string
    return String(equivalentCount);
}
exports.SolveProblem = SolveProblem;

class SetPartitions {
    constructor(totalNodes) {
        // ancestors[i] stores the parent of node i. Initially, each node is its own parent.
        this.ancestors = Array.from({ length: totalNodes + 1 }, (_, idx) => idx);
        // sizes[i] stores the size of the set if i is a root. Used for union by size.
        this.sizes = Array(totalNodes + 1).fill(1);
    }

    static constructFrom(totalNodes, links) {
        const instance = new SetPartitions(totalNodes);
        for (const { firstNode, secondNode } of links) {
            instance.unite(firstNode, secondNode);
        }
        return instance;
    }

    // Finds the root of the set containing 'node', with path compression.
    locateRoot(node) {
        if (this.ancestors[node] === node) {
            return node;
        }
        // Path compression: make every node on the path point directly to the root
        this.ancestors[node] = this.locateRoot(this.ancestors[node]);
        return this.ancestors[node];
    }

    // Unites the sets containing 'nodeA' and 'nodeB' using union by size.
    unite(nodeA, nodeB) {
        let rootA = this.locateRoot(nodeA);
        let rootB = this.locateRoot(nodeB);

        if (rootA !== rootB) {
            // Attach smaller tree under root of larger tree
            if (this.sizes[rootA] < this.sizes[rootB]) {
                // Swap roots to ensure rootA is the root of the larger tree
                [rootA, rootB] = [rootB, rootA];
            }
            this.ancestors[rootB] = rootA; // Make rootA the parent of rootB
            this.sizes[rootA] += this.sizes[rootB]; // Update size of the new root's set
        }
    }

    // Checks if 'nodeA' and 'nodeB' belong to the same set.
    checkEquivalence(nodeA, nodeB) {
        return this.locateRoot(nodeA) === this.locateRoot(nodeB);
    }
}

function processInputData(rawInput) {
    const inputLines = rawInput.split("\n");

    // Parse the first line for N and M
    const [nodeCount, edgeCount] = inputLines[0].split(" ").map(Number);

    // Parse the second line for the permutation array p
    const permutation = inputLines[1].split(" ").map(Number);

    // Parse the remaining lines for xy pairs
    const connections = inputLines.slice(2).map(line => {
        const [firstNode, secondNode] = line.split(" ").map(Number);
        return { firstNode, secondNode };
    });

    return { nodeCount, edgeCount, permutation, connections };
}

function runChallenge(inputData) {
    console.log(SolveProblem(inputData));
}

// Don't edit this line!
try {
    runChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
    // ignore
}
