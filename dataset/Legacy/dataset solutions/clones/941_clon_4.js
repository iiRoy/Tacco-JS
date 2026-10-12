const inputReader = require('fs');
const rawInput = inputReader.readFileSync('/dev/stdin', 'utf8');

const lines = rawInput.trim().split('\n');
const nodeCount = Number(lines.shift());

let globalTimeCounter = 0;

// Adjacency list: 1-indexed for convenience, so index 0 is unused
const graphAdjacency = new Array(nodeCount + 1).fill(null).map(() => []);
const discoveryTimes = new Array(nodeCount + 1).fill(0);
const finishTimes = new Array(nodeCount + 1).fill(0);

function depthFirstSearch(startIdentifier, connections, entryRegistry, exitRegistry) {
    // Stack for iterative DFS. Each element is { id: nodeId, phase: 'discover' | 'finish' }
    const processingStack = [{ id: startIdentifier, phase: 'discover' }];

    while (processingStack.length > 0) {
        const currentOperation = processingStack.pop();
        const currentId = currentOperation.id;

        if (currentOperation.phase === 'discover') {
            // If already discovered, skip this path (part of another branch in the same component)
            if (entryRegistry[currentId] !== 0) {
                continue;
            }

            globalTimeCounter++;
            entryRegistry[currentId] = globalTimeCounter;

            // Push 'finish' phase for this node first, so it's processed after all children
            processingStack.push({ id: currentId, phase: 'finish' });

            // Get neighbors, sort them, and push them onto the stack in reverse order
            // so that the smallest ID is processed first (mimics original recursion order)
            const neighbors = connections[currentId];
            if (neighbors) {
                neighbors.sort((a, b) => a - b); // Sort numerically ascending
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    const neighborId = neighbors[i];
                    // Only push if not yet discovered (to avoid redundant stack entries for already visited nodes)
                    // The 'discover' check inside the loop handles cases where it's visited by another path
                    if (entryRegistry[neighborId] === 0) {
                        processingStack.push({ id: neighborId, phase: 'discover' });
                    }
                }
            }
        } else if (currentOperation.phase === 'finish') {
            globalTimeCounter++;
            exitRegistry[currentId] = globalTimeCounter;
        }
    }
}

lines.forEach((line) => {
    const parts = line.split(' ').map(Number);
    const parentId = parts[0];
    const childrenIds = parts.slice(2);
    graphAdjacency[parentId].push(...childrenIds);
});

// Iterate through all nodes to ensure all connected components are visited
for (let i = 1; i <= nodeCount; i++) {
    if (discoveryTimes[i] === 0) { // If not yet visited
        depthFirstSearch(i, graphAdjacency, discoveryTimes, finishTimes);
    }
}

// Print results
for (let i = 1; i <= nodeCount; i++) {
    console.log(`${i} ${discoveryTimes[i]} ${finishTimes[i]}`);
}
