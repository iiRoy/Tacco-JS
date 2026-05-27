const fileSystem = require('fs');

const dataBuffer = fileSystem.readFileSync(process.stdin.fd);
const inputLines = dataBuffer.toString('utf8').split('\n');

function findHamiltonianCycle(nodeCount, adjacencyMatrix) {
    const dpTable = Array.from({ length: 1 << nodeCount }, () => Array(nodeCount).fill(false));

    // Base case: A path of length 1 exists from the starting node (node 0) to itself.
    // The bitmask `1 << 0` represents only node 0 being visited.
    dpTable[1 << 0][0] = true;

    // Iterate through all possible subsets of nodes (represented by bitmasks)
    for (let currentMask = 1; currentMask < (1 << nodeCount); currentMask++) {
        // Iterate through all possible last nodes in the current path
        for (let lastVisitedNode = 0; lastVisitedNode < nodeCount; lastVisitedNode++) {
            // If a path exists to 'lastVisitedNode' with the nodes in 'currentMask'
            if (dpTable[currentMask][lastVisitedNode]) {
                // Try to extend the path to an unvisited 'nextPotentialNode'
                for (let nextPotentialNode = 0; nextPotentialNode < nodeCount; nextPotentialNode++) {
                    // Check if 'nextPotentialNode' is not yet in the current mask (i.e., unvisited)
                    // and if there's an edge from 'lastVisitedNode' to 'nextPotentialNode'
                    if (!(currentMask & (1 << nextPotentialNode)) && adjacencyMatrix[lastVisitedNode][nextPotentialNode]) {
                        // Mark the new state as reachable: path visiting nodes in `currentMask | (1 << nextPotentialNode)`
                        // and ending at `nextPotentialNode`
                        dpTable[currentMask | (1 << nextPotentialNode)][nextPotentialNode] = true;
                    }
                }
            }
        }
    }

    // After filling the DP table, check for a Hamiltonian cycle
    // A cycle exists if there's a path visiting all nodes (mask = (1 << nodeCount) - 1)
    // ending at some 'lastVisitedNode', and there's an edge from 'lastVisitedNode' back to the starting node (0).
    const allNodesVisitedMask = (1 << nodeCount) - 1;
    for (let lastVisitedNode = 0; lastVisitedNode < nodeCount; lastVisitedNode++) {
        if (dpTable[allNodesVisitedMask][lastVisitedNode] && adjacencyMatrix[lastVisitedNode][0]) {
            return true; // Found a Hamiltonian cycle
        }
    }

    return false; // No Hamiltonian cycle found
}

(function processInputCases() {
    let currentInputLine;
    while ((currentInputLine = inputLines.shift()) !== '0') {
        const nodeCount = parseInt(currentInputLine, 10);
        
        const wordList = Array.from({ length: nodeCount }, () => inputLines.shift());

        // Build adjacency matrix from the word list
        const adjacencyMatrix = wordList.map((sourceWord, sourceIndex) => {
            const lastCharOfSource = sourceWord.slice(-1);
            return wordList.map((targetWord, targetIndex) => {
                // A word cannot connect to itself in this problem's context (distinct words in cycle)
                if (sourceIndex === targetIndex) return false;
                return lastCharOfSource === targetWord.charAt(0);
            });
        });

        console.log(findHamiltonianCycle(nodeCount, adjacencyMatrix) ? 'OK' : 'NG');
    }
})();
