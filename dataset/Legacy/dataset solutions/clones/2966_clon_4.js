var inputLines = [];
var standardReadline = require('readline');

var lineReader = standardReadline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

lineReader.on('close', function () {
    var totalNodes = Number(inputLines[0].split(" ")[0]);
    var totalEdges = Number(inputLines[0].split(" ")[1]);

    inputLines.shift(); // Remove the first line containing N and M

    var edgeData = inputLines.map(entry => entry.split(" ").map(val => Number(val)));

    // Disjoint Set Union (DSU) implementation
    class NodeGroupManager {
        constructor(nodeCount) {
            // parentRegistry[i] stores the parent of node i. If parentRegistry[i] === i, then i is a root.
            this.parentRegistry = Array(nodeCount).fill(0).map((_, idx) => idx);
            // Initially, each node is its own component.
            this.activeComponents = nodeCount; 
        }

        // Finds the representative (root) of the set containing element 'idx'
        // Uses path compression for optimization.
        locateRoot(idx) {
            if (this.parentRegistry[idx] === idx) {
                return idx;
            }
            this.parentRegistry[idx] = this.locateRoot(this.parentRegistry[idx]);
            return this.parentRegistry[idx];
        }

        // Merges the sets containing elements 'idxA' and 'idxB'
        // Returns true if a union occurred, false if they were already in the same set.
        uniteSets(idxA, idxB) {
            let rootA = this.locateRoot(idxA);
            let rootB = this.locateRoot(idxB);

            if (rootA !== rootB) {
                // Attach rootB's tree under rootA. (Simple union, not by rank/size)
                this.parentRegistry[rootB] = rootA; 
                // The number of distinct components decreases by one.
                this.activeComponents--; 
                return true; 
            }
            return false; 
        }
    }

    var graphManager = new NodeGroupManager(totalNodes);

    // Iterate through each edge and unite the nodes it connects.
    // The order of edges does not affect the final count of connected components.
    for (let k = 0; k < edgeData.length; k++) {
        let currentEdge = edgeData[k];
        let nodeOne = currentEdge[0] - 1; // Adjust to 0-indexed
        let nodeTwo = currentEdge[1] - 1; // Adjust to 0-indexed
        // The third value (currentEdge[2], often 'z') is ignored,
        // as it was not used in the original logic for component counting.
        
        graphManager.uniteSets(nodeOne, nodeTwo);
    }

    // The final count of active components is the answer.
    console.log(graphManager.activeComponents);
});
